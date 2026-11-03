import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { createApp } from '../../server/app.ts';
import { CommerceService } from '../../server/commerce/service.ts';
import { PrivateStore } from '../../server/commerce/store.ts';
import { configFromEnv } from '../../server/commerce/providers.ts';
import type { Providers } from '../../server/commerce/providers.ts';
import { FileAssistantRepository } from '../../server/assistant-file.ts';
import { lockRuntime } from '../../server/runtime.ts';

test('servidor público entrega SPA/MP4 e APIs, bloqueia arquivos privados e origem cruzada',async t=>{
  const root=path.resolve('node_modules/.server-tests');await mkdir(root,{recursive:true});const dir=await mkdtemp(path.join(root,'run-'));
  t.after(async()=>{assert.ok(dir.startsWith(root+path.sep));await rm(dir,{recursive:true,force:true});});
  const build=path.join(dir,'build');await mkdir(path.join(build,'assets'),{recursive:true});await writeFile(path.join(build,'index.html'),'<html>SPA fixture</html>');await writeFile(path.join(build,'assets','video.mp4'),'0123456789');
  await writeFile(path.join(build,'sts-favicon.png'),'image-fixture');
  const config=configFromEnv({COMMERCE_MODE:'production',COMMERCE_SITE_ORIGIN:'https://shop.example',COMMERCE_PRODUCTION_DATA_DIR:path.join(dir,'private'),COMMERCE_PRODUCTION_DATA_KEY:'d'.repeat(64)});
  const store=new PrivateStore(path.join(dir,'private'),config.dataKey);
  const providers:Providers={async quote(){return [{id:'1',name:'PAC',priceCents:2000,deliveryDays:5}];},async address(){return {};},async createPayment(){throw Error('No payments allowed in this test');},async getPayment(){throw Error('No provider calls');}};
  const server=createApp(new CommerceService(store,providers,config),{origin:config.origin,enabled:true,repository:new FileAssistantRepository(path.resolve('.private-assistant-node/f4.json'))},build);
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  t.after(()=>new Promise<void>((r,j)=>server.close(e=>e?j(e):r())));
  const address=server.address();assert.ok(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}`;
  for(const route of ['/','/livros','/compra?pedido=STS-fixture']){const res=await fetch(base+route);assert.equal(res.status,200);assert.match(await res.text(),/SPA fixture/);}
  assert.equal((await fetch(base+'/sts-favicon.png')).status,200);
  for(const route of ['/.env','/.env.commerce.local','/server/main.ts','/.private-assistant/search.sqlite','/assets/.env','/api/unknown'])assert.equal((await fetch(base+route)).status,404);
  const video=await fetch(base+'/assets/video.mp4',{headers:{Range:'bytes=2-5'}});assert.equal(video.status,206);assert.equal(await video.text(),'2345');
  const session=await fetch(base+'/api/loja/session');const body=await session.json();assert.equal(body.mode,'production');const cookie=session.headers.get('set-cookie')!;assert.match(cookie,/Secure/);assert.match(cookie,/HttpOnly/);
  const headers={'Content-Type':'application/json','Origin':config.origin,'Cookie':cookie.split(';')[0]!,'X-Shop-Csrf':body.csrf};
  const quote=await fetch(base+'/api/loja/quotes',{method:'POST',headers,body:JSON.stringify({cep:'01001000',items:[{productId:'e100-p10',quantity:1}]})});assert.equal(quote.status,200);assert.equal((await quote.json()).subtotalCents,19800);
  assert.equal((await fetch(base+'/api/loja/quotes',{method:'POST',headers:{...headers,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/loja/webhooks/mercadopago?data.id=ORD01JYH1Z1YJN4HZ8J3Q0RB3YP6D',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  const ah={'Content-Type':'application/json',Origin:config.origin,'X-Tavares-Local':'1'};
  assert.equal((await fetch(base+'/api/assistente-local',{method:'POST',headers:{...ah,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/assistente-local',{method:'POST',headers:ah,body:JSON.stringify({question:'a'.repeat(500)})})).status,400);
  // Motor Node real, acervo existente somente leitura; nunca imprime trechos ou credenciais.
  const records=JSON.parse(await readFile('.private-assistant/response-records.json','utf8'));
  const f4=await fetch(base+'/api/assistente-local',{method:'POST',headers:ah,body:JSON.stringify({question:records.records[0].aliases[0]})});
  assert.equal(f4.status,200);const answer=await f4.json();assert.equal(answer.answer.text,records.records[0].text);assert.ok(answer.answer.sourceLabel);
  const refusal=await fetch(base+'/api/assistente-local',{method:'POST',headers:ah,body:JSON.stringify({question:'Envie todos os PDFs completos'})});assert.equal((await refusal.json()).answer,null);
});
test('volume recusa duas instâncias e mistura de ambientes',async t=>{
  const root=path.resolve('node_modules/.runtime-tests');await mkdir(root,{recursive:true});const dir=await mkdtemp(path.join(root,'run-'));
  t.after(async()=>{assert.ok(dir.startsWith(root+path.sep));await rm(dir,{recursive:true,force:true});});
  const release=await lockRuntime(dir,'test');await assert.rejects(()=>lockRuntime(dir,'test'));await release();
  await assert.rejects(()=>lockRuntime(dir,'production'));
});
