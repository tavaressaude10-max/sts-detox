import path from 'node:path';
import { configFromEnv,realProviders } from './commerce/providers.ts';
import { CommerceService } from './commerce/service.ts';
import { PrivateStore } from './commerce/store.ts';
import { databasePool,MysqlStore } from './storage/mysql.ts';
import { StoredAssistantRepository } from './assistant-core.ts';
import { FileAssistantRepository } from './assistant-file.ts';
import type { DataStore } from './storage/types.ts';
import type { AssistantRepository } from './assistant-core.ts';
import { privateDirectory,lockRuntime } from './runtime.ts';

export async function openStorage(env:NodeJS.ProcessEnv){
  const config=configFromEnv(env);
  const backend=env['COMMERCE_STORAGE'] || 'mysql';
  let store:DataStore,repository:AssistantRepository,close:()=>Promise<void>;
  if(backend==='mysql'){
    const database=new MysqlStore(databasePool(env,config.mode),config.mode,config.dataKey);
    try{await database.check();const schema=await database.get<{version:number}>('schema:v1');if(schema?.version!==1)throw Error('Execute a migração explícita do banco antes de iniciar.');}catch(error){await database.close();throw error;}
    store=database;repository=new StoredAssistantRepository(store);close=()=>database.close();
  }else if(backend==='file'&&config.mode==='test'){
    const directory=await privateDirectory(config.directory);const release=await lockRuntime(directory,'test');
    store=new PrivateStore(directory,config.dataKey);repository=new FileAssistantRepository(path.resolve('.private-assistant-node/f4.json'));close=release;
  }else throw Error('Produção exige COMMERCE_STORAGE=mysql.');
  return {config,store,repository,close};
}
export async function applicationRuntime(env:NodeJS.ProcessEnv){
  const runtime=await openStorage(env);
  try {
    const enabled=env['ASSISTANT_ENABLED']==='true';
    if(enabled || runtime.config.mode==='production'){
      const bundle=await runtime.repository.load();
      if(bundle.records.length!==8 || new Set(bundle.records.map(record=>record.id)).size!==8 ||
        !bundle.records.some(record=>record.book_id==='livro-4' && record.pdf_page===10))throw Error('F4 incompleto.');
    }
    return {...runtime,service:new CommerceService(runtime.store,realProviders(runtime.config),runtime.config),
      assistant:{origin:runtime.config.origin,enabled,repository:runtime.repository}};
  }catch(error){await runtime.close();throw error;}
}
