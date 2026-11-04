import mysql from 'mysql2/promise';
import {spawn} from 'node:child_process';
import {Duplex} from 'node:stream';
import {homedir} from 'node:os';
import path from 'node:path';
import {RecordCipher,keyHash} from '../.server-build/server/storage/crypto.js';
import {validateBundle,respondFromBundle} from '../.server-build/server/assistant-core.js';

let tunnel, connection;
let stage='entrada privada';
try {
  let input='';
  process.stdin.setEncoding('utf8');
  for await(const chunk of process.stdin)input+=chunk;
  const {user,password,key}=JSON.parse(input);
  if(!user || !password)throw Error();
  const cipher=new RecordCipher(key);
  stage='conexão SSH e autenticação no MySQL de homologação';
  tunnel=spawn('ssh',['-F','NUL','-T','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes',
    '-o','UpdateHostKeys=no','-o','ForwardAgent=no','-o','IdentitiesOnly=yes','-o','ConnectTimeout=8',
    '-i',path.join(homedir(),'.ssh','stsdetox_homologacao'),'-p','65002','-W','127.0.0.1:3306',
    'u897433725@82.180.153.59'],{stdio:['pipe','pipe','ignore'],windowsHide:true});
  const stream=Duplex.from({readable:tunnel.stdout,writable:tunnel.stdin});
  tunnel.on('error',()=>stream.destroy(new Error('SSH')));
  connection=await mysql.createConnection({stream,user,password,database:'u897433725_sts_homologa',connectTimeout:12000});
  async function read(name){
    const [rows]=await connection.execute('SELECT payload FROM sts_records WHERE environment=? AND record_key=?',['test',keyHash(name)]);
    if(rows.length!==1)throw Error();
    return cipher.open('test:'+name,rows[0].payload);
  }
  stage='leitura autenticada do schema v1';
  if((await read('schema:v1'))?.version!==1)throw Error();
  console.log('Schema v1 autenticado.');
  stage='leitura e validação das oito respostas';
  const bundle=validateBundle(await read('assistant:bundle:v1'));
  const records=bundle.records;
  if(records.length!==8 || new Set(records.map(r=>r.id)).size!==8 || new Set(records.map(r=>r.text.trim())).size!==8)throw Error();
  for(const record of records){
    if(respondFromBundle(bundle,{question:record.aliases[0]}).answer?.text!==record.text)throw Error();
  }
  stage='referência à página 10 da Enciclopédia';
  if(!records.some(r=>r.book_id==='livro-4' && r.pdf_page===10 && r.title.startsWith('Enciclopédia')))throw Error();
  console.log('F4 autenticado: oito respostas distintas e Enciclopédia, página 10 do PDF.');
}catch{
  console.error('Verificação interrompida na etapa de '+stage+'.');
  process.exitCode=1;
}finally{
  connection?.destroy();
  tunnel?.kill();
}
