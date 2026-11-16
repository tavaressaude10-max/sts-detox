import { respondFromBundle } from './assistant-core.ts';
import type { AssistantRepository } from './assistant-core.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type PrivateSearch = (question: string) => ReturnType<typeof respondFromBundle>['answer'];
export interface AssistantConfig { origin: string; repository: AssistantRepository; enabled: boolean; search?: PrivateSearch }
// Mesmo worker curado do F4 local. Não oferece arquivos, exportação ou pesquisa bruta.
export function createAssistantHandler(config: AssistantConfig) {
  let active=0, start=0, count=0;
  return async (req: IncomingMessage,res: ServerResponse) => {
    const reply=(status:number,value:unknown)=>{if(res.destroyed || res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
    if (!config.enabled) { reply(503,{error:'Base privada indisponível.'});return; }
    if(req.method!=='POST'){reply(405,{error:'Método não permitido.'});return;}
    if(req.headers.origin!==config.origin || req.headers['x-tavares-local']!=='1') {reply(403,{error:'Origem não autorizada.'});return;}
    if(!req.headers['content-type']?.startsWith('application/json')){reply(415,{error:'Formato inválido.'});return;}
    if(Date.now()-start>=60_000){start=Date.now();count=0;}
    if(++count>30 || active>=2){reply(429,{error:'Aguarde antes de tentar novamente.'});return;}
    // Reserva antes de ler o corpo para limitar também clientes lentos.
    active++;
    try {
      let size=0;const chunks:Buffer[]=[];
      for await(const chunk of req){size+=chunk.length;if(size>4096){reply(413,{error:'Pergunta muito longa.'});return;}chunks.push(chunk);}
      let payload: {question:string};
      try {payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!payload || Object.keys(payload).join()!=='question' || typeof payload.question!=='string' || !payload.question.trim() || payload.question.length>400)throw Error();}
      catch {reply(400,{error:'Pergunta inválida.'});return;}
      let timer:ReturnType<typeof setTimeout>|undefined;
      try {
        const bundle=await Promise.race([config.repository.load(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),8000);})]);
        const curated = respondFromBundle(bundle,payload);
        if (curated.answer && config.search) {
          curated.answer.sourceLabel = curated.answer.sourceLabel.replace(/(página \d+) do PDF/u, '$1 do livro');
        }
        const found = !curated.answer && config.search?.(payload.question);
        reply(200,found ? {mode:'private-local-search',answer:found} : curated);
      } finally {if(timer)clearTimeout(timer);}

    } catch {reply(503,{error:'Base privada indisponível.'});} finally {active--;}
  };
}
