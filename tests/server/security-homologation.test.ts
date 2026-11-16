import {localFetch as fetch} from './http-fixture.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {readFile, readdir, mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {request} from 'node:http';
import mysql from 'mysql2/promise';
import {createAccessPolicy} from '../../server/access-policy.ts';
import {createPendingApp} from '../../server/app.ts';
import {main} from '../../server/main.ts';
import {openStorage, applicationRuntime} from '../../server/bootstrap.ts';
import {databaseOptions} from '../../server/storage/mysql.ts';
import {realProviders} from '../../server/commerce/providers.ts';
import {CommerceService} from '../../server/commerce/service.ts';

const auth='Basic '+Buffer.from('operator:synthetic-password').toString('base64');
const env={STS_RUNTIME:'homologacao',HOST:'127.0.0.1',HOMOLOG_SITE_ORIGIN:'http://127.0.0.1',
  HOMOLOG_ADMIN_USER:'operator',HOMOLOG_ADMIN_VERIFIER:'scrypt:'+'12'.repeat(16)+':'+scryptSync('synthetic-password',Buffer.from('12'.repeat(16),'hex'),32).toString('hex')};

test('main e bootstrap recusam configuração antes de pool ou escuta',async t=>{
  let calls=0;t.mock.method(mysql,'createPool',()=>{calls++;throw Error('Forbidden pool');});
  for(const config of [{},{...env,STS_RUNTIME:''},{...env,STS_RUNTIME:'production'},{...env,HOMOLOG_ADMIN_VERIFIER:''},{...env,COMMERCE_PRODUCTION_CHECKOUT_ENABLED:'true'}])await assert.rejects(()=>main(config));
  await assert.rejects(()=>openStorage({COMMERCE_MODE:'production'}),/LEGACY_OPERATION_DISABLED/);
  await assert.rejects(()=>applicationRuntime(env),/LEGACY_OPERATION_DISABLED/);
  assert.throws(()=>databaseOptions({},'production'),/LEGACY_OPERATION_DISABLED/);
  assert.throws(()=>realProviders({} as never),/LEGACY_OPERATION_DISABLED/);
  assert.throws(()=>new CommerceService({} as never,{} as never,{} as never),/LEGACY_OPERATION_DISABLED/);
  assert.equal(calls,0);
  assert.throws(()=>createPendingApp(),/ACCESS_POLICY_REQUIRED/);
  assert.throws(()=>createPendingApp(undefined,false,createAccessPolicy(env)),/COMMERCE_DISABLED/);
  assert.throws(()=>createAccessPolicy({...env,HOMOLOG_SITE_ORIGIN:'https://stage.example'}),/TRUSTED_PROXY_REQUIRED/);
  assert.throws(()=>createAccessPolicy({...env,HOMOLOG_SITE_ORIGIN:'https://stsdetox.stsdetox.com.br'}),/ACCESS_ORIGIN/);
});

test('HTTP global: páginas, assets, APIs, métodos e caminhos negativos',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'sts-security-'));
  await mkdir(path.join(dir,'assets'));await writeFile(path.join(dir,'index.html'),'synthetic-site');
  await writeFile(path.join(dir,'assets/video.mp4'),'0123456789');
  await writeFile(path.join(dir,'assets/Imagem aprovada.png'),'synthetic-image');
  const app=createPendingApp(dir,true,createAccessPolicy(env));
  await new Promise<void>(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise<void>(resolve=>app.server.close(()=>resolve()));await rm(dir,{recursive:true});});
  const addr=app.server.address();assert.ok(addr&&typeof addr!=='string');
  const base='http://127.0.0.1:'+addr.port;
  const headers={Host:'127.0.0.1',Authorization:auth};
  for(const route of ['/','/livros','/assets/video.mp4','/api/health','/api/ready','/api/assistente-local','/missing','/.env']){
    for(const method of ['GET','HEAD','POST','OPTIONS']){
      const r=await fetch(base+route,{method,headers:{Host:'127.0.0.1',Range:'bytes=0-2','If-None-Match':'*'}});
      assert.equal(r.status,401);assert.equal(await r.text(),'');assert.equal(r.headers.get('cache-control'),'no-store');
    }
  }
  assert.equal((await fetch(base+'/',{headers})).status,200);
  assert.equal((await fetch(base+'/assets/Imagem%20aprovada.png',{headers})).status,200);
  const range=await fetch(base+'/assets/video.mp4',{headers:{...headers,Range:'bytes=2-4'}});
  assert.equal(range.status,206);assert.equal(await range.text(),'234');assert.equal(range.headers.get('cache-control'),'no-store');
  assert.equal((await fetch(base+'/api/health',{headers})).status,200);
  assert.equal((await fetch(base+'/api/ready',{headers})).status,503);
  for(const route of ['/compra','/compra/','/api/loja','/api/loja/session','/api/loja/quotes','/api/loja/address','/api/loja/orders/x','/api/loja/checkout','/api/loja/webhooks/mercadopago']){
    for(const method of ['GET','POST','HEAD','OPTIONS','PUT','DELETE'])assert.equal((await fetch(base+route,{method,headers})).status,403);
  }
  for(const route of ['/api%2floja/checkout','/assets/%2e%2e/.env','//api/loja','/api//loja'])assert.ok([400,403,404].includes((await fetch(base+route,{headers})).status));
  assert.equal((await fetch(base+'/',{headers:{...headers,Authorization:'Basic '+Buffer.from('operator:wrong').toString('base64')}})).status,401);
  assert.equal((await fetch(base+'/',{headers:{...headers,Host:'evil.example'}})).status,403);
  // No body is sent. Node must reject Expect without entering business code.
  const status=await new Promise<number>((resolve,reject)=>{
    const req=request(base+'/api/loja/webhooks/mercadopago',{method:'POST',headers:{...headers,Expect:'100-continue','Content-Length':'1000'}},res=>{res.resume();resolve(res.statusCode!);});
    req.on('error',reject);req.flushHeaders();
  });
  assert.equal(status,417);
});

test('entradas auxiliares e cron: guardas verificadas sem executar tarefas',async()=>{
  const cron=await readFile('cron-email.js','utf8');
  assert.match(cron,/LEGACY_OPERATION_DISABLED/);assert.doesNotMatch(cron,/import\s|runEmailJob\(/);
  for(const name of await readdir('scripts')){
    if(name.endsWith('.mjs') && name!=='disabled-operation.mjs')assert.ok((await readFile('scripts/'+name,'utf8')).startsWith("import './disabled-operation.mjs';"),name);
  }
  for(const [file,start,effect] of [
    ['server/email-job.ts','export async function runEmailJob','await openStorage'],
    ['server/commerce/email.ts','export async function drainEmails','await store.get'],
    ['server/commerce/email.ts','export async function enqueueEmail','await store.lock'],
  ]){
    const body=(await readFile(file!,'utf8')).slice((await readFile(file!,'utf8')).indexOf(start!));
    assert.ok(body.indexOf('denyLegacyOperation();')>=0 && body.indexOf('denyLegacyOperation();')<body.indexOf(effect!));
  }
  assert.match(await readFile('vite.hostinger.config.ts','utf8'),/command === 'serve'.*LEGACY_OPERATION_DISABLED/);
});
