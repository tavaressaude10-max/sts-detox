import { AsyncLocalStorage } from 'node:async_hooks';
import mysql from 'mysql2/promise';
import type { Pool,PoolConnection,RowDataPacket } from 'mysql2/promise';
import type { DataStore } from './types.ts';
import { RecordCipher,keyHash } from './crypto.ts';

export const schemaStatements=[
  `CREATE TABLE IF NOT EXISTS sts_records (environment VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, record_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, payload MEDIUMBLOB NOT NULL, updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), PRIMARY KEY(environment,record_key)) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS sts_locks (environment VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, lock_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, PRIMARY KEY(environment,lock_key)) ENGINE=InnoDB`,
];
export function databaseOptions(env:NodeJS.ProcessEnv,mode:'test'|'production') {
  const prefix=mode==='production'?'MYSQL_PRODUCTION_':'MYSQL_TEST_';
  const host=env[prefix+'HOST'],user=env[prefix+'USER'],password=env[prefix+'PASSWORD'],database=env[prefix+'DATABASE'];
  const port=Number(env[prefix+'PORT'] || 3306);
  if(!host||!user||!password||!database||!Number.isInteger(port)||port<1||port>65535)throw Error('Configure as variáveis MySQL do ambiente selecionado.');
  const local=['127.0.0.1','localhost','::1'].includes(host);
  const tls=env[prefix+'TLS']==='true';
  if(!local&&!tls)throw Error('MySQL remoto exige TLS com certificado válido.');
  return {host,port,user,password,database,connectionLimit:5,waitForConnections:true,queueLimit:20,connectTimeout:10_000,
    charset:'utf8mb4',multipleStatements:false,...(tls?{ssl:{rejectUnauthorized:true}}:{})};
}
export function databasePool(env:NodeJS.ProcessEnv,mode:'test'|'production'){return mysql.createPool(databaseOptions(env,mode));}

// InnoDB: os locks são compartilhados por processos, inclusive cron e Web App.
// Nenhum DDL é executado durante uma requisição ou startup normal.
export class MysqlStore implements DataStore {
  private context=new AsyncLocalStorage<{connection:PoolConnection;held:Set<string>}>();
  private cipher:RecordCipher;
  readonly pool:Pool; readonly mode:'test'|'production';
  constructor(pool:Pool,mode:'test'|'production',secret:string){this.pool=pool;this.mode=mode;this.cipher=new RecordCipher(secret);}
  private executor(){return this.context.getStore()?.connection || this.pool;}
  async get<T>(key:string):Promise<T|undefined>{const [rows]=await this.executor().execute<RowDataPacket[]>('SELECT payload FROM sts_records WHERE environment=? AND record_key=?',[this.mode,keyHash(key)]);
    if(!rows[0])return undefined;return this.cipher.open<T>(`${this.mode}:${key}`,Buffer.from(rows[0]['payload']));}
  async put(key:string,value:unknown){const payload=this.cipher.seal(`${this.mode}:${key}`,value);
    await this.executor().execute('INSERT INTO sts_records (environment,record_key,payload) VALUES (?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',[this.mode,keyHash(key),payload]);}
  private async acquire(key:string,scope:{connection:PoolConnection;held:Set<string>}){const hash=keyHash(key);if(scope.held.has(hash))return;
    await scope.connection.execute('INSERT IGNORE INTO sts_locks (environment,lock_key) VALUES (?,?)',[this.mode,hash]);
    await scope.connection.execute('SELECT lock_key FROM sts_locks WHERE environment=? AND lock_key=? FOR UPDATE',[this.mode,hash]);scope.held.add(hash);}
  async lock<T>(key:string,run:()=>Promise<T>):Promise<T>{
    const current=this.context.getStore();if(current){await this.acquire(key,current);return run();}
    const connection=await this.pool.getConnection();
    try {
      await connection.query('SET SESSION innodb_lock_wait_timeout=15');
      await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
      await connection.beginTransaction();
      const scope={connection,held:new Set<string>()};
      const result=await this.context.run(scope,async()=>{await this.acquire(key,scope);return run();});
      await connection.commit();return result;
    }catch(error){try{await connection.rollback();}catch{/* preservar erro original */}throw error;}
    finally {connection.release();}
  }
  async check(){await this.pool.execute('SELECT record_key FROM sts_records LIMIT 0');await this.pool.execute('SELECT lock_key FROM sts_locks LIMIT 0');}
  async close(){await this.pool.end();}
}
