import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {scryptSync} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {localFetch} from './http-fixture.ts';

const root=path.resolve('.'),entry=path.join(root,'server.js');
const system={SystemRoot:process.env['SystemRoot']};
async function freePort(){const server=createServer();await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const a=server.address();assert.ok(a&&typeof a!=='string');await new Promise<void>(r=>server.close(()=>r()));return a.port;}
async function launch(mode:'quarantine'|'restricted',loader:'direct'|'require'){
  const port=await freePort(),origin=`http://127.0.0.1:${port}`;
  const password='synthetic-local-only',salt='12'.repeat(16);
  const env={...system,STS_RUNTIME:'homologacao',HOMOLOG_ACCESS_MODE:mode,HOST:'127.0.0.1',PORT:String(port),HOMOLOG_SITE_ORIGIN:origin,
    HOMOLOG_ADMIN_USER:'tester',HOMOLOG_ADMIN_VERIFIER:`scrypt:${salt}:${scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex')}`,
    HOMOLOG_MYSQL_HOST:'127.0.0.1',HOMOLOG_MYSQL_DATABASE:'u897433725_sts_homologa',HOMOLOG_MYSQL_USER:'synthetic',HOMOLOG_MYSQL_PASSWORD:'synthetic',HOMOLOG_DATA_KEY:'a'.repeat(64),HOMOLOG_F4_SHA256:'b'.repeat(64)};
  // No real MySQL/network access: intercept before importing the application.
  const require=createRequire(import.meta.url);
  const stub=`import mysql from ${JSON.stringify(pathToFileURL(require.resolve('mysql2/promise')).href)}; mysql.createPool=()=>{throw Error('SYNTHETIC_DB_OFFLINE')};`;
  const args=['--import','data:text/javascript,'+encodeURIComponent(stub),...(loader==='require'?['-e',`require(${JSON.stringify(entry)})`]:[entry])];
  const child=spawn(process.execPath,args,{cwd:tmpdir(),env,stdio:['ignore','pipe','pipe']});
  let logs='';child.stdout.on('data',b=>{logs+=b;});
  const marker=mode==='quarantine'?'[STS_QUARANTINE]':'[STS_F4_UNAVAILABLE]';
  await new Promise<void>((resolve,reject)=>{
    const timeout=setTimeout(()=>{child.kill();reject(Error('Startup timeout'));},8000);
    child.once('error',e=>{clearTimeout(timeout);reject(e);});
    child.once('exit',()=>{clearTimeout(timeout);reject(Error('Startup exited'));});
    child.stderr.on('data',b=>{logs+=b;if(logs.includes(marker)){clearTimeout(timeout);resolve();}});
  });
  return {child,origin,logs:()=>logs,auth:'Basic '+Buffer.from('tester:'+password).toString('base64')};
}
for(const loader of ['direct','require'] as const)test(`entrada ${loader}, cwd externo, quarentena preservada`,async t=>{
  const run=await launch('quarantine',loader);
  t.after(()=>{run.child.kill();});
  for(const route of ['/','/api/ready','/api/assistente-local','/compra','/server.js']){
    const response=await localFetch(run.origin+route);
    assert.equal(response.status,503);assert.equal(await response.text(),'');
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
  assert.doesNotMatch(run.logs(),/ERR_REQUIRE_ASYNC_MODULE|synthetic|password|SELECT/);
});
test('cwd externo: SPA autenticada funciona, F4 falha fechado e loja permanece bloqueada',async t=>{
  const run=await launch('restricted','require');t.after(()=>{run.child.kill();});
  assert.equal((await localFetch(run.origin+'/')).status,401);
  const headers={Authorization:run.auth};
  const home=await localFetch(run.origin+'/',{headers});
  assert.equal(home.status,200);assert.match(await home.text(),/id="root"/);
  assert.equal((await localFetch(run.origin+'/api/ready',{headers})).status,503);
  assert.equal((await localFetch(run.origin+'/compra',{headers})).status,403);
  assert.equal((await localFetch(run.origin+'/api/loja/session',{headers})).status,403);
  assert.ok(run.logs().includes('[STS_LISTENING]'));assert.ok(run.logs().includes('[STS_F4_UNAVAILABLE]'));
  assert.doesNotMatch(run.logs(),/SYNTHETIC_DB_OFFLINE|synthetic|at file:/);
});
test('verificação de pacote independe de cwd e não requer segredos',()=>{
  const r=spawnSync(process.execPath,[path.join(root,'tools/hosting-check.mjs')],{cwd:tmpdir(),env:system,encoding:'utf8',timeout:5000});
  assert.equal(r.status,0);assert.match(r.stdout,/PACOTE_OK/);
});
