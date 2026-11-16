import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { cart, cep, customer, packageFor, shippingOptions, validDocument } from '../../server/commerce/domain.ts';
import { configFromEnv, paymentBody, realProviders } from '../../server/commerce/providers.ts';
import type { CommerceConfig, Providers, PaymentSnapshot, CreatePaymentInput } from '../../server/commerce/providers.ts';
import { PrivateStore } from '../../server/commerce/store.ts';
import { CommerceService, verifiedState } from '../../server/commerce/service.ts';
import type { StoredOrder, OrderNotifications } from '../../server/commerce/service.ts';
import { createCommerceServer, verifyWebhook } from '../../server/commerce/http.ts';
import { returnAccess, validReturnAccess } from '../../server/commerce/return-access.ts';

const config: CommerceConfig={mode:'test',origin:'http://127.0.0.1:5174',returnOrigin:'https://checkout-test.example',accessToken:'TEST-FIXTURE-NOT-A-CREDENTIAL',testSellerId:'123456',webhookSecret:'webhook-fixture-secret',superfreteToken:'TEST-SUPERFRETE-FIXTURE',dataKey:'a'.repeat(64),directory:''};
const buyer={name:'Pessoa de Teste',document:'52998224725',phone:'83999999999',email:'cliente@example.test',address:{cep:'01001000',street:'Praça de Teste',number:'10',complement:'Teste',district:'Centro',city:'São Paulo',state:'SP'}};
const items=[{productId:'e100-p10',quantity:1}];
const options=[{id:'1',name:'PAC' as const,priceCents:2000,deliveryDays:5},{id:'2',name:'SEDEX' as const,priceCents:3500,deliveryDays:2}];
async function fixture(t: {after: (fn:()=>Promise<void>)=>void}) {
  const root=path.resolve('node_modules/.commerce-tests');await mkdir(root,{recursive:true});
  const directory=await mkdtemp(path.join(root,'run-'));
  t.after(async()=>{if(!directory.startsWith(root+path.sep))throw Error('Unsafe cleanup');await rm(directory,{recursive:true,force:true});});
  const store=new PrivateStore(directory,config.dataKey);
  let creates=0, quotes=0, remote:PaymentSnapshot | undefined;
  const providers:Providers={
    async quote(){quotes++;return structuredClone(options);},
    async address(cep){return {...buyer.address,cep};},
    async createPayment(input){creates++;remote={id:'ORDTSTFIXTURE1',user_id:config.testSellerId,currency:'BRL',external_reference:input.id,total_amount:(input.totalCents/100).toFixed(2),total_paid_amount:'0',status:'created',checkout_url:'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORDTSTFIXTURE1'};return remote;},
    async getPayment(){assert.ok(remote);return remote;},
  };
  const service=new CommerceService(store,providers,{...config,directory});
  return {store,service,providers,directory,get creates(){return creates;},get quotes(){return quotes;},get remote(){return remote!;},approve(){assert.ok(remote);remote.status='processed';remote.status_detail='accredited';remote.total_paid_amount=remote.total_amount;remote.transactions={payments:[{status:'processed',status_detail:'accredited',paid_amount:remote.total_amount}]};}};
}
async function draft(f:Awaited<ReturnType<typeof fixture>>,session='session-a'){
  const quote=await f.service.quote(session,{items,cep:'01001-000'});
  return {quote,request:{quoteId:quote.id,serviceId:'1',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()}};
}
for (const scenario of ['pedido novo', 'pedido com URL existente']) {
  test(`checkout bloqueado em produção: ${scenario}`, async t => {
    const f = await fixture(t);
    const { request } = await draft(f);
    if (scenario === 'pedido com URL existente') {
      const previous = await f.service.checkout('session-a', request);
      assert.ok(previous.checkoutUrl);
    }
    const blocked = new CommerceService(f.store, f.providers, configFromEnv({
      COMMERCE_MODE: 'production',
      COMMERCE_SITE_ORIGIN: 'https://shop.example',
      COMMERCE_PRODUCTION_CHECKOUT_ENABLED: 'false',
    }));
    const calls = [
      t.mock.method(f.store, 'lock'), t.mock.method(f.store, 'get'), t.mock.method(f.store, 'put'),
      t.mock.method(f.providers, 'quote'), t.mock.method(f.providers, 'address'),
      t.mock.method(f.providers, 'createPayment'), t.mock.method(f.providers, 'getPayment'),
    ];
    await assert.rejects(blocked.checkout('session-a', request), { code: 'checkout_disabled', status: 503 });
    for (const call of calls) assert.equal(call.mock.callCount(), 0);
  });
}
test('embalagens nos limites 1, 2–4 e 5–8; 9+ bloqueado',()=>{
  assert.deepEqual(packageFor(1),{height:11,width:11,length:21,weight:0.3});
  for(const n of [2,3,4])assert.deepEqual(packageFor(n),{height:11,width:11,length:21,weight:1});
  for(const n of [5,8])assert.deepEqual(packageFor(n),{height:22,width:22,length:21,weight:2});
  for(const n of [0,9,99,1.5])assert.throws(()=>packageFor(n));
});
test('catálogo rejeita SKU inventado, quantidade fracionária e preço adulterado é ignorado',()=>{
  const result=cart([{productId:'e100-p10',quantity:2,unitPriceCents:1},{productId:'e200-mike',quantity:1},{productId:'e250-p10',quantity:1}]);
  assert.equal(result.subtotalCents,103300);assert.equal(result.quantity,4);
  assert.throws(()=>cart([{productId:'e250-mike',quantity:1}]));
  assert.throws(()=>cart([{productId:'e100-p10',quantity:0.5}]));
  assert.throws(()=>cart([{productId:'e100-p10',quantity:5},{productId:'e200-p10',quantity:4}]));
});
test('duplicatas são somadas antes da regra de embalagem',()=>{
  const result=cart([{productId:'e100-p10',quantity:1},{productId:'e100-p10',quantity:2}]);
  assert.equal(result.lines.length,1);assert.equal(result.quantity,3);assert.equal(result.subtotalCents,59400);
});
test('somente PAC/SEDEX válidos; serviço com erro ou valor zero nunca vira frete grátis',()=>{
  assert.deepEqual(shippingOptions([{id:1,price:18.61,delivery_time:5,has_error:false},{id:2,price:0,delivery_time:0,has_error:true},{id:31,price:1,delivery_time:1}]),[{id:'1',name:'PAC',priceCents:1861,deliveryDays:5}]);
  assert.throws(()=>shippingOptions([{id:1,price:0,delivery_time:2}]));
});
test('CEP, CPF e CNPJ (inclusive alfanumérico) validados',()=>{
  assert.equal(cep('58315-000'),'58315000');assert.throws(()=>cep('00000-000'));
  assert.ok(validDocument('529.982.247-25'));assert.ok(validDocument('12.ABC.345/01DE-35'));
  assert.ok(!validDocument('11111111111'));assert.ok(!validDocument('12.ABC.345/01DE-36'));
  assert.throws(()=>customer({...buyer,address:{...buyer.address,cep:'58315000'}},'01001000'));
  assert.throws(()=>customer({...buyer,email:'invalid'},'01001000'));
});
test('produção sem configuração obrigatória é recusada antes de iniciar',()=>{
  assert.throws(()=>configFromEnv({COMMERCE_MODE:'production'}));
  assert.equal(configFromEnv({COMMERCE_MODE:'test'}).mode,'test');
});
test('cotação guarda somente CEP e itens, não dados pessoais; sessão e validade protegidas',async t=>{
  const f=await fixture(t),{quote}=await draft(f);
  assert.equal(quote.subtotalCents,19800);assert.ok(!('session' in quote));
  const saved=await f.store.get<Record<string,unknown>>(`quote:${quote.id}`);assert.ok(saved);assert.ok(!('customer' in saved));
  await assert.rejects(()=>f.service.address('outra-sessao',quote.id));
  f.service.now=()=>quote.expiresAt+1;await assert.rejects(()=>f.service.checkout('session-a',{quoteId:quote.id,serviceId:'1',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()}));
  assert.equal(f.creates,0);
});
test('cotação de 9 unidades não chama SuperFrete',async t=>{
  const f=await fixture(t);await assert.rejects(()=>f.service.quote('s',{items:[{productId:'e100-p10',quantity:9}],cep:'01001000'}));assert.equal(f.quotes,0);
});
test('preço do frete revalidado e mudança impede pagamento silencioso',async t=>{
  const f=await fixture(t),{request}=await draft(f);f.providers.quote=async()=>[{...options[0]!,priceCents:2500}];
  await assert.rejects(()=>f.service.checkout('session-a',request),/atualizado/);assert.equal(f.creates,0);
});
test('total vem do servidor, e concorrência/repetição não cria duas orders',async t=>{
  const f=await fixture(t),{request}=await draft(f);
  const results=await Promise.all([f.service.checkout('session-a',{...request,totalCents:1}),f.service.checkout('session-a',request),f.service.checkout('session-a',{...request,checkoutKey:randomUUID()})]);
  assert.equal(f.creates,1);assert.equal(new Set(results.map(r=>r.orderId)).size,1);assert.equal(f.remote.total_amount,'218.00');
  const stored=await f.store.get<StoredOrder>(`order:${results[0]!.orderId}`);assert.equal(stored?.totalCents,21800);
});
test('timeout depois de criar remotamente reutiliza a mesma idempotência',async t=>{
  const f=await fixture(t),{request}=await draft(f);const original=f.providers.createPayment;const keys:string[]=[];let first=true;
  f.providers.createPayment=async input=>{keys.push(input.id);const value=await original(input);if(first){first=false;throw Error('timeout');}return value;};
  await assert.rejects(()=>f.service.checkout('session-a',request));await f.service.checkout('session-a',request);
  assert.equal(keys[0],keys[1]);
});

