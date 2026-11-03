import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import type { CommerceService } from './commerce/service.ts';
import { createCommerceHandler } from './commerce/http.ts';
import { createAssistantHandler } from './assistant-http.ts';
import type { AssistantConfig } from './assistant-http.ts';

const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
export function inside(root:string,target:string){const relative=path.relative(root,target);return relative==='' || (!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
export function createApp(service:CommerceService,assistant:AssistantConfig,buildDirectory=path.resolve('build')) {
  const commerce=createCommerceHandler(service), f4=createAssistantHandler(assistant);
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('X-Frame-Options','DENY');
    const fail=(status:number)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(status===404?'Não encontrado.':'Solicitação inválida.');};
    try {
      const url=new URL(req.url || '/','http://local.invalid');
      if(url.pathname==='/api/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"status":"ok"}');return;}
      if(url.pathname.startsWith('/api/loja/')){await commerce(req,res);return;}
      if(url.pathname==='/api/assistente-local'){await f4(req,res);return;}
      if(url.pathname.startsWith('/api/')){fail(404);return;}
      if(req.method!=='GET'&&req.method!=='HEAD'){fail(405);return;}
      const pathname=decodeURIComponent(url.pathname);
      if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(p=>p.startsWith('.'))){fail(404);return;}
      // Apenas rotas conhecidas recebem fallback. Servidor, fontes e segredos nunca são raiz estática.
      const route=['/','/livros','/livros/','/compra','/compra/'].includes(pathname);
      if(!route&&!pathname.startsWith('/assets/')&&!['/favicon.ico','/sts-favicon.png','/robots.txt'].includes(pathname)){fail(404);return;}
      const root=await realpath(buildDirectory);
      const filename=await realpath(path.resolve(root,route?'index.html':'.'+pathname));
      if(!inside(root,filename)){fail(404);return;}
      const info=await stat(filename),type=mime[path.extname(filename).toLowerCase()];
      if(!info.isFile()||!type){fail(404);return;}
      res.setHeader('Content-Type',type);res.setHeader('Cache-Control',route?'no-cache':'public, max-age=3600');
      res.setHeader('Accept-Ranges','bytes');
      let start=0,end=info.size-1,status=200;
      if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match || (!match[1]&&!match[2])){res.setHeader('Content-Range',`bytes */${info.size}`);fail(416);return;}
        if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}else start=Math.max(0,info.size-Number(match[2]));
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size){res.setHeader('Content-Range',`bytes */${info.size}`);fail(416);return;}
        status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
      }
      res.setHeader('Content-Length',end-start+1);res.writeHead(status);
      if(req.method==='HEAD'){res.end();return;}
      const stream=createReadStream(filename,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
    } catch {if(!res.headersSent)fail(404);else res.destroy();}
  });
  server.requestTimeout=20_000;server.headersTimeout=10_000;
  return server;
}
