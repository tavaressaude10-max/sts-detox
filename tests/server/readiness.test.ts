import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import mysql from 'mysql2/promise';
import {applicationRuntime} from '../../server/bootstrap.ts';
import {createPendingApp} from '../../server/app.ts';
import {RecordCipher,keyHash} from '../../server/storage/crypto.ts';

for(const scenario of ['banco indisponível','chave incompatível','schema incorreto','F4 ausente','sucesso','homologação']){
  test('prontidão HTTP e validação MySQL: '+scenario,async t=>{
    const mode=scenario==='homologação'?'test':'production';
    const secret=randomBytes(32).toString('hex');
    const cipher=new RecordCipher(secret);
    const bundle=JSON.parse(await readFile('.private-assistant-node/f4.json','utf8'));
    const records=new Map([[keyHash('schema:v1'),cipher.seal(mode+':schema:v1',{version:scenario==='schema incorreto'?2:1})]]);
    if(scenario!=='F4 ausente')records.set(keyHash('assistant:bundle:v1'),cipher.seal(mode+':assistant:bundle:v1',bundle));
    let closed=false;
    let releaseQuery!:()=>void;
    const gate=new Promise<void>(resolve=>{releaseQuery=resolve;});
    const queries:string[]=[];
    t.mock.method(mysql,'createPool',()=>({
      async execute(sql:string,args?:string[]){
        queries.push(sql);
        await gate;
        if(scenario==='banco indisponível')throw Error('fixture');
        const payload=args && records.get(args[1]!);
        return [payload?[{payload}]:[]];
      },
      async end(){closed=true;}
    }));
    const app=createPendingApp();
    await new Promise<void>(resolve=>app.server.listen(0,'127.0.0.1',resolve));
    t.after(()=>new Promise<void>(resolve=>app.server.close(()=>resolve())));
    const addr=app.server.address();
    assert.ok(addr && typeof addr!=='string');
    const base='http://127.0.0.1:'+addr.port;
    const env={COMMERCE_MODE:mode,COMMERCE_CHECKOUT_DISABLED:'true',COMMERCE_DATA_KEY:secret,MYSQL_TEST_HOST:'localhost',MYSQL_TEST_USER:'fixture',MYSQL_TEST_PASSWORD:'fixture',MYSQL_TEST_DATABASE:'fixture',COMMERCE_STORAGE:'mysql',COMMERCE_SITE_ORIGIN:'https://stage.example',
      COMMERCE_PRODUCTION_DATA_KEY:scenario==='chave incompatível'?randomBytes(32).toString('hex'):secret,
      COMMERCE_PRODUCTION_CHECKOUT_ENABLED:'false',ASSISTANT_ENABLED:'true',MYSQL_PRODUCTION_HOST:'localhost',
      MYSQL_PRODUCTION_USER:'fixture',MYSQL_PRODUCTION_PASSWORD:'fixture',MYSQL_PRODUCTION_DATABASE:'fixture'};
    const pending=applicationRuntime(env);
    const blocked=async()=>{
      for(const route of ['/api/ready','/api/assistente-local','/api/loja/session']){
        assert.equal((await fetch(base+route)).status,503);
      }
    };
    assert.equal((await fetch(base+'/api/health')).status,200);
    await blocked();
    releaseQuery();
    if(scenario==='sucesso' || scenario==='homologação'){
      const runtime=await pending;
      app.activate(runtime.service,runtime.assistant);
      assert.equal((await fetch(base+'/api/ready')).status,200);
      await assert.rejects(()=>runtime.service.checkout('fixture',{}),{code:'checkout_disabled'});
      await runtime.close();
    }else{
      await assert.rejects(pending);
      await blocked();
    }
    assert.ok(queries.length>0 && queries.every(sql=>sql.startsWith('SELECT ')));
    assert.equal(closed,true);
  });
}