test('dados corrigidos exigem nova cotação após tentativa persistida',async t=>{
  const f=await fixture(t),{request}=await draft(f);
  const original=f.providers.createPayment;
  f.providers.createPayment=async()=>{throw Error('fixture unavailable');};
  await assert.rejects(()=>f.service.checkout('session-a',request));
  const corrected={...buyer,address:{...buyer.address,number:'20'}};
  await assert.rejects(()=>f.service.checkout('session-a',{...request,customer:corrected}),/tentativa já foi usada/);
  assert.equal(f.creates,0);
  f.providers.createPayment=original;
  const next=await draft(f);
  await f.service.checkout('session-a',{...next.request,customer:corrected});
  assert.equal(f.creates,1);
});
test('consulta autorizada confirma aprovação e prepara exatamente dois e-mails sem enviá-los',async t=>{
  const f=await fixture(t),{request}=await draft(f),{orderId}=await f.service.checkout('session-a',request);
  await assert.rejects(()=>f.service.status('other',orderId));
  assert.equal((await f.service.status('session-a',orderId)).status,'pending');assert.equal(await f.store.get(`outbox:${orderId}`),undefined);
  f.approve();await Promise.all([f.service.status('session-a',orderId),f.service.webhook(f.remote.id)]);
  const outbox=await f.store.get<OrderNotifications>(`outbox:${orderId}`);assert.equal(outbox?.emails.length,2);assert.equal(outbox?.delivery,'prepared');assert.equal(outbox?.emails[1]?.to,'saudeq@hotmail.com');
  assert.match(outbox!.emails[1]!.text,/CPF\/CNPJ: 52998224725/);assert.match(outbox!.emails[1]!.text,/PAC/);assert.match(outbox!.emails[1]!.text,/R\$\s*218,00/);
  assert.deepEqual(outbox?.whatsapp,{enabled:false});
  const first=outbox?.createdAt;await f.service.webhook(f.remote.id);assert.equal((await f.store.get<OrderNotifications>(`outbox:${orderId}`))?.createdAt,first);
  for(const filename of await readdir(f.directory)){const raw=await readFile(path.join(f.directory,filename));assert.ok(!raw.includes(Buffer.from(buyer.email)));assert.ok(!raw.includes(Buffer.from(buyer.document)));}
});
test('reconciliação rejeita valor, referência, moeda e ambiente divergentes',async t=>{
  const f=await fixture(t),{request}=await draft(f),{orderId}=await f.service.checkout('session-a',request);f.approve();
  const order=(await f.store.get<StoredOrder>(`order:${orderId}`))!;
  for(const patch of [{total_amount:'1.00'},{external_reference:'outro'},{currency:'USD'},{live_mode:true},{user_id:'another'},{id:'ORDPRODUCTION'}])assert.throws(()=>verifiedState(order,{...f.remote,...patch},config.testSellerId));
  assert.equal(verifiedState(order,{...f.remote,total_paid_amount:'1.00'},config.testSellerId).status,'pending');
  assert.equal(verifiedState(order,{...f.remote,transactions:{payments:[]}},config.testSellerId).status,'pending');
});
test('estados recusado, cancelado e estornado não disparam confirmação de aprovação',async t=>{
  const f=await fixture(t),{request}=await draft(f),{orderId}=await f.service.checkout('session-a',request);
  for(const [remote,expected] of [['failed','rejected'],['cancelled','cancelled'],['refunded','refunded']]){f.remote.status=remote!;assert.equal((await f.service.status('session-a',orderId)).status,expected);}
  assert.equal(await f.store.get(`outbox:${orderId}`),undefined);
});
test('retorno de checkout usa Orders manual, total com frete e meios de pagamento aceitos',()=>{
  const basket=cart(items);const body=paymentBody({id:'STS-test',email:buyer.email,lines:basket.lines,shipping:options[0]!,totalCents:21800},config.returnOrigin);
  assert.equal(body.processing_mode,'manual');assert.equal(body.type,'online');assert.equal(body.total_amount,'218.00');assert.equal(body.items[1]?.title,'Frete PAC');
  assert.deepEqual(body.config.payment_method,{not_allowed_types:['ticket','atm','account_money','digital_currency'],max_installments:12});assert.ok(!body.config.payment_method.not_allowed_types.includes('bank_transfer'));
  assert.ok(!JSON.stringify(body).includes(buyer.document));assert.ok(!JSON.stringify(body).includes('card_number'));
  assert.throws(()=>paymentBody({id:'x',email:buyer.email,lines:[],shipping:options[0]!,totalCents:21800},'http://localhost:5174'));
});
test('adaptador SuperFrete envia pacote correto ao sandbox e não transmite PII',async()=>{
  const calls:{url:string;body:unknown;auth:string}[]=[];
  const providers=realProviders(config,async(url,init)=>{calls.push({url:String(url),body:JSON.parse(String(init?.body)),auth:(init?.headers as Record<string,string>)['Authorization']!});return new Response(JSON.stringify([{id:1,price:20,delivery_time:5,has_error:false}]),{status:200});});
  await providers.quote('01001000',5);assert.equal(calls[0]?.url,'https://sandbox.superfrete.com/api/v0/calculator');
  const body=calls[0]!.body as Record<string,unknown>;assert.deepEqual(body['package'],{height:22,width:22,length:21,weight:2});assert.deepEqual(body['from'],{postal_code:'58315000'});assert.equal(body['services'],'1,2');assert.ok(!JSON.stringify(body).includes('document'));
});

