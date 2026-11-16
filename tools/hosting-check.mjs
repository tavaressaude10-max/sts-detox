import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// Offline packaging check: no listener, database, credentials or provider calls.
const root=new URL('../',import.meta.url);
const required=['server.js','package.json','package-lock.json','build/index.html',
  '.server-build/server/main.js','.server-build/server/app.js',
  '.server-build/server/access-policy.js','.server-build/server/homologation.js',
  '.server-build/server/assistant-core.js','.server-build/server/commerce/service.js',
  '.server-build/server/storage/mysql.js'];
let failed=false;
const reject=message=>{failed=true;console.error(message);};
const [major,minor]=process.versions.node.split('.').map(Number);
if(major!==22 || minor<12)reject('NODE: usar linha 22 >=22.12.');
for(const name of required){try{await access(new URL(name,root));}catch{reject(`AUSENTE: ${name}`);}}
const require=createRequire(new URL('../package.json',import.meta.url));
for(const name of ['mysql2/promise','nodemailer']){try{require.resolve(name);}catch{reject(`DEPENDENCIA: ${name}`);}}
try{
  const html=await readFile(new URL('build/index.html',root),'utf8');
  for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)){
    await access(new URL('build'+match[1],root));
  }
}catch{reject('FRONTEND: index/assets incompletos.');}
if(failed)process.exitCode=1;
else console.log('PACOTE_OK: entrada, frontend, backend e dependências presentes. Não comprova MySQL/proxy/F4 hospedados.');

// Optional configuration validation, still no connection and no secret output.
if(!failed && process.argv.includes('--config')){
  try{
    const {createAccessPolicy}=await import(new URL('.server-build/server/access-policy.js',root).href);
    const policy=createAccessPolicy(process.env);
    if(policy.mode==='restricted'){
      const {homologationConfig}=await import(new URL('.server-build/server/homologation.js',root).href);
      homologationConfig(process.env);
    }
    console.log(policy.mode==='quarantine'?'CONFIG_QUARANTINE: HTTP 503 é esperado; nenhum acesso funcional.':'CONFIG_RESTRICTED: formato válido; conexão, permissões e proxy ainda exigem teste.');
  }catch{console.error('CONFIG_INVALIDA: conferir variáveis obrigatórias no guia; nenhum valor foi registrado.');process.exitCode=1;}
}
