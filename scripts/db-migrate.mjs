import { databasePool,schemaStatements,MysqlStore } from '../.server-build/server/storage/mysql.js';
import { configFromEnv } from '../.server-build/server/commerce/providers.js';
async function run(){
  if(!process.argv.includes('--apply')){console.log('Simulação: schema sts_records/sts_locks InnoDB. Nada conectado ou modificado. Use --apply só após configurar o banco.');return;}
  const config=configFromEnv(process.env);
  if(config.mode==='production'&&!process.argv.includes('--confirm-production'))throw Error();
  const pool=databasePool(process.env,config.mode);
  try {
    // Somente CREATE IF NOT EXISTS; nunca DROP/TRUNCATE/DELETE.
    for(const sql of schemaStatements)await pool.query(sql);
    const store=new MysqlStore(pool,config.mode,config.dataKey);
    await store.lock('schema:v1',async()=>{const marker=await store.get('schema:v1');if(!marker)await store.put('schema:v1',{version:1});});
    console.log('Schema v1 disponível. Registros existentes preservados.');
  }finally {await pool.end();}
}
run().catch(()=>{console.error('Migração não concluída. Confira configuração e permissões; detalhes sensíveis omitidos.');process.exitCode=1;});
