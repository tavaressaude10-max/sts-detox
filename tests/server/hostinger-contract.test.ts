import test from 'node:test';
import assert from 'node:assert/strict';
import {Server, request} from 'node:http';
import mysql from 'mysql2/promise';
import {createAccessPolicy} from '../../server/access-policy.ts';
import {createPendingApp} from '../../server/app.ts';
import {main} from '../../server/main.ts';

// Configuration fixtures only; never load .env or connect to a database.
const env={STS_RUNTIME:'homologacao',HOST:'0.0.0.0',PORT:'43210',
  HOMOLOG_SITE_ORIGIN:'https://stsdetox.com.br',
  HOMOLOG_ADMIN_USER:'operator',HOMOLOG_ADMIN_VERIFIER:'scrypt:'+'12'.repeat(16)+':'+'00'.repeat(32),
  HOMOLOG_MYSQL_HOST:'127.0.0.1',HOMOLOG_MYSQL_DATABASE:'u897433725_sts_homologa',
  HOMOLOG_MYSQL_USER:'u897433725_sts_homolog',HOMOLOG_MYSQL_PASSWORD:'fixture',
  HOMOLOG_DATA_KEY:'a'.repeat(64),HOMOLOG_F4_SHA256:'b'.repeat(64)};

test('CDN desligado não elimina exigência de proxy comprovado; recusa antes de efeitos',async t=>{
  let effects=0;
  t.mock.method(mysql,'createPool',()=>{effects++;throw Error('No database allowed');});
  t.mock.method(Server.prototype,'listen',()=>{effects++;throw Error('No listener allowed');});
  for(const ips of ['', '*', '0.0.0.0/0', '127.0.0.1/32']){
    await assert.rejects(()=>main({...env,HOMOLOG_TRUSTED_PROXY_IPS:ips}),/TRUSTED_PROXY_REQUIRED/);
  }
  assert.equal(effects,0);
});

test('contrato de escuta usa PORT e HOST do ambiente, sem inicializar MySQL',async t=>{
  let calls=0;
  const beforeInt=process.listeners('SIGINT'), beforeTerm=process.listeners('SIGTERM');
  t.after(()=>{
    for(const fn of process.listeners('SIGINT'))if(!beforeInt.includes(fn))process.removeListener('SIGINT',fn);
    for(const fn of process.listeners('SIGTERM'))if(!beforeTerm.includes(fn))process.removeListener('SIGTERM',fn);
  });
  t.mock.method(mysql,'createPool',()=>{throw Error('No database allowed');});
  t.mock.method(Server.prototype,'listen',function(this:Server,port:number,host:string){
    calls++;assert.equal(port,43210);assert.equal(host,'0.0.0.0');return this;
  });
  await main({...env,HOMOLOG_TRUSTED_PROXY_IPS:'127.0.0.1'});
  assert.equal(calls,1);
  for(const port of ['0','-1','65536','abc','1.5']){
    await assert.rejects(()=>main({...env,PORT:port,HOMOLOG_TRUSTED_PROXY_IPS:'127.0.0.1'}),/PORT/);
  }
  assert.equal(calls,1);
});

for(const trusted of [false,true])test('Host e headers no socket local; proxy simulado confiável='+trusted,async t=>{
  // This loopback address is a test fixture, NOT a proposed Hostinger proxy IP.
  const app=createPendingApp(undefined,true,createAccessPolicy({...env,
    HOMOLOG_TRUSTED_PROXY_IPS:trusted?'127.0.0.1':'192.0.2.1'}));
  await new Promise<void>(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise<void>(resolve=>app.server.close(()=>resolve())));
  const addr=app.server.address();assert.ok(addr&&typeof addr!=='string');
  const probe=(headers:string[])=>new Promise<number>((resolve,reject)=>{
    const req=request({host:'127.0.0.1',port:addr.port,path:'/api/health',headers},res=>{
      assert.equal(res.headers['cache-control'],'no-store');res.resume();resolve(res.statusCode!);
    });req.on('error',reject);req.setTimeout(5000,()=>req.destroy(Error('Timeout')));req.end();
  });
  const valid=['Host','stsdetox.com.br','X-Forwarded-Proto','https'];
  assert.equal(await probe(valid),trusted?401:403);
  for(const host of ['www.stsdetox.com.br','temporary.hostingersite.com','stsdetox.stsdetox.com.br',
    'evil.example','stsdetox.com.br.evil.example','stsdetox.com.br:443','stsdetox.com.br.']){
    assert.equal(await probe(['Host',host,'X-Forwarded-Proto','https',
      'X-Forwarded-Host','stsdetox.com.br','Forwarded','proto=https;host=stsdetox.com.br']),403);
  }
  for(const headers of [
    ['Host','stsdetox.com.br'],
    ['Host','stsdetox.com.br','Forwarded','proto=https;host=stsdetox.com.br'],
    ['Host','stsdetox.com.br','X-Forwarded-Proto','http'],
    ['Host','stsdetox.com.br','X-Forwarded-Proto','https, http'],
    [...valid,'X-Forwarded-Proto','https'],
    [...valid,'Host','stsdetox.com.br'],
  ])assert.equal(await probe(headers),403);
});
