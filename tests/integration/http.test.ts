import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import type {AddressInfo} from 'node:net';
import {createApp} from '../../tools/local-commerce/app.ts';
import {simulation} from '../../tools/local-commerce/simulation.ts';
import {localFetch} from '../server/http-fixture.ts';

test('HTTP integrado: SPA, sessão, frete, CSRF e arquivos privados',async t=>{
  const {service}=simulation('http://127.0.0.1:4173');
  const app=createApp(service,{origin:service.config.origin,enabled:false,repository:{async load(){throw Error();}}});
  app.listen(0,'127.0.0.1');await once(app,'listening');
  t.after(()=>new Promise<void>(resolve=>app.close(()=>resolve())));
  const origin=`http://127.0.0.1:${(app.address() as AddressInfo).port}`;
  service.config.origin=origin;
  for(const route of ['/','/livros','/compra'])assert.equal((await localFetch(origin+route)).status,200);
  for(const route of ['/server.js','/.env','/tools/local-commerce/run.ts','/.private-assistant-node/f4.json'])assert.equal((await localFetch(origin+route)).status,404);
  assert.equal((await localFetch(origin+'/',{headers:{Host:'evil.example'}})).status,403);
  const session=await localFetch(origin+'/api/loja/session');
  const cookie=session.headers.get('set-cookie')!.split(';')[0]!;
  const {csrf}=await session.json() as {csrf:string};
  const body=JSON.stringify({items:[{productId:'e250-p10',quantity:1}],cep:'01001000'});
  const headers={Cookie:cookie,Origin:origin,'Content-Type':'application/json'};
  assert.equal((await localFetch(origin+'/api/loja/quotes',{method:'POST',headers,body})).status,403);
  const quote=await localFetch(origin+'/api/loja/quotes',{method:'POST',headers:{...headers,'X-Shop-CSRF':csrf},body});
  assert.equal(quote.status,200);assert.equal((await quote.json() as {subtotalCents:number}).subtotalCents,33900);
  assert.equal((await localFetch(origin+'/api/assistente-local',{method:'POST',headers:{...headers,'X-Tavares-Local':'1'},body:'{"question":"teste"}'})).status,503);
});
