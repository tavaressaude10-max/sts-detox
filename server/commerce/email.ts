import { createHash } from 'node:crypto';
import type { DataStore } from '../storage/types.ts';
import type { OrderNotifications, EmailMessage } from './service.ts';

export interface MailTransport { send(message:EmailMessage, id:string):Promise<void> }
interface Receipt { sent:number[]; attempts:number; nextAttempt:number }
export async function enqueueEmail(store:DataStore,id:string) {
  await store.lock('email-queue',async()=>{
    const queue=await store.get<string[]>('email-queue') || [];
    if(!queue.includes(id)){queue.push(id);await store.put('email-queue',queue);}
  });
}
// Locks MySQL entre processos. Não chamar SMTP no webhook: confirmação HTTP não depende do e-mail.
export async function drainEmails(store:DataStore,transport:MailTransport,now=Date.now(),options:{dryRun?:boolean;limit?:number;deadline?:number}={}) {
  const queue=await store.get<string[]>('email-queue') || [];
  const result={examined:0,due:0,sent:0,failed:0};
  const limit=Math.max(1,Math.min(50,options.limit || 20));
  const deadline=options.deadline ?? Date.now()+10*60_000;
  for(const id of queue){
    if(result.due>=limit||Date.now()>=deadline)break;
    await store.lock(`email:${id}`,async()=>{
    result.examined++;
    const item=await store.get<OrderNotifications>(`outbox:${id}`);
    if(!item || item.mode!=='production')return;
    const receipt=await store.get<Receipt>(`email-receipt:${id}`) || {sent:[],attempts:0,nextAttempt:0};
    if(receipt.nextAttempt>now)return;
    result.due++;
    if(options.dryRun)return;
    for(let index=0;index<item.emails.length;index++){
      if(receipt.sent.includes(index))continue;
      try {await transport.send(item.emails[index]!,createHash('sha256').update(`${id}:${index}`).digest('hex'));
        receipt.sent.push(index);await store.put(`email-receipt:${id}`,receipt);result.sent++;
      } catch {
        receipt.attempts++;receipt.nextAttempt=now+Math.min(24*60*60_000,60_000*2**Math.min(receipt.attempts,10));
        result.failed++;
        await store.put(`email-receipt:${id}`,receipt);return;
      }
    }
    item.delivery='sent';await store.put(`outbox:${id}`,item);
    await store.lock('email-queue',async()=>{const latest=await store.get<string[]>('email-queue') || [];await store.put('email-queue',latest.filter(v=>v!==id));});
    });
  }
  return result;
}
