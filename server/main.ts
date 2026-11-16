import { access } from 'node:fs/promises';
import { createPendingApp } from './app.ts';
import {createAccessPolicy, requireHomologation} from './access-policy.ts';
import { homologationConfig, homologationRuntime } from './homologation.ts';

export async function main(env:NodeJS.ProcessEnv=process.env){
  requireHomologation(env);
  const policy=createAccessPolicy(env);
  const port=Number(env['PORT'] || 3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT inválida.');
  if(policy.mode!=='quarantine')homologationConfig(env);
  const app=createPendingApp(undefined,true,policy);
  const {server}=app;
  let closing=false;
  let initialized:Promise<void> | undefined;
  let release:(()=>Promise<void>) | undefined;
  async function initialize(){
    try {
      await access('build/index.html');
      const runtime=await homologationRuntime(env);
      release=runtime.close;
      if(!closing)app.activateAssistant(runtime.assistant);
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
  server.listen(port,env['HOST'] || '0.0.0.0',()=>{
    if(policy.mode==='quarantine'){
      console.error('Quarentena ativa: acesso bloqueado; banco e arquivos não inicializados.');
      return;
    }
    initialized=initialize();
  });
  process.once('SIGINT',close);
  process.once('SIGTERM',close);
}
