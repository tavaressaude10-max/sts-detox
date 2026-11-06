"""Busca privada local, sem IA, servidor HTTP ou chamadas de rede.

python scripts/assistant-corpus.py build
python scripts/assistant-corpus.py search "pergunta" --book livro-3
OCR não revisado só entra com --include-ocr (avaliação, nunca resposta pública).
"""
import argparse
import hashlib
import json
import re
import sqlite3
import unicodedata
from pathlib import Path
from pypdf import PdfReader

BASE = Path(__file__).resolve().parents[1] / '.private-assistant'
CATALOG = [
    ('livro-1', 'DETOX BioEquilíbrio', 'Edição digital — 2026', 5),
    ('livro-2', 'DETOX Iônico — Entre a Medicina Convencional e as Terapias Integrativas', '2026; número de edição não localizado', 3),
    ('livro-3', 'DETOX PET — Bioeletricidade humana e animal', 'Edição digital organizada — 2026', 2),
    ('livro-4', 'Enciclopédia — Corpo Humano: O Mais Extraordinário Laboratório e Farmácia do Mundo', '1ª edição — 2026', 4),
]

def normalize(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

def build():
    inventory = json.loads((BASE / 'inventory.json').read_text(encoding='utf8'))
    audit = {b['book_id']: b['image_review_pages'] for b in json.loads((BASE / 'image-audit.json').read_text(encoding='utf8'))}
    review_path = BASE / 'ocr-review.json'
    reviews = {(r['book_id'],r['pdf_page']): r for r in json.loads(review_path.read_text(encoding='utf8'))['pages']} if review_path.exists() else {}
    for (bid, page), review in reviews.items():
        image = BASE/'review'/f'{bid}-p{page:04d}.png'
        assert hashlib.sha256(image.read_bytes()).hexdigest() == review['image_sha256'], 'Imagem mudou após revisão'
        assert hashlib.sha256(Path(str(image)+'.ocr.json').read_bytes()).hexdigest() == review['original_ocr_sha256'], 'OCR mudou após revisão'
    db = sqlite3.connect(BASE / 'search.sqlite')
    db.executescript('DROP TABLE IF EXISTS chunks; CREATE VIRTUAL TABLE chunks USING fts5(text, book UNINDEXED, title UNINDEXED, pdf_page UNINDEXED, printed_page UNINDEXED, chapter UNINDEXED, section UNINDEXED, method UNINDEXED, chunk_id UNINDEXED, tokenize="unicode61 remove_diacritics 2");')
    stats = []
    for inv, (book, title, edition, edition_page) in zip(inventory, CATALOG):
        assert inv['book_id'] == book
        assert hashlib.sha256(Path(inv['file']).read_bytes()).hexdigest() == inv['sha256'], 'Original mudou'
        chapter = None
        reader = PdfReader(inv['file']); sections = {}
        def bookmarks(items):
            for item in items:
                if isinstance(item, list): bookmarks(item)
                else:
                    destination = reader.get_destination_page_number(item)
                    if destination is not None: sections[destination+1] = str(item['/Title'])
        bookmarks(reader.outline)
        section = None
        rows = [json.loads(line) for line in (BASE / 'pages' / f'{book}.jsonl').read_text(encoding='utf8').splitlines()]
        output = []; count = 0; ocr_pages = []; unresolved = []; reviewed_pages = []; excluded_pages = []
        for row in rows:
            page = row['pdf_page']; native = row['text']; text = native; method = 'native'
            if page in sections: section = sections[page]
            ocr = BASE / 'review' / f'{book}-p{page:04d}.png.ocr.json'
            supplemental_ocr = None
            if page in audit[book] and ocr.exists() and not row['issues']:
                supplemental_ocr = json.loads(ocr.read_text(encoding='utf-8-sig'))['text']
            if row['issues'] and ocr.exists():
                recognized = json.loads(ocr.read_text(encoding='utf-8-sig'))['text']
                if len(recognized.strip()) > len(native.strip()):
                    text = recognized; method = 'ocr_unreviewed'; ocr_pages.append(page)
            review = reviews.get((book,page))
            if review:
                if page in ocr_pages: ocr_pages.remove(page)
                supplemental_ocr = None
                if review['status'] == 'corrected_for_retrieval':
                    text = review['corrected_text']; method = 'ocr_reviewed'; reviewed_pages.append(page)
                else:
                    excluded_pages.append(page)
                    # Preserve the native layer on mixed pages, never fall back to rejected OCR.
                    text = native; method = 'native' if not row['issues'] else 'ocr_excluded'
            if len(re.sub(r'\s', '', text)) < 80: unresolved.append(page)
            # Numeração somente quando presente no texto; nunca supor offset fixo.
            printed = None
            if book in ('livro-1', 'livro-2'):
                m = re.match(r'^\s*(\d{1,3})\s*\n', native)
                if m: printed = m[1]
            elif book == 'livro-3':
                m = re.search(r'2026\s*\|\s*(\d+)', native)
                if m: printed = m[1]
            # Identificar capítulos no corpo, excluindo os sumários conhecidos.
            body_start = {'livro-1': 17, 'livro-2': 22, 'livro-3': 4, 'livro-4': 14}[book]
            if page >= body_start:
                heading = re.search(r'(?im)^\s*CAP[ÍI]TULO\s+(\d+)\s*\n([^\n]+)', text[:650])
                if heading: chapter = 'Capítulo ' + heading[1]
            row.update(title=title, edition=edition, printed_page=printed,
                       printed_page_status='extraída; conferir visualmente' if printed else 'não identificada',
                       chapter=chapter, section=section, method=method, text=text, native_text=native,
                       image_text_ocr_unreviewed=supplemental_ocr,
                       ready_for_public_answer=False)
            row['ocr_review_status'] = review['status'] if review else None
            output.append(row)
            if supplemental_ocr:
                ocr_pages.append(page)
                extra_words = supplemental_ocr.split()
                for start in range(0, len(extra_words), 150):
                    excerpt = ' '.join(extra_words[start:start+180])
                    if len(excerpt) < 80: continue
                    db.execute('INSERT INTO chunks VALUES (?,?,?,?,?,?,?,?,?)', (excerpt,book,title,page,printed,chapter,section,'ocr_unreviewed',f'{book}:pdf-{page}:ocr-{start}')); count += 1
                    if start+180 >= len(extra_words): break
            words = text.split()
            if len(words) < 15 or method == 'ocr_excluded': continue
            for start in range(0, len(words), 150):
                excerpt = ' '.join(words[start:start+180])
                if len(excerpt) < 80: continue
                cid = f'{book}:pdf-{page}:w-{start}'
                db.execute('INSERT INTO chunks VALUES (?,?,?,?,?,?,?,?,?)', (excerpt, book, title, page, printed, chapter, section, method, cid)); count += 1
                if start+180 >= len(words): break
        (BASE / 'pages' / f'{book}-enriched.jsonl').write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in output)+'\n', encoding='utf8')
        stats.append(dict(book_id=book,title=title,edition=edition,edition_pdf_page=edition_page,pages=len(rows),chunks=count,ocr_unreviewed=ocr_pages,ocr_reviewed=reviewed_pages,ocr_excluded=excluded_pages,still_low_text=unresolved,original_sha256_verified=True,flagged_pages=[p['pdf_page'] for p in inv['problems']], image_review_pages=audit[book]))
    db.commit(); db.close()
    (BASE / 'catalog.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps(stats, ensure_ascii=True, indent=2))

def search(query, book=None, include_ocr=False, limit=3):
    stop = set('a o as os e de da do das dos em um uma para por com no na nos nas que qual quais como sobre sao se ao eu meu minha pode posso livro'.split())
    terms = list(dict.fromkeys(t for t in re.findall(r'[a-z0-9]+', normalize(query)) if t not in stop and len(t)>2))[:16]
    if not terms: return []
    expression = ' OR '.join('"'+t+'"' for t in terms)
    db = sqlite3.connect(f'file:{(BASE / "search.sqlite").as_posix()}?mode=ro', uri=True)
    db.row_factory = sqlite3.Row
    sql = 'SELECT *, bm25(chunks) AS rank FROM chunks WHERE chunks MATCH ?'
    args = [expression]
    if book: sql += ' AND book=?'; args.append(book)
    if not include_ocr: sql += " AND method IN ('native','ocr_reviewed')"
    sql += ' ORDER BY rank LIMIT 30'
    candidates = [dict(r) for r in db.execute(sql,args)]; db.close()
    for r in candidates:
        tokens = set(re.findall(r'[a-z0-9]+', normalize(r['text'])))
        r['matched_terms'] = [t for t in terms if t in tokens]
        r['warning'] = 'Resultado lexical para revisão; não é resposta de IA nem comprovação científica.'
    candidates.sort(key=lambda r: (-len(r['matched_terms']),r['rank']))
    result = []; seen = set()
    for r in candidates:
        key = (r['book'],r['pdf_page'])
        if key in seen: continue
        seen.add(key); result.append(r)
        if len(result) == limit: break
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['build','search'])
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--book', choices=[b[0] for b in CATALOG])
    parser.add_argument('--include-ocr', action='store_true')
    args = parser.parse_args()
    if args.command == 'build': build()
    else: print(json.dumps(search(args.query,args.book,args.include_ocr),ensure_ascii=True,indent=2))
