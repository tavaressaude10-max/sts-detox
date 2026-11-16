import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { configFromEnv, realProviders, assertPayment } from '../../server/commerce/providers.ts';
import type { PaymentSnapshot } from '../../server/commerce/providers.ts';
import { verifyWebhook } from '../../server/commerce/http.ts';
import { PrivateStore } from '../../server/commerce/store.ts';
import { enqueueEmail, drainEmails } from '../../server/commerce/email.ts';
import type { OrderNotifications } from '../../server/commerce/service.ts';
import { verifiedState } from '../../server/commerce/service.ts';
import type { StoredOrder } from '../../server/commerce/service.ts';

const env={COMMERCE_MODE:'production',COMMERCE_SITE_ORIGIN:'https://shop.example',COMMERCE_PRODUCTION_DATA_DIR:path.resolve('node_modules/.production-fixture'),COMMERCE_PRODUCTION_DATA_KEY:'b'.repeat(64)};
const config={...configFromEnv(env),sellerId:'456',accessToken:'PRODUCTION-FIXTURE',superfreteToken:'FRETE-FIXTURE',webhookSecret:'WEBHOOK-FIXTURE',checkoutEnabled:true};
const remote:PaymentSnapshot={id:'ORD01JYH1Z1YJN4HZ8J3Q0RB3YP6D',user_id:'456',currency:'BRL',external_reference:'STS-fixture',total_amount:'218.00',total_paid_amount:'218.00',status:'processed',status_detail:'accredited',transactions:{payments:[{status:'processed',status_detail:'accredited',paid_amount:'218.00'}]},checkout_url:'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=fixture'};
test('produção não herda tokens/chave de teste e exige origem HTTPS explícita',()=>{
  const result=configFromEnv({...env,MERCADOPAGO_ACCESS_TOKEN:'legacy',MERCADOPAGO_TEST_ACCESS_TOKEN:'test',SUPERFRETE_TOKEN:'sandbox',COMMERCE_DATA_KEY:'a'.repeat(64)});
  assert.equal(result.accessToken,'');assert.equal(result.superfreteToken,'');assert.equal(result.dataKey,'b'.repeat(64));assert.equal(result.checkoutEnabled,false);
  assert.throws(()=>configFromEnv({...env,COMMERCE_SITE_ORIGIN:'http://127.0.0.1:3000'}));
  assert.equal(configFromEnv({...env,COMMERCE_PRODUCTION_DATA_DIR:''}).mode,'production');
  assert.throws(()=>configFromEnv({COMMERCE_MODE:'test',COMMERCE_SITE_ORIGIN:'https://one.example',MERCADOPAGO_TEST_RETURN_ORIGIN:'https://other.example'}));
});
test('frete de produção usa endpoint e token próprios, sem fallback sandbox',async()=>{
  let called=0;const p=realProviders(config,async(url,init)=>{called++;assert.equal(url,'https://api.superfrete.com/api/v0/calculator');assert.equal((init!.headers as Record<string,string>)['Authorization'],'Bearer FRETE-FIXTURE');assert.equal(JSON.parse(String(init!.body)).from.postal_code,'58315000');return Response.json([{id:1,price:20,delivery_time:5}]);});
  assert.equal((await p.quote('01001000',1))[0]!.name,'PAC');assert.equal(called,1);
  await assert.rejects(()=>realProviders({...config,superfreteToken:''},async()=>{throw Error('must not fetch');}).quote('01001000',1),/configurada/);
});
test('checkout exige liberação e vendedor real antes de POST; retorno usa a mesma origem',async()=>{
  const input={id:'STS-fixture',email:'test@example.test',lines:[],shipping:{id:'1',name:'PAC' as const,priceCents:2000,deliveryDays:5},totalCents:21800};
  let posts=0;
  const fetcher:typeof fetch=async(url,init)=>{
    if(String(url).endsWith('/users/me'))return Response.json({id:'456',tags:[]});
    posts++;assert.equal(JSON.parse(String(init!.body)).config.online.success_url,'https://shop.example/compra?pedido=STS-fixture&retorno=aprovado');return Response.json(remote);
  };
  await assert.rejects(()=>realProviders({...config,checkoutEnabled:false},fetcher).createPayment(input));assert.equal(posts,0);
  await assert.rejects(()=>realProviders(config,async()=>Response.json({id:'456',tags:['test_user']})).createPayment(input));
  assert.equal((await realProviders(config,fetcher).createPayment(input)).id,remote.id);assert.equal(posts,1);
});
test('reconciliação rejeita ambiente, vendedor, moeda e valor divergentes',()=>{
  assert.doesNotThrow(()=>assertPayment(remote,config));
  for(const patch of [{id:'ORDTSTFIXTURE123'},{live_mode:false},{user_id:'789'},{currency:'USD'}])assert.throws(()=>assertPayment({...remote,...patch},config));
  const order={id:'STS-fixture',totalCents:21800,paymentId:remote.id} as StoredOrder;
  assert.equal(verifiedState(order,remote,'456','production').status,'approved');
  assert.throws(()=>verifiedState(order,{...remote,total_amount:'1.00'},'456','production'));
  for(const [state,expected] of [['created','pending'],['failed','rejected'],['cancelled','cancelled'],['refunded','refunded']])assert.equal(verifiedState(order,{...remote,status:state!},'456','production').status,expected);
});
test('HMAC de produção aceita apenas ID do ambiente e assinatura recente',()=>{
  const ts=String(Date.now()),request='request-fixture',id=remote.id;
  const hash=createHmac('sha256',config.webhookSecret).update(`id:${id};request-id:${request};ts:${ts};`).digest('hex');
  assert.ok(verifyWebhook(config.webhookSecret,`ts=${ts},v1=${hash}`,request,id,Date.now(),'production'));
  assert.equal(verifyWebhook(config.webhookSecret,`ts=${ts},v1=${hash}`,request,id),false);
  assert.equal(verifyWebhook('other',`ts=${ts},v1=${hash}`,request,id,Date.now(),'production'),false);
});
test('fila cifrada retoma falha parcial sem reenviar destinatário já confirmado; teste nunca envia',async t=>{
  const root=path.resolve('node_modules/.email-tests');await mkdir(root,{recursive:true});const dir=await mkdtemp(path.join(root,'run-'));
  t.after(async()=>{assert.ok(dir.startsWith(root+path.sep));await rm(dir,{recursive:true,force:true});});
  const store=new PrivateStore(dir,'c'.repeat(64));
  const item:OrderNotifications={event:'order.approved',orderId:'order',mode:'production',delivery:'prepared',emails:[{to:'a@example.test',subject:'s',text:'t'},{to:'b@example.test',subject:'s',text:'t'}],whatsapp:{enabled:false},createdAt:0};
  await store.put('outbox:order',item);await enqueueEmail(store,'order');await enqueueEmail(store,'order');
  const sent:string[]=[];let fail=true;
  const transport={async send(message:{to:string}){if(message.to.startsWith('b')&&fail)throw Error();sent.push(message.to);}};
  await drainEmails(store,transport,1000);assert.deepEqual(sent,['a@example.test']);
  fail=false;await drainEmails(store,transport,1_000_000);await drainEmails(store,transport,2_000_000);
  assert.deepEqual(sent,['a@example.test','b@example.test']);assert.equal((await store.get<OrderNotifications>('outbox:order'))!.delivery,'sent');
  await store.put('outbox:test',{...item,mode:'test'});await enqueueEmail(store,'test');await drainEmails(store,transport);assert.equal(sent.length,2);
});