test('CEPs da conferência normalizados; sem token não há chamada nem cotação simulada',async()=>{
  let calls=0;
  const providers=realProviders({...config,superfreteToken:''},async()=>{calls++;throw Error('Não deve chamar');});
  for(const [input,normalized] of [['58417-065','58417065'],['15375-126','15375126']]) {
    assert.equal(cep(input),normalized);
    await assert.rejects(()=>providers.quote(cep(input),1),{code:'not_configured',status:503});
  }
  assert.equal(calls,0);
});
test('credencial de vendedor real é bloqueada antes do POST de pagamento',async()=>{
  const methods:string[]=[];
  const providers=realProviders(config,async(_url,init)=>{methods.push(init?.method || 'GET');return new Response(JSON.stringify({id:config.testSellerId,tags:['normal']}),{status:200});});
  await assert.rejects(()=>providers.createPayment({id:'x',email:buyer.email,lines:cart(items).lines,shipping:options[0]!,totalCents:21800}),/vendedor de teste/);assert.deepEqual(methods,['GET']);
});
test('webhook exige HMAC, timestamp recente e ID de teste',()=>{
  const ts=String(Date.now()),id='ORDTSTFIXTURE1',requestId='request-fixture';
  const sig=createHmac('sha256',config.webhookSecret).update(`id:${id};request-id:${requestId};ts:${ts};`).digest('hex');
  assert.ok(verifyWebhook(config.webhookSecret,`ts=${ts},v1=${sig}`,requestId,id));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${'0'.repeat(64)}`,requestId,id));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${sig}`,requestId,id,Date.now()+11*60_000));
  assert.ok(!verifyWebhook('',`ts=${ts},v1=${sig}`,requestId,id));
  // Notificações da compra normalizam o ID; o simulador preserva a query.
  const lowerSig=createHmac('sha256',config.webhookSecret).update(`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`).digest('hex');
  assert.ok(verifyWebhook(config.webhookSecret,`ts=${ts},v1=${lowerSig}`,requestId,id));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${lowerSig}`,requestId,id+'A'));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${lowerSig}`,requestId+'x',id));
  assert.ok(verifyWebhook(config.webhookSecret,`ts=${ts},v1=${lowerSig}`,requestId,id.toLowerCase()));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${sig}`,requestId+'changed',id));
  assert.ok(!verifyWebhook(config.webhookSecret,`ts=${ts},v1=${sig}`,requestId,id+'2'));
});
test('HTTP: sessão, CSRF, erro sem credenciais e retorno forjado não aprovam pagamento',async t=>{
  const f=await fixture(t),server=createCommerceServer(f.service);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise<void>(resolve=>server.close(()=>resolve()));});
  const port=(server.address() as {port:number}).port,base=`http://127.0.0.1:${port}`;
  const session=await fetch(base+'/api/loja/session'),cookie=session.headers.get('set-cookie')!.split(';')[0]!,{csrf}=await session.json();
  assert.match(session.headers.get('set-cookie')!,/HttpOnly/);
  const post=(url:string,payload:unknown,headers:Record<string,string>={})=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',Origin:config.origin,Cookie:cookie,'X-Shop-Csrf':csrf,...headers},body:JSON.stringify(payload)});
  assert.equal((await post('/api/loja/quotes',{items,cep:'01001000'},{'X-Shop-Csrf':'wrong'})).status,403);
  assert.equal((await post('/api/loja/quotes',{items,cep:'01001000'},{Origin:'https://evil.example'})).status,403);
  const quote=await (await post('/api/loja/quotes',{items,cep:'01001000'})).json();
  const checkout=await (await post('/api/loja/checkout',{quoteId:quote.id,serviceId:'1',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()})).json();
  const result=await (await fetch(base+`/api/loja/orders/${checkout.orderId}?status=approved`,{headers:{Cookie:cookie}})).json();assert.equal(result.status,'pending');assert.ok(!JSON.stringify(result).includes(buyer.email));
  assert.equal((await fetch(base+`/api/loja/orders/${checkout.orderId}`)).status,401);
  const webhook=await post('/api/loja/webhooks/mercadopago?data.id=ORDTSTFIXTURE1',{live_mode:false,type:'order',data:{id:'ORDTSTFIXTURE1'}});assert.equal(webhook.status,401);
  f.providers.quote=async()=>{throw Error(config.superfreteToken);};const error=await (await post('/api/loja/quotes',{items,cep:'01001000'})).text();assert.ok(!error.includes(config.superfreteToken));assert.match(error,/professor Tavares/);
});


