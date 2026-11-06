import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import ts from 'typescript';

const env = parseEnv(readFileSync('.env.commerce.local','utf8'));
const secrets = Object.entries(env).filter(([k,v]) => /TOKEN|SECRET|DATA_KEY/.test(k) && v.length >= 16);
const git = (...args) => execFileSync('git',args,{maxBuffer:100*1024*1024});
const files = new Set(git('ls-files','-z').toString().split('\0').filter(Boolean));
function walk(dir) { for (const e of readdirSync(dir,{withFileTypes:true})) { const p=dir+'/'+e.name; if(e.isDirectory())walk(p);else files.add(p); } }
for(const dir of ['src','server','public','build','docs','scripts'])if(existsSync(dir))walk(dir);
const hits=[];
for(const file of files)if(existsSync(file)) { const data=readFileSync(file); for(const [key,value] of secrets)if(data.includes(Buffer.from(value)))hits.push({file,key}); }
const objects=git('rev-list','--objects','--all').toString().trim().split('\n');
let blobs=0; const historyHits=[];
for(const row of objects) { const id=row.split(' ')[0]; if(git('cat-file','-t',id).toString().trim()!=='blob')continue;blobs++;const data=git('cat-file','blob',id);for(const [key,value]of secrets)if(data.includes(Buffer.from(value)))historyHits.push({object:id,key}); }
console.log(JSON.stringify({configuration:Object.fromEntries(Object.entries(env).map(([k,v])=>[k,/TOKEN|SECRET|DATA_KEY|SELLER/.test(k)?Boolean(v):v])),filesScanned:files.size,knownSecretHits:hits,historyBlobs:blobs,historyKnownSecretHits:historyHits}));
const moduleOf = s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const faqs=await import(moduleOf(readFileSync('src/lib/assistant-faq.ts','utf8')));
let report='# Diferenças exatas das FAQs — auditoria de prontidão\n\nConteúdo apenas comparado; nenhuma FAQ foi alterada.\n';
for(const [file,name,key]of [['index','duvidas','homeFaq'],['livros','duvidasLivros','booksFaq']]) {
 const page=readFileSync(`src/routes/${file}.tsx`,'utf8');
 const array=page.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`))[1];
 const {items}=await import(moduleOf(`export const items=${array}`));
 report+=`\n## ${file}: página ${items.length} itens; Assistente ${faqs[key].length} itens\n`;
 for(let i=0;i<Math.max(items.length,faqs[key].length);i++) {
  const a=faqs[key][i],p=items[i];if(JSON.stringify(a)===JSON.stringify(p))continue;
  report+=`\n### Posição ${i+1}\n\n**Assistente:** ${a?.q??'(ausente)'}\n\n${a?.a??''}\n\n**Página:** ${p?.q??'(ausente)'}\n\n${p?.a??''}\n`;
 }
}
writeFileSync('docs/DIVERGENCIAS_FAQ_PRODUCAO.md',report);
console.log('Diferenças completas em docs/DIVERGENCIAS_FAQ_PRODUCAO.md.');
