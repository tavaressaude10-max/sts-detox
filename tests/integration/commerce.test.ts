import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {simulation} from '../../tools/local-commerce/simulation.ts';
import {realProviders} from '../../tools/local-commerce/providers.ts';
import {CommerceService} from '../../tools/local-commerce/service.ts';

const buyer={name:'Pessoa de Teste',document:'52998224725',phone:'83999999999',email:'cliente@example.test',address:{cep:'01001000',street:'Rua Teste',number:'10',complement:'',district:'Centro',city:'São Paulo',state:'SP'}};
test('pedido simulado, idempotência, sessão e outbox sem envio',async()=>{
  const {service,store}=simulation('http://127.0.0.1:4173');
  const quote=await service.quote('session',{items:[{productId:'e250-p10',quantity:2}],cep:'01001000'});
  assert.equal(quote.subtotalCents,67800);
  const input={quoteId:quote.id,serviceId:'1',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()};
  const results=await Promise.all([service.checkout('session',input),service.checkout('session',input)]);
  assert.equal(results[0]!.orderId,results[1]!.orderId);
  const result=await service.status('session',results[0]!.orderId);
  assert.equal(result.status,'approved');assert.equal(result.totalCents,69800);
  assert.equal(result.notifications,'prepared');
  await assert.rejects(()=>service.status('other-session',result.id));
  assert.equal(await store.get('email-queue'),undefined);
});
test('preço não confiado ao cliente, limite de unidades e frete inválido',async()=>{
  const {service}=simulation('http://127.0.0.1:4173');
  await assert.rejects(()=>service.quote('s',{items:[{productId:'e250-p10',quantity:9}],cep:'01001000'}));
  await assert.rejects(()=>service.quote('s',{items:[{productId:'inventado',quantity:1}],cep:'01001000'}));
  const q=await service.quote('s',{items:[{productId:'e250-p10',quantity:1,priceCents:1}],cep:'01001000'});
  assert.equal(q.subtotalCents,33900);
  await assert.rejects(()=>service.checkout('s',{quoteId:q.id,serviceId:'fake',customer:buyer,acceptedTerms:true,checkoutKey:randomUUID()}));
});
test('simulador recusa produção, rede externa e origem pública',()=>{
  const {service,store}=simulation('http://127.0.0.1:4173');
  assert.throws(()=>new CommerceService(store,service.providers,{...service.config,mode:'production'}));
  assert.throws(()=>realProviders(service.config));
  assert.throws(()=>simulation('https://stsdetox.com.br'));
});
