import path from 'node:path';
import { access } from 'node:fs/promises';
import { createApp } from './app.ts';
import { applicationRuntime } from './bootstrap.ts';

export async function main(){
  const port=Number(process.env['PORT'] || 3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT inválida.');
  await access(path.resolve('build/index.html'));
  const runtime=await applicationRuntime(process.env);
  const server=createApp(runtime.service,runtime.assistant);
  let closing=false;
  const close=()=>{if(closing)return;closing=true;server.close(()=>{void runtime.close().finally(()=>process.exit(0));});};
  server.once('error',()=>{void runtime.close().finally(()=>{console.error('Não foi possível iniciar o servidor.');process.exitCode=1;});});
  server.listen(port,process.env['HOST'] || (runtime.config.mode==='production'?'0.0.0.0':'127.0.0.1'),()=>console.log('Site e APIs iniciados; modo '+runtime.config.mode+'; porta '+port+'.'));
  process.on('SIGINT',close);process.on('SIGTERM',close);
  // E-mails executados por cron-email.js, nunca por timer permanente.
}
