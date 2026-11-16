import { access } from 'node:fs/promises';
import path from 'node:path';
import { createPendingApp } from './app.ts';
import {createAccessPolicy, requireHomologation} from './access-policy.ts';
import { homologationConfig, homologationRuntime } from './homologation.ts';

export async function main(env:NodeJS.ProcessEnv=process.env,buildDirectory=path.resolve('build')){
  requireHomologation(env);
  const policy=createAccessPolicy(env);
  const port=Number(env['PORT'] || 3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT inválida.');
  if(policy.mode!=='quarantine')homologationConfig(env);
  const app=createPendingApp(buildDirectory,true,policy);
  const {server}=app;
  let closing=false;
  let initialized:Promise<void> | undefined;
  let release:(()=>Promise<void>) | undefined;
  async function initialize(){
    let stage:'BUILD'|'F4'='BUILD';
    try {
      await access(path.join(buildDirectory,'index.html'));
      stage='F4';
      const runtime=await homologationRuntime(env);
      release=runtime.close;
      if(!closing){app.activateAssistant(runtime.assistant);console.error('[STS_F4_READY] Base validada; comércio permanece bloqueado.');}
    }catch{
      console.error(`[STS_${stage}_UNAVAILABLE] APIs bloqueadas. Verifique o pacote e a configuração privada.`);
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
  server.once('error',()=>{console.error('[STS_LISTEN_FAILED] Falha ao abrir a porta HTTP.');process.exitCode=1;});
  server.listen(port,env['HOST'] || '0.0.0.0',()=>{
    if(policy.mode==='quarantine'){
      console.error('[STS_QUARANTINE] Quarentena ativa: acesso bloqueado; banco e arquivos não inicializados. HTTP 503 intencional.');
      return;
    }
    console.error('[STS_LISTENING] HTTP iniciado com acesso restrito; aguardando F4.');
    initialized=initialize();
  });
  process.once('SIGINT',close);
  process.once('SIGTERM',close);
}
