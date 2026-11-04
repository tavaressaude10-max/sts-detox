import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const directory=process.argv[2];
assert.ok(directory,'Informe o diretório extraído do ZIP.');
const host='127.0.0.1';
async function bind(server){
  await new Promise(resolve=>server.listen(0,host,resolve));
  return server.address().port;
}
// Aceita a conexão TCP sem completar a negociação MySQL.
const db=net.createServer(socket=>socket.on('error',()=>socket.destroy()));
const dbPort=await bind(db);
try {
  for(let attempt=0;attempt<3;attempt++){
    const reserve=net.createServer();
    const port=await bind(reserve);
    await new Promise(resolve=>reserve.close(resolve));
    const start=performance.now();
    const child=spawn(process.execPath,['homologacao.mjs'],{cwd:directory,stdio:'ignore',env:{
      SystemRoot:process.env.SystemRoot,HOST:host,PORT:String(port),HOMOLOG_SITE_ORIGIN:'https://stage.example',
      HOMOLOG_DATA_KEY:randomBytes(32).toString('hex'),HOMOLOG_MYSQL_HOST:host,HOMOLOG_MYSQL_PORT:String(dbPort),
      HOMOLOG_MYSQL_DATABASE:'fixture',HOMOLOG_MYSQL_USER:'fixture',HOMOLOG_MYSQL_PASSWORD:'fixture'
    }});
    const ended=new Promise(resolve=>child.once('exit',resolve));
    try {
      const base='http://'+host+':'+port;
      for(;;){
        const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)}).catch(()=>null);
        if(response?.ok)break;
        assert.ok(performance.now()-start<3000,'HTTP não respondeu a tempo');
        await delay(15);
      }
      const elapsed=Math.ceil(performance.now()-start);
      assert.ok(elapsed<3000);
      for(const [route,status] of [['/',200],['/livros',200],['/api/ready',503],['/api/loja/session',503],['/api/assistente-local',503]]){
        assert.equal((await fetch(base+route)).status,status,route);
      }
      console.log('HTTP disponível em '+elapsed+' ms; rotas verificadas.');
    }finally{child.kill();await ended;}
  }
}finally{db.close();}
