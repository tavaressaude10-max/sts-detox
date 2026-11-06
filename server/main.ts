import { access } from 'node:fs/promises';
import { createPendingApp } from './app.ts';
import type { PrivateSearch } from './assistant-http.ts';

export async function main(env:NodeJS.ProcessEnv=process.env, search?: PrivateSearch){
  const port=Number(env['PORT'] || 3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT inválida.');
  const app=createPendingApp();
  const {server}=app;
  let closing=false;
  let initialized:Promise<void> | undefined;
  let release:(()=>Promise<void>) | undefined;
  async function initialize(){
    try {
      await access('build/index.html');
      const {applicationRuntime}=await import('./bootstrap.ts');
      const runtime=await applicationRuntime(env);
      release=runtime.close;
      if(!closing)app.activate(runtime.service,search ? {...runtime.assistant,search} : runtime.assistant);
    }catch{
      console.error('APIs bloqueadas. Verifique o pacote, a configuração, o schema e o F4.');
    }
  }
  function close(){
    if(closing)return;
    closing=true;
    server.close(async()=>{
      await initialized;
      await release?.();
    });
  }
  server.once('error',()=>{console.error('Falha ao abrir a porta HTTP.');process.exitCode=1;});
  server.listen(port,env['HOST'] || (env['COMMERCE_MODE']==='production'?'0.0.0.0':'127.0.0.1'),()=>{
    initialized=initialize();
  });
  process.once('SIGINT',close);
  process.once('SIGTERM',close);
}
