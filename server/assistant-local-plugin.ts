import path from 'node:path';
import type { Plugin } from 'vite';
import { createAssistantHandler } from './assistant-http.ts';
import { FileAssistantRepository } from './assistant-file.ts';

// Mesmo motor Node da produção, usando snapshot privado só no desenvolvimento.
export function assistantLocalPlugin():Plugin {
  const handlers=new Map<string,ReturnType<typeof createAssistantHandler>>();
  return {name:'tavares-private-local',apply:'serve',configureServer(server){
    server.middlewares.use('/api/assistente-local',(req,res)=>{
      const host=req.headers.host || '',address=req.socket.remoteAddress || '';
      if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)||!['127.0.0.1:5174','localhost:5174'].includes(host)){
        res.writeHead(403);res.end();return;
      }
      if(req.url!=='/'&&req.url!==''){res.writeHead(405);res.end();return;}
      let handler=handlers.get(host);
      if(!handler){handler=createAssistantHandler({origin:'http://'+host,enabled:true,repository:new FileAssistantRepository(path.resolve('.private-assistant-node/f4.json'))});handlers.set(host,handler);}
      void handler(req,res);
    });
  }};
}