test('rollback após timeout externo preserva intenção e chave idempotente já commitadas',async()=>{
  let records=new Map<string,unknown>();
  const store={async get<T>(key:string){return structuredClone(records.get(key)) as T|undefined;},async put(key:string,value:unknown){records.set(key,structuredClone(value));},async lock<T>(_key:string,run:()=>Promise<T>){const before=structuredClone(records);try{return await run();}catch(error){records=before;throw error;}}};
  const ids:string[]=[];
  const providers:Providers={async quote(){return structuredClone(options);},async address(){return {};},async getPayment(){throw Error('unexpected');},async createPayment(input){ids.push(input.id);throw Error('timeout externo');}};
  const service=new CommerceService(store,providers,config);
  const quote=await service.quote('s',{items,cep:'01001000'});
  const request={quoteId:quote.id,serviceId:'1',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()};
  await assert.rejects(()=>service.checkout('s',request),/timeout externo/);
  assert.ok(await store.get('order:'+ids[0]));
  await assert.rejects(()=>service.checkout('s',request),/timeout externo/);
  assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);
});

test('retorno em outra sessão exige autorização temporária do pedido e não cria pagamentos',async t=>{
  const f=await fixture(t),{request}=await draft(f);
  let captured:CreatePaymentInput|undefined;
  const create=f.providers.createPayment;
  f.providers.createPayment=async input=>{captured=input;return create(input);};
  const checkout=await f.service.checkout('session-a',request);
  assert.ok(captured?.returnToken);
  const token=captured.returnToken,now=Date.now();
  const urls=paymentBody(captured,config.returnOrigin).config.online;
  assert.equal(new URL(urls.success_url).hash,'#confirmacao='+token);
  assert.ok(validReturnAccess(config.dataKey,'test',checkout.orderId,token,now));
  assert.ok(!validReturnAccess(config.dataKey,'production',checkout.orderId,token,now));
  assert.ok(!validReturnAccess(config.dataKey,'test',checkout.orderId+'a',token,now));
  assert.ok(!validReturnAccess(config.dataKey,'test',checkout.orderId,token,now+8*86400_000));
  assert.ok(!validReturnAccess(config.dataKey,'test',checkout.orderId,token+'a',now));
  await assert.rejects(f.service.status('new-private-session',checkout.orderId),{status:404});
  assert.equal((await f.service.status('new-private-session',checkout.orderId,token)).status,'pending');
  f.approve();
  for(let i=0;i<3;i++){
    const result=await f.service.status('new-private-session',checkout.orderId,token);
    assert.equal(result.status,'approved');assert.equal(result.paidCents,result.totalCents);
    assert.ok(!JSON.stringify(result).includes(buyer.email));assert.ok(!('customer' in result));
  }
  assert.equal(f.creates,1);
  const expired=returnAccess(config.dataKey,'test',checkout.orderId,now-1);
  await assert.rejects(f.service.status('new-private-session',checkout.orderId,expired),{status:404});
  const server=createCommerceServer(f.service);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise<void>(resolve=>server.close(()=>resolve()));});
  const base='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const session=await fetch(base+'/api/loja/session'),cookie=session.headers.get('set-cookie')!.split(';')[0]!;
  const endpoint=base+'/api/loja/orders/'+checkout.orderId;
  assert.equal((await fetch(endpoint+'?retorno=aprovado',{headers:{Cookie:cookie}})).status,404);
  const response=await fetch(endpoint,{headers:{Cookie:cookie,'X-Shop-Return-Token':token}});
  assert.equal(response.status,200);assert.equal((await response.json()).status,'approved');
  assert.equal(f.creates,1);
});
