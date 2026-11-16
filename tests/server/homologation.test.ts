import {localFetch as fetch} from './http-fixture.ts';
import {scryptSync} from 'node:crypto';
import {createAccessPolicy} from '../../server/access-policy.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {homologationConfig, homologationRuntime} from '../../server/homologation.ts';
import {RecordCipher, keyHash} from '../../server/storage/crypto.ts';
import {sha256} from '../../server/assistant-core.ts';
import {createPendingApp} from '../../server/app.ts';

const env={STS_RUNTIME:'homologacao',HOST:'127.0.0.1',HOMOLOG_SITE_ORIGIN:'http://127.0.0.1',
  HOMOLOG_MYSQL_HOST:'127.0.0.1',HOMOLOG_MYSQL_PORT:'3306',HOMOLOG_MYSQL_DATABASE:'u897433725_sts_homologa',
  HOMOLOG_MYSQL_USER:'fixture',HOMOLOG_MYSQL_PASSWORD:'fixture',HOMOLOG_DATA_KEY:'a'.repeat(64)};
Object.assign(env,{HOMOLOG_ADMIN_USER:'operator',HOMOLOG_ADMIN_VERIFIER:'scrypt:'+ '12'.repeat(16)+':'+scryptSync('synthetic-password',Buffer.from('12'.repeat(16),'hex'),32).toString('hex')});
const text='Resposta sintetica.';
const bundle={version:1,source:{recordsSha256:'b'.repeat(64),indexSha256:'c'.repeat(64)},
  chunks:[{chunk_id:'fixture',text,book:'livro-4',pdf_page:10,method:'native'}],
  records:Array.from({length:8},(_,i)=>({id:String(i),aliases:['pergunta '+i],text,book_id:'livro-4',pdf_page:10,
    printed_page:null,section:'Teste',title:'Livro sintetico',edition:'Teste',status:'approved',max_words:10,
    evidence:[{chunk_id:'fixture',sha256:sha256(text),method:'native'}]}))};
Object.assign(env,{HOMOLOG_F4_SHA256:sha256(JSON.stringify(bundle))});

test('homologação recusa produção e configuração inválida antes do pool',async t=>{
  let pools=0;
  t.mock.method(mysql,'createPool',()=>{pools++;throw Error('pool must not run');});
  for(const overrides of [
    {HOMOLOG_MYSQL_DATABASE:'u897433725_sts_producao'}, {HOMOLOG_MYSQL_DATABASE:''},
    {HOMOLOG_MYSQL_HOST:'srv815.hstgr.io'}, {HOMOLOG_MYSQL_PORT:'3307'},
    {HOMOLOG_MYSQL_PASSWORD:''}, {HOMOLOG_DATA_KEY:''}, {HOMOLOG_F4_SHA256:''}, {HOMOLOG_SITE_ORIGIN:'http://stage.example'},
  ]) await assert.rejects(()=>homologationRuntime({...env,...overrides}));
  assert.equal(pools,0);
  const config=homologationConfig({...env,MYSQL_PRODUCTION_DATABASE:'production',COMMERCE_PRODUCTION_DATA_KEY:'ignored'});
  assert.equal(config.database.database,'u897433725_sts_homologa');
  assert.equal(config.database.port,3306);
  assert.equal(config.database.ssl,undefined);
});

for(const scenario of ['ok','schema','key','missing','f4','identity','offline']){
  test('homologação SELECT/F4/HTTP: '+scenario,async t=>{
    const cipher=new RecordCipher(scenario==='key'?'d'.repeat(64):env.HOMOLOG_DATA_KEY);
    const data=new Map([
      [keyHash('schema:v1'),cipher.seal('test:schema:v1',{version:scenario==='schema'?2:1})],
      [keyHash('assistant:bundle:v1'),cipher.seal('test:assistant:bundle:v1',scenario==='f4'?{}:bundle)],
    ]);
    let closed=false;
    const queries:string[]=[];
    t.mock.method(mysql,'createPool',(options:unknown)=>{
      assert.equal((options as {database:string}).database,'u897433725_sts_homologa');
      return {async execute(sql:string,args:string[]){
        assert.equal(sql,'SELECT payload FROM sts_records WHERE environment=? AND record_key=?');
        assert.equal(args[0],'test');
        assert.ok(args[1]===keyHash('schema:v1')||args[1]===keyHash('assistant:bundle:v1'));
        queries.push(sql);
        if(scenario==='offline')throw Error('fixture');
        const payload=scenario==='missing'?undefined:data.get(args[1]!);
        return [payload?[{payload}]:[]];
      },async end(){closed=true;}};
    });
    if(scenario!=='ok'){
      await assert.rejects(()=>homologationRuntime(scenario==='identity'?{...env,HOMOLOG_F4_SHA256:'0'.repeat(64)}:env));
      assert.equal(closed,true);return;
    }
    const runtime=await homologationRuntime(env);
    assert.deepEqual(Object.keys(runtime).sort(),['assistant','close']);
    assert.deepEqual(Object.keys(runtime.assistant.repository),['load']);
    const app=createPendingApp(undefined,true,createAccessPolicy(env));
    await new Promise<void>(resolve=>app.server.listen(0,'127.0.0.1',resolve));
    t.after(async()=>{await new Promise<void>(resolve=>app.server.close(()=>resolve()));await runtime.close();});
    const addr=app.server.address();assert.ok(addr&&typeof addr!=='string');
    const base='http://127.0.0.1:'+addr.port;
    const call=(url:string,options:RequestInit={})=>fetch(url,{...options,headers:{Host:'127.0.0.1',Authorization:'Basic '+Buffer.from('operator:synthetic-password').toString('base64'),...options.headers}});
    assert.equal((await call(base+'/api/health')).status,200);
    assert.equal((await call(base+'/api/ready')).status,503);
    app.activateAssistant(runtime.assistant);
    assert.equal((await call(base+'/api/ready')).status,200);
    const before=queries.length;
    for(const route of ['/compra','/api/loja','/api/loja/session','/api/loja/quotes','/api/loja/address','/api/loja/orders/fixture','/api/loja/checkout','/api/loja/webhooks/mercadopago']){
      for(const method of ['GET','POST','HEAD','OPTIONS'])assert.equal((await call(base+route,{method})).status,403);
    }
    assert.equal(queries.length,before);
    const options={method:'POST',headers:{'Content-Type':'application/json','Origin':env.HOMOLOG_SITE_ORIGIN,'X-Tavares-Local':'1'},body:JSON.stringify({question:'pergunta 0'})};
    const response=await call(base+'/api/assistente-local',options);
    assert.equal(response.status,200);assert.equal((await response.json()).answer.text,text);
    assert.equal((await call(base+'/api/assistente-local',{...options,headers:{...options.headers,Origin:'https://wrong.example'}})).status,403);
    assert.equal(queries.length,before+1);
    const anonymousBefore=queries.length;
    assert.equal((await fetch(base+'/api/assistente-local',{...options,headers:{...options.headers,Host:'127.0.0.1'}})).status,401);
    assert.equal(queries.length,anonymousBefore);
    data.delete(keyHash('assistant:bundle:v1'));
    assert.equal((await call(base+'/api/ready')).status,503);
  });
}
