import { createHash } from 'node:crypto';
import type { DataStore } from './storage/types.ts';

export interface Evidence { chunk_id:string; sha256:string; method:string }
export interface CuratedRecord { id:string; aliases:string[]; text:string; book_id:string; pdf_page:number; printed_page:string|number|null; section:string; title:string; edition:string; evidence:Evidence[]; status:string; max_words:number }
export interface SourceChunk { chunk_id:string; text:string; book:string; pdf_page:number; method:string }
export interface AssistantBundle { version:1; source:{recordsSha256:string;indexSha256:string}; records:CuratedRecord[]; chunks:SourceChunk[] }
export interface AssistantRepository { load():Promise<AssistantBundle> }
export const normalizeQuestion=(text:string)=>(text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu,'').match(/[a-z0-9]+/g)||[]).join(' ');
export const sha256=(text:string)=>createHash('sha256').update(text,'utf8').digest('hex');
export function validateBundle(value:unknown):AssistantBundle {
  const b=value as AssistantBundle;
  if(!b || b.version!==1 || !Array.isArray(b.records) || !b.records.length || b.records.length>1000 || !Array.isArray(b.chunks) || b.chunks.length>10000 || !/^[a-f0-9]{64}$/.test(b.source?.recordsSha256)||!/^[a-f0-9]{64}$/.test(b.source?.indexSha256))throw Error('Base inválida.');
  const ids=new Set<string>();
  for(const c of b.chunks){if(!c||typeof c.chunk_id!=='string'||ids.has(c.chunk_id)||typeof c.text!=='string'||typeof c.book!=='string'||!Number.isInteger(c.pdf_page)||typeof c.method!=='string')throw Error('Fonte inválida.');ids.add(c.chunk_id);}
  for(const r of b.records){
    if(!r||!Array.isArray(r.aliases)||!r.aliases.length||r.aliases.some(a=>typeof a!=='string'||!a.trim()||a.length>400)||typeof r.text!=='string'||!r.text.trim()||r.text.length>1800||!Number.isInteger(r.max_words)||r.max_words<1||r.text.trim().split(/\s+/u).length>r.max_words||!Array.isArray(r.evidence)||!r.evidence.length||!Number.isInteger(r.pdf_page)||[r.title,r.edition,r.section,r.book_id].some(v=>typeof v!=='string'))throw Error('Resposta inválida.');
    for(const e of r.evidence){const matches=b.chunks.filter(c=>c.chunk_id===e.chunk_id);const c=matches[0];
      if(matches.length!==1||!c||c.book!==r.book_id||c.pdf_page!==r.pdf_page||!['native','ocr_reviewed'].includes(c.method)||sha256(c.text)!==e.sha256)throw Error('Fonte alterada ou não revisada.');}
  }
  return b;
}
export function respondFromBundle(bundle:AssistantBundle,payload:unknown){
  const body=payload as {question:string};
  if(!body||Object.keys(body).join()!=='question'||typeof body.question!=='string'||!body.question.trim()||body.question.length>400)throw Error('Pergunta inválida.');
  const b=validateBundle(bundle),key=normalizeQuestion(body.question);
  const matches=b.records.filter(r=>r.aliases.some(a=>normalizeQuestion(a)===key));
  if(matches.length!==1)return {mode:'curated-local-no-ai',answer:null};
  const r=matches[0]!;
  let citation=`${r.title} — ${r.edition}; ${r.section}; página ${r.pdf_page} do PDF`;
  if(r.printed_page)citation+=` (página impressa ${r.printed_page})`;
  return {mode:'curated-local-no-ai',answer:{text:r.text,sourceLabel:citation,handoff:false,product:r.title}};
}
export class StoredAssistantRepository implements AssistantRepository {
  private store:DataStore;
  constructor(store:DataStore){this.store=store;}
  async load(){return validateBundle(await this.store.get('assistant:bundle:v1'));}
}
