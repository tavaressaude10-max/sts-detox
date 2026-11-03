import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const template = await readFile(new URL('../.env.example',import.meta.url),'utf8');
try {
  await writeFile(new URL('../.env.commerce.local',import.meta.url),template.replace('COMMERCE_DATA_KEY=',`COMMERCE_DATA_KEY=${randomBytes(32).toString('hex')}`),{flag:'wx',mode:0o600});
  console.log('Criado .env.commerce.local com chave local privada. Insira os tokens de teste nesse arquivo, nunca no chat.');
} catch(error) {
  if(error.code!=='EEXIST')throw error;
  console.log('.env.commerce.local já existe e foi preservado.');
}
