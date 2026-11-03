// Apenas LOCAL: lê SQLite original em modo readOnly e nunca altera o acervo.
import { DatabaseSync } from 'node:sqlite';
import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateBundle } from '../server/assistant-core.ts';
const hash=data=>createHash('sha256').update(data).digest('hex');
const recordsPath=new URL('../.private-assistant/response-records.json',import.meta.url);
const indexPath=new URL('../.private-assistant/search.sqlite',import.meta.url);
const raw=await readFile(recordsPath),index=await readFile(indexPath);
const records=JSON.parse(raw.toString('utf8')).records;
const db=new DatabaseSync(fileURLToPath(indexPath),{readOnly:true});
let chunks;
try {const ids=[...new Set(records.flatMap(r=>r.evidence.map(e=>e.chunk_id)))];
  chunks=ids.map(id=>{const rows=db.prepare('SELECT chunk_id,text,book,pdf_page,method FROM chunks WHERE chunk_id=?').all(id);if(rows.length!==1)throw Error('Evidência ausente/duplicada.');return rows[0];});
} finally {db.close();}
const bundle=validateBundle({version:1,source:{recordsSha256:hash(raw),indexSha256:hash(index)},records,chunks});
const target=new URL('../.private-assistant-node/f4.json',import.meta.url);
await mkdir(new URL('../.private-assistant-node/',import.meta.url),{recursive:true,mode:0o700});
const output=JSON.stringify(bundle);
try{await writeFile(target,output,{flag:'wx',mode:0o600});}
catch(e){if(e.code!=='EEXIST'||await readFile(target,'utf8')!==output)throw Error('Snapshot já existe e difere. Preserve-o antes de preparar nova versão.');}
if(hash(await readFile(recordsPath))!==bundle.source.recordsSha256||hash(await readFile(indexPath))!==bundle.source.indexSha256)throw Error('Originais mudaram durante exportação.');
console.log(`F4 Node: ${records.length} respostas, ${chunks.length} evidências verificadas. Originais intactos; snapshot privado local.`);
