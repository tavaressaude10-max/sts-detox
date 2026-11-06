"""Inspeção local, sem rede. Originais são abertos somente para leitura."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
args = parser.parse_args()
out = Path(__file__).resolve().parents[1] / '.private-assistant'
(out / 'pages').mkdir(parents=True, exist_ok=True)
inventory = []
for number, file in enumerate(sorted(args.source.glob('*.pdf')), 1):
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    book_id = f'livro-{number}'
    reader = PdfReader(file)
    labels = reader.page_labels
    problems, samples, rows = [], [], []
    for idx, page in enumerate(reader.pages):
        error = None
        try:
            text = page.extract_text() or ''
        except Exception as exc:
            text, error = '', str(exc)
        text = text.replace('\x00', '')
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        # Apenas candidato: validar no relatório, sem inferir deslocamento global.
        footer = next((line for line in reversed(lines[-3:]) if re.fullmatch(r'\d{1,4}', line)), None)
        issues = []
        if error: issues.append('extraction_error')
        if len(re.sub(r'\s', '', text)) < 80: issues.append('low_text_review')
        if text.count('\ufffd') or '(cid:' in text: issues.append('encoding_review')
        if issues: problems.append({'pdf_page': idx + 1, 'issues': issues, 'characters': len(text), 'error': error})
        row = {'book_id': book_id, 'pdf_page': idx + 1, 'pdf_label': labels[idx], 'printed_page_candidate': footer, 'text': text, 'issues': issues}
        rows.append(row)
        if idx < 5: samples.append({'pdf_page': idx + 1, 'text': text[:5000]})
    with (out / 'pages' / f'{book_id}.jsonl').open('w', encoding='utf-8') as handle:
        for row in rows: handle.write(json.dumps(row, ensure_ascii=False) + '\n')
    item = {'book_id': book_id, 'file': str(file.resolve()), 'sha256': digest, 'pages': len(rows), 'metadata': {str(k): str(v) for k, v in (reader.metadata or {}).items()}, 'problems': problems}
    inventory.append(item)
    (out / f'{book_id}-samples.json').write_text(json.dumps(samples, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'book_id': book_id, 'name': file.name, 'pages': len(rows), 'issues': problems}, ensure_ascii=False), flush=True)
(out / 'inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')
