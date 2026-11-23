import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
const read=p=>readFileSync(p,'utf8');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
assert.deepEqual(readdirSync('src/routes').filter(f=>f.endsWith('.tsx')).sort(),['__root.tsx','index.tsx','livros.tsx','nossa-historia.tsx']);
for(const p of ['server','server.js','.env','.private-commerce','.private-assistant','src/routes/compra.tsx']) assert.equal(existsSync(p),false,p);
const sources=walk('src').filter(p=>/\.(tsx?|css)$/.test(p)).map(read).join('\n');
assert.doesNotMatch(sources,/\/api\/loja|\/api\/assistente-local|href=["']\/compra|to=["']\/compra|mercadopago|superfrete/i);
const assistant=read('src/components/AssistenteTavares.tsx')+read('src/lib/assistant-public.ts');
assert.doesNotMatch(assistant,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
const youtube=read('src/components/NossoCanalYoutube.tsx');
for(const u of ['https://www.youtube.com/@DetoxIonicoBioEquilibrio/videos','https://www.youtube.com/playlist?list=PLTVLD5FTEMyE']) assert.ok(youtube.includes(u));
assert.equal((youtube.match(/rel="noopener noreferrer"/g)||[]).length,2);
for(let i=1;i<=9;i++)assert.ok(statSync(`public/assets/video-${i}.mp4`).size>0);
for(const n of [12,10,11,9,13,16,14,15])assert.ok(statSync(`public/assets/historia/Image${n}.jpg`).size>0);
const files=walk('build');
for(const f of files){
 const p=relative('build',f).replaceAll('\\','/');
 assert.doesNotMatch(p,/(^|\/)(?:\.env|\.git|node_modules|server|docs|scripts|\.private|.*\.sqlite)|\.(?:map|ts|tsx|zip|pdf)$/i,p);
 assert.ok(/\.(?:html|js|css|png|jpe?g|webp|avif|svg|ico|mp4|txt)$/.test(p)||p==='.htaccess',p);
 if(/\.(?:js|html)$/.test(f))assert.doesNotMatch(read(f),/\/api\/loja|\/api\/assistente-local|MERCADO_PAGO_ACCESS_TOKEN|MYSQL_PASSWORD|BEGIN (?:RSA )?PRIVATE KEY/);
}
// Literal public media references must resolve; dynamic history assets checked above.
let refs=0;
for(const f of walk('src').filter(p=>/\.(tsx?|json)$/.test(p)))for(const m of read(f).matchAll(/["'](\/assets\/[^"'`$]+)["']/g)){
 const url=m[1].split('?')[0]; assert.ok(existsSync('public'+decodeURI(url)),`${f}: ${url}`); refs++;
}
console.log(`APROVADO: 3 rotas públicas, Assistente sem backend, 2 links YouTube, 9 vídeos originais, 8 fotografias, ${refs} referências locais e ${files.length} arquivos de build sem comércio/arquivos privados.`);
