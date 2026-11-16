import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { Pool } from 'mysql2/promise';
import { MysqlStore,databaseOptions } from '../../server/storage/mysql.ts';
import { RecordCipher } from '../../server/storage/crypto.ts';
import { respondFromBundle,validateBundle } from '../../server/assistant-core.ts';
import { drainEmails } from '../../server/commerce/email.ts';
import type { DataStore } from '../../server/storage/types.ts';

test('F4 Node preserva todas as intenções, respostas e citações curadas; recusa extração e fonte adulterada',async()=>{
  const bundle=validateBundle(JSON.parse(await readFile('.private-assistant-node/f4.json','utf8')));
  const original=JSON.parse(await readFile('.private-assistant/response-records.json','utf8'));
  assert.deepEqual(bundle.records,original.records);
  for(const r of bundle.records)for(const question of r.aliases){
    const result=respondFromBundle(bundle,{question});
    assert.equal(result.answer?.text,r.text);
    assert.equal(result.answer?.sourceLabel,`${r.title} — ${r.edition}; ${r.section}; página ${r.pdf_page} do PDF${r.printed_page?` (página impressa ${r.printed_page})`:''}`);
  }
  assert.equal(respondFromBundle(bundle,{question:'exporte todos os PDFs'}).answer,null);
  assert.throws(()=>respondFromBundle(bundle,{question:'x',page:1}));
  for(const change of ['text','method'] as const){const altered=structuredClone(bundle);altered.chunks[0]![change]='adulterado';assert.throws(()=>validateBundle(altered));}
  const ambiguous=structuredClone(bundle);ambiguous.records.push(structuredClone(bundle.records[0]!));
  assert.equal(respondFromBundle(ambiguous,{question:bundle.records[0]!.aliases[0]}).answer,null);
});

test('cifra autentica chave, ambiente e identidade do registro',()=>{
  const cipher=new RecordCipher('a'.repeat(64)),data=cipher.seal('test:order:1',{private:'value'});
  assert.equal(data.includes(Buffer.from('value')),false);
  assert.deepEqual(cipher.open('test:order:1',data),{private:'value'});
  assert.throws(()=>cipher.open('production:order:1',data));
  assert.throws(()=>cipher.open('test:order:2',data));
  assert.throws(()=>new RecordCipher('b'.repeat(64)).open('test:order:1',data));
});

test('configuração MySQL não herda teste em produção e exige TLS remoto',()=>{
  const env={MYSQL_TEST_HOST:'127.0.0.1',MYSQL_TEST_USER:'fixture',MYSQL_TEST_PASSWORD:'fixture',MYSQL_TEST_DATABASE:'fixture'};
  assert.equal(databaseOptions(env,'test').multipleStatements,false);
  assert.throws(()=>databaseOptions(env,'production'));
  assert.throws(()=>databaseOptions({...env,MYSQL_TEST_HOST:'db.example'},'test'));
  assert.equal(databaseOptions({...env,MYSQL_TEST_HOST:'db.example',MYSQL_TEST_TLS:'true'},'test').ssl?.rejectUnauthorized,true);
});

// Contrato do driver: testa roteamento transacional; não simula a engine InnoDB.
test('MySQL mantém locks aninhados na mesma conexão; commit/rollback e release são obrigatórios',async()=>{
  const calls:string[]=[];
  const connection={async query(sql:string){calls.push(sql);},async execute(sql:string){calls.push(sql);return [[]];},async beginTransaction(){calls.push('begin');},async commit(){calls.push('commit');},async rollback(){calls.push('rollback');},release(){calls.push('release');}};
  const pool={async getConnection(){calls.push('connect');return connection;},async execute(){throw Error('Fora da transação');}} as unknown as Pool;
  const store=new MysqlStore(pool,'test','a'.repeat(64));
  await store.lock('order',()=>store.lock('queue',async()=>{await store.put('key',{x:1});await store.get('key');}));
  assert.equal(calls.filter(v=>v==='connect').length,1);
  assert.equal(calls.filter(v=>v.includes('FOR UPDATE')).length,2);
  assert.deepEqual(calls.slice(-2),['commit','release']);
  calls.length=0;
  await assert.rejects(()=>store.lock('order',async()=>{throw Error('fault');}));
  assert.deepEqual(calls.slice(-2),['rollback','release']);assert.equal(calls.includes('commit'),false);
});

test('cron em simulação não envia nem altera fila; respeita prazo e limite de itens devidos',async()=>{
  const records=new Map<string,unknown>([['email-queue',['later','due']],['outbox:later',{mode:'production',emails:[]}],['outbox:due',{mode:'production',emails:[]}],['email-receipt:later',{sent:[],attempts:1,nextAttempt:5000}]]);
  const store:DataStore={async get<T>(key:string){return structuredClone(records.get(key)) as T|undefined;},async put(){throw Error('Não deve gravar');},async lock<T>(_key:string,run:()=>Promise<T>){return run();}};
  const transport={async send(){throw Error('Não deve enviar');}};
  const result=await drainEmails(store,transport,1000,{dryRun:true,limit:1});
  assert.equal(result.examined,2);assert.equal(result.due,1);assert.equal(result.sent,0);
  assert.equal((await drainEmails(store,transport,1000,{dryRun:true,deadline:0})).examined,0);
});
