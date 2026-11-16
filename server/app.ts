import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import type { CommerceService } from './commerce/service.ts';
import {assertPolicy, denyLegacyOperation} from './access-policy.ts';
import type {AccessPolicy} from './access-policy.ts';
import { createAssistantHandler } from './assistant-http.ts';
import type { AssistantConfig } from './assistant-http.ts';

const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
export function inside(root:string,target:string){const relative=path.relative(root,target);return relative==='' || (!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
export function createApp(service:CommerceService,assistant:AssistantConfig,buildDirectory=path.resolve('build')):ReturnType<typeof createServer> {
  denyLegacyOperation();
  throw Error('LEGACY_OPERATION_DISABLED');
}

export function createPendingApp(buildDirectory=path.resolve('build'), commerceDisabled=true, policy?:AccessPolicy) {
  assertPolicy(policy);
  if(!commerceDisabled)throw Error('COMMERCE_DISABLED');
  let assistantOnly: ReturnType<typeof createAssistantHandler> | undefined;
  let checkReady: (()=>Promise<unknown>) | undefined;
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Cache-Control','no-store');
    const fail=(status:number)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(status===404?'Não encontrado.':'Solicitação inválida.');};
    try {
      if(!await policy.authorize(req,res))return;
      const raw=(req.url || '').split('?')[0]!;
      const decodedPath=decodeURIComponent(raw);
      if(!raw.startsWith('/') || raw.startsWith('//') || /%(?:2f|5c|25|00)/i.test(raw) || decodedPath.includes('\\') || decodedPath.includes('//') || decodedPath.split('/').some(p=>p==='.' || p==='..')){fail(400);return;}
      const url=new URL(req.url || '/','http://local.invalid');
      if(commerceDisabled){
        const decoded=decodeURIComponent(url.pathname);
        if(decoded.includes('\\') || decoded.includes('%') || decoded.includes('//') ||
          /^\/compra(?:\/|$)/.test(decoded) || /^\/api\/loja(?:\/|$)/.test(decoded)){fail(403);return;}
      }
      if(url.pathname==='/api/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"status":"ok"}');return;}
      if(url.pathname==='/api/ready' || url.pathname.startsWith('/api/loja/') || url.pathname==='/api/assistente-local'){
        if(!assistantOnly){res.writeHead(503,{'Cache-Control':'no-store'});res.end();return;}
        if(url.pathname==='/api/ready'){
          if(req.method!=='GET' && req.method!=='HEAD'){fail(405);return;}
          let timer:ReturnType<typeof setTimeout>|undefined;
          try {
            await Promise.race([checkReady!(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('READY_TIMEOUT')),8000);})]);
            res.writeHead(200,{'Cache-Control':'no-store'});res.end();
          }catch{res.writeHead(503,{'Cache-Control':'no-store'});res.end();}
          finally{if(timer)clearTimeout(timer);}
          return;
        }
        if(url.pathname==='/api/assistente-local')await assistantOnly(req,res);
        else fail(403);
        return;
      }
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
      res.setHeader('Content-Type',type);res.setHeader('Cache-Control','no-store');
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
  server.on('checkContinue',(_req,res)=>{res.writeHead(417,{'Cache-Control':'no-store'});res.end();});
  server.on('checkExpectation',(_req,res)=>{res.writeHead(417,{'Cache-Control':'no-store'});res.end();});
  server.on('upgrade',(_req,socket)=>socket.destroy());
  server.on('connect',(_req,socket)=>socket.destroy());
  server.on('clientError',(_error,socket)=>socket.destroy());
  server.requestTimeout=20_000;server.headersTimeout=10_000;
  return {server, activate(service:CommerceService, assistant:AssistantConfig){
    denyLegacyOperation();
  }, activateAssistant(assistant:AssistantConfig){
    if(policy.mode==='quarantine')throw Error('ACCESS_QUARANTINE');
    if(!commerceDisabled)throw Error('Assistant-only activation requires isolated runtime');
    assistantOnly=createAssistantHandler(assistant);
    checkReady=()=>assistant.repository.load();
  }};
}
