"""Worker local via stdin/stdout. Sem rede, IA, exportação ou busca bruta pública.

O adaptador atual só responde a intenções enumeradas em registros privados
e verifica os trechos no índice. Não gera resposta a partir de palavras isoladas.
"""
import os
import hashlib
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

BASE = Path(os.environ['ASSISTANT_DATA_DIR']) if os.environ.get('ASSISTANT_DATA_DIR') else Path(__file__).resolve().parents[1]/'.private-assistant'
def normalize(text):
    text = ''.join(c for c in unicodedata.normalize('NFD',text.lower()) if unicodedata.category(c)!='Mn')
    return ' '.join(re.findall(r'[a-z0-9]+',text))

def respond(payload):
    if not isinstance(payload,dict) or set(payload) != {'question'}: raise ValueError('invalid_request')
    question=payload['question']
    if not isinstance(question,str) or not 1 <= len(question.strip()) <= 400: raise ValueError('invalid_question')
    key=normalize(question)
    # Exact normalized intents form a finite answer set; no page/continuation API.
    records=json.loads((BASE/'response-records.json').read_text(encoding='utf8'))['records']
    matches=[r for r in records if key in {normalize(a) for a in r['aliases']}]
    if len(matches)!=1: return {'mode':'curated-local-no-ai','answer':None}
    r=matches[0]
    if len(r['text'].split())>r['max_words']: raise ValueError('answer_limit')
    db=sqlite3.connect(f'file:{(BASE/"search.sqlite").as_posix()}?mode=ro',uri=True)
    try:
        for evidence in r['evidence']:
            rows=db.execute('SELECT text,book,pdf_page,method FROM chunks WHERE chunk_id=?',(evidence['chunk_id'],)).fetchall()
            if len(rows)!=1: raise ValueError('source_missing')
            text,book,page,method=rows[0]
            if book!=r['book_id'] or page!=r['pdf_page'] or method not in ('native','ocr_reviewed') or hashlib.sha256(text.encode()).hexdigest()!=evidence['sha256']:
                raise ValueError('source_changed')
    finally: db.close()
    citation=f"{r['title']} — {r['edition']}; {r['section']}; página {r['pdf_page']} do PDF"
    if r['printed_page']: citation+=f" (página impressa {r['printed_page']})"
    return {'mode':'curated-local-no-ai','answer':{'text':r['text'],'sourceLabel':citation,'handoff':False,'product':r['title']}}

if __name__=='__main__':
    sys.stdin.reconfigure(encoding='utf8'); sys.stdout.reconfigure(encoding='utf8')
    try:
        raw=sys.stdin.read(4097)
        if len(raw)>4096: raise ValueError('too_large')
        result=respond(json.loads(raw))
        print(json.dumps(result,ensure_ascii=False))
    except Exception:
        # Nunca retornar caminhos, texto de fontes ou exceções ao navegador.
        print(json.dumps({'mode':'curated-local-no-ai','error':'Base privada indisponível; continue com o atendimento humano.'}))
        sys.exit(1)
