import { openStorage } from './bootstrap.ts';
import { drainEmails } from './commerce/email.ts';
import { smtpTransport } from './commerce/smtp.ts';

// Chamado por um processo curto, nunca inicializado pelo Web App.
export async function runEmailJob(env:NodeJS.ProcessEnv){
  const runtime=await openStorage(env);
  try {
    const sending=runtime.config.mode==='production'&&env['EMAIL_CRON_SEND']==='true'&&env['EMAIL_DELIVERY']==='smtp';
    const transport=sending?smtpTransport(env):null;
    if(sending&&!transport)throw Error('Transporte não configurado.');
    const result=await drainEmails(runtime.store,transport || {async send(){throw Error('Envio desabilitado.');}},Date.now(),{dryRun:!sending,limit:20,deadline:Date.now()+10*60_000});
    return {...result,dryRun:!sending};
  }finally {await runtime.close();}
}
