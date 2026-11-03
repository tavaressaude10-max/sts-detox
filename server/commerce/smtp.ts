import nodemailer from 'nodemailer';
import type { MailTransport } from './email.ts';

export function smtpTransport(env:NodeJS.ProcessEnv):MailTransport|null {
  if(env['EMAIL_DELIVERY']!=='smtp')return null;
  const host=env['SMTP_HOST'],user=env['SMTP_USER'],pass=env['SMTP_PASSWORD'],from=env['SMTP_FROM'];
  const port=Number(env['SMTP_PORT'] || 465);
  if(!host||!user||!pass||!from||!/^\S+@[^\s@]+\.[^\s@]+$/.test(from)||/[\r\n]/.test(from)||![465,587].includes(port))throw Error('Configure SMTP_HOST/USER/PASSWORD/FROM e porta 465 ou 587.');
  const client=nodemailer.createTransport({host,port,secure:port===465,requireTLS:true,auth:{user,pass},
    connectionTimeout:10_000,greetingTimeout:10_000,socketTimeout:20_000,
    tls:{rejectUnauthorized:true},logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true});
  return {async send(message,id){const info=await client.sendMail({from,to:message.to,subject:message.subject,text:message.text,messageId:`<${id}@${from.split('@')[1]}>`});
    if(!info.accepted?.length||info.rejected?.length)throw Error('Entrega não aceita.');}};
}
