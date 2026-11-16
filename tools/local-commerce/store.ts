import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ShopError } from './domain.ts';

// Arquivos privados cifrados, fora de public/build. Uma instância local por diretório.
export class PrivateStore {
  directory: string;
  key: Buffer;
  locks = new Map<string, Promise<unknown>>();
  constructor(directory: string, key: string) {
    if (!/^[a-f0-9]{64}$/i.test(key)) throw new Error('Configure COMMERCE_DATA_KEY com 32 bytes aleatórios em hexadecimal.');
    this.directory = path.resolve(directory);
    this.key = Buffer.from(key, 'hex');
  }
  filename(key: string) { return path.join(this.directory, createHash('sha256').update(key).digest('hex') + '.enc'); }
  async get<T>(key: string): Promise<T | undefined> {
    let data: Buffer;
    try { data = await readFile(this.filename(key)); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return undefined; throw e; }
    if (data.length < 29) throw new Error('Arquivo privado inválido.');
    const decipher = createDecipheriv('aes-256-gcm', this.key, data.subarray(0,12));
    decipher.setAAD(Buffer.from(key));
    decipher.setAuthTag(data.subarray(12,28));
    return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')) as T;
  }
  async put(key: string, value: unknown) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(key));
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    const destination = this.filename(key), temp = destination + '.' + randomBytes(6).toString('hex') + '.tmp';
    await writeFile(temp, Buffer.concat([iv, cipher.getAuthTag(), encrypted]), { mode: 0o600, flag: 'wx' });
    await rename(temp, destination);
  }
  async lock<T>(key: string, run: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(key) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(run);
    this.locks.set(key, next);
    try { return await next; } finally { if (this.locks.get(key) === next) this.locks.delete(key); }
  }
}

export function requiredSecret(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new ShopError('not_configured', `Integração não configurada (${name}).`, 503);
  return value.trim();
}
