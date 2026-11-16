import {createAccessPolicy, requireHomologation} from './access-policy.ts';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import { RecordCipher, keyHash } from './storage/crypto.ts';
import { validateBundle, sha256 } from './assistant-core.ts';

// Separate environment: never inherit production credentials or provider tokens.
export function homologationConfig(env: NodeJS.ProcessEnv) {
  requireHomologation(env);
  if (env['HOMOLOG_MYSQL_DATABASE'] !== 'u897433725_sts_homologa') throw Error('HOMOLOG_DATABASE');
  if (env['HOMOLOG_MYSQL_HOST'] !== '127.0.0.1' || (env['HOMOLOG_MYSQL_PORT'] || '3306') !== '3306') throw Error('HOMOLOG_ENDPOINT');
  if (!env['HOMOLOG_MYSQL_USER'] || !env['HOMOLOG_MYSQL_PASSWORD']) throw Error('HOMOLOG_CREDENTIALS');
  const key = env['HOMOLOG_DATA_KEY'] || '';
  if (!/^[a-f0-9]{64}$/i.test(key)) throw Error('HOMOLOG_KEY');
  const digest=env['HOMOLOG_F4_SHA256'] || '';
  if(!/^[a-f0-9]{64}$/.test(digest))throw Error('HOMOLOG_F4_DIGEST');
  const origin = new URL(env['HOMOLOG_SITE_ORIGIN'] || '');
  if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash ||
      (origin.protocol !== 'https:' && !(origin.protocol === 'http:' && origin.hostname === '127.0.0.1' && env['HOST'] === '127.0.0.1'))) throw Error('HOMOLOG_ORIGIN');
  const tls = env['HOMOLOG_MYSQL_TLS'];
  if (tls !== undefined && tls !== 'false' && tls !== 'true') throw Error('HOMOLOG_TLS');
  return { origin: origin.origin, key, digest, database: {
    host: '127.0.0.1', port: 3306, database: 'u897433725_sts_homologa',
    user: env['HOMOLOG_MYSQL_USER'], password: env['HOMOLOG_MYSQL_PASSWORD'],
    connectionLimit: 2, waitForConnections: true, queueLimit: 10, connectTimeout: 10000,
    charset: 'utf8mb4', multipleStatements: false,
    ...(tls === 'true' ? {ssl: {rejectUnauthorized: true}} : {}),
  }};
}

// Exposes neither a pool, generic SQL, put(), nor lock(). Only two fixed SELECTs.
export async function homologationRuntime(env: NodeJS.ProcessEnv) {
  // Direct callers cannot bypass quarantine to initialize the database.
  if(createAccessPolicy(env).mode==='quarantine')throw Error('ACCESS_QUARANTINE');
  const config = homologationConfig(env);
  const cipher = new RecordCipher(config.key);
  const pool = mysql.createPool(config.database);
  async function read(name: 'schema:v1' | 'assistant:bundle:v1') {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT payload FROM sts_records WHERE environment=? AND record_key=?', ['test', keyHash(name)]);
    if (rows.length !== 1) throw Error('HOMOLOG_RECORD');
    return cipher.open<unknown>('test:' + name, Buffer.from(rows[0]!['payload']));
  }
  const repository = {async load() {
    const bundle = validateBundle(await read('assistant:bundle:v1'));
    if(sha256(JSON.stringify(bundle))!==config.digest)throw Error('HOMOLOG_F4_IDENTITY');
    if (bundle.records.length !== 8 || new Set(bundle.records.map(r => r.id)).size !== 8 ||
        !bundle.records.some(r => r.book_id === 'livro-4' && r.pdf_page === 10)) throw Error('HOMOLOG_F4');
    return bundle;
  }};
  try {
    const schema = await read('schema:v1') as {version?: unknown} | null;
    if (schema?.version !== 1) throw Error('HOMOLOG_SCHEMA');
    await repository.load();
    return {assistant: {origin: config.origin, enabled: true, repository}, close: () => pool.end()};
  } catch (error) { await pool.end(); throw error; }
}
