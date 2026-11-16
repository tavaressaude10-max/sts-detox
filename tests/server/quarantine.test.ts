import test from 'node:test';
import assert from 'node:assert/strict';
import {Server, request} from 'node:http';
import mysql from 'mysql2/promise';
import {localFetch} from './http-fixture.ts';
import {createAccessPolicy} from '../../server/access-policy.ts';
import {createPendingApp} from '../../server/app.ts';
import {homologationRuntime} from '../../server/homologation.ts';
import {main} from '../../server/main.ts';

const env={STS_RUNTIME:'homologacao',HOMOLOG_ACCESS_MODE:'quarantine',
  HOMOLOG_SITE_ORIGIN:'https://stsdetox.com.br',HOST:'0.0.0.0',PORT:'43210'};

test('quarentena explícita e imutável; modo inválido não vira fallback',()=>{
  const policy=createAccessPolicy(env);
  assert.equal(policy.mode,'quarantine');assert.equal(Object.isFrozen(policy),true);
  for(const mode of ['', 'shared-proxy', 'true']){
    assert.throws(()=>createAccessPolicy({...env,HOMOLOG_ACCESS_MODE:mode}),/ACCESS_MODE/);
  }
  assert.throws(()=>createAccessPolicy({...env,HOMOLOG_ACCESS_MODE:'restricted'}),/TRUSTED_PROXY_REQUIRED/);
  const {HOMOLOG_ACCESS_MODE:_,...defaultEnv}=env;
  assert.throws(()=>createAccessPolicy(defaultEnv),/TRUSTED_PROXY_REQUIRED/);
  assert.throws(()=>createAccessPolicy({...env,STS_RUNTIME:'production'}),/RUNTIME_REQUIRED/);
  assert.throws(()=>createAccessPolicy({...env,EMAIL_CRON_SEND:'true'}),/UNSAFE_CONFIGURATION/);
  assert.throws(()=>createAccessPolicy({...env,HOMOLOG_SITE_ORIGIN:'http://stsdetox.com.br'}),/HTTPS_REQUIRED/);
});

test('quarentena impede pool e ativação por chamadas diretas',async t=>{
  let pools=0;
  t.mock.method(mysql,'createPool',()=>{pools++;throw Error('Forbidden database');});
  await assert.rejects(()=>homologationRuntime(env),/ACCESS_QUARANTINE/);
  const app=createPendingApp(undefined,true,createAccessPolicy(env));
  assert.throws(()=>app.activateAssistant({} as never),/ACCESS_QUARANTINE/);
  assert.equal(pools,0);
});

test('main inicia sem IP confiável nem credenciais, sem pool; HTTP permanece indisponível',async t=>{
  let pools=0;
  t.mock.method(mysql,'createPool',()=>{pools++;throw Error('Forbidden database');});
  const signals={SIGINT:process.listeners('SIGINT'),SIGTERM:process.listeners('SIGTERM')};
  let server:Server|undefined;
  t.after(async()=>{
    if(server?.listening)await new Promise<void>(resolve=>server!.close(()=>resolve()));
    for(const name of ['SIGINT','SIGTERM'] as const){
      for(const listener of process.listeners(name))if(!signals[name].includes(listener))process.removeListener(name,listener);
    }
  });
  const listen:(this:Server,port:number,host:string,callback:()=>void)=>Server=Server.prototype.listen;
  let ready!:()=>void;
  const listening=new Promise<void>(resolve=>{ready=resolve;});
  t.mock.method(Server.prototype,'listen',function(this:Server,port:number,host:string,callback:()=>void){
    assert.equal(port,43210);assert.equal(host,'0.0.0.0');server=this;
    // Never bind the public interface or fixed port in this test.
    return listen.call(this,0,'127.0.0.1',()=>{callback();ready();});
  });
  await main(env);await listening;
  const address=server!.address();assert.ok(address&&typeof address!=='string');
  const base='http://127.0.0.1:'+address.port;
  for(const route of ['/','/livros','/assets/video-1.mp4','/favicon.ico','/robots.txt',
    '/api/health','/api/ready','/api/assistente-local','/api/loja','/compra','/.env','/assets/%2e%2e/.env']){
    for(const method of ['GET','HEAD','POST','OPTIONS']){
      const response=await localFetch(base+route,{method,headers:{
        Host:'stsdetox.com.br',Authorization:'Basic '+Buffer.from('fixture:fixture').toString('base64'),
        'X-Forwarded-Proto':'https','X-Forwarded-Host':'stsdetox.com.br',
        'X-Forwarded-For':'127.0.0.1','Forwarded':'for=127.0.0.1;proto=https;host=stsdetox.com.br',
        Origin:'https://stsdetox.com.br',Range:'bytes=0-2',
      }});
      assert.equal(response.status,503);assert.equal(await response.text(),'');
      assert.equal(response.headers.get('cache-control'),'no-store');
      assert.equal(response.headers.get('www-authenticate'),null);
      assert.equal(response.headers.get('set-cookie'),null);
      assert.equal(response.headers.get('location'),null);
    }
  }
  assert.equal(pools,0);
});

test('Host alternativo e headers duplicados não liberam quarentena',async t=>{
  const app=createPendingApp('nonexistent-build',true,createAccessPolicy(env));
  await new Promise<void>(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise<void>(resolve=>app.server.close(()=>resolve())));
  const address=app.server.address();assert.ok(address&&typeof address!=='string');
  for(const host of ['stsdetox.com.br','www.stsdetox.com.br','temporary.hostingersite.com','127.0.0.1']){
    await new Promise<void>((resolve,reject)=>{
      const req=request({host:'127.0.0.1',port:address.port,path:'/',headers:[
        'Host',host,'X-Forwarded-Proto','https','X-Forwarded-Proto','https',
      ]},res=>{
        const chunks:Buffer[]=[];res.on('data',chunk=>chunks.push(chunk));
        res.on('end',()=>{try{assert.equal(res.statusCode,503);assert.equal(Buffer.concat(chunks).length,0);resolve();}catch(error){reject(error);}});
      });req.on('error',reject);req.setTimeout(5000,()=>req.destroy(Error('Timeout')));req.end();
    });
  }
});
