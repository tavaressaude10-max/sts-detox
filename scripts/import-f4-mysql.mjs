import { readFile } from 'node:fs/promises';
import { validateBundle } from '../.server-build/server/assistant-core.js';
import { openStorage } from '../.server-build/server/bootstrap.js';
async function run(){
  const arg=process.argv.indexOf('--file');
  const filename=arg>=0?process.argv[arg+1]:'.private-assistant-node/f4.json';
  const bundle=validateBundle(JSON.parse(await readFile(filename,'utf8')));
  if(!process.argv.includes('--apply')){console.log(`F4 válido: ${bundle.records.length} respostas; simulação sem conexão ao banco.`);return;}
  if(process.env.COMMERCE_MODE==='production'&&!process.argv.includes('--confirm-production'))throw Error();
  if((process.env.COMMERCE_STORAGE||'mysql')!=='mysql')throw Error();
  const runtime=await openStorage(process.env);
  try {
    await runtime.store.lock('assistant:bundle:v1',async()=>{
      const old=await runtime.store.get('assistant:bundle:v1');
      if(old&&JSON.stringify(old)!==JSON.stringify(bundle))throw Error('Base existente diferente. Exige migração explícita versionada.');
      if(!old)await runtime.store.put('assistant:bundle:v1',bundle);
    });
    console.log('F4 importado/verificado no banco privado; acervo original não alterado.');
  }finally {await runtime.close();}
}
run().catch(()=>{console.error('Importação não concluída. Originais e base existente preservados. Confira arquivo, ambiente e banco.');process.exitCode=1;});
