"""Detecta páginas mistas: texto extraível não garante leitura dos infográficos."""
import json
from pathlib import Path
import pypdfium2 as pdfium

base = Path(__file__).resolve().parents[1] / '.private-assistant'
result = []
for book in json.loads((base/'inventory.json').read_text(encoding='utf8')):
    doc = pdfium.PdfDocument(book['file'])
    rows = [json.loads(line) for line in (base/'pages'/f"{book['book_id']}.jsonl").read_text(encoding='utf8').splitlines()]
    flagged = []
    for i, page in enumerate(doc):
        area = page.get_width()*page.get_height()
        image_area = 0
        for obj in page.get_objects(filter=[pdfium.raw.FPDF_PAGEOBJ_IMAGE]):
            left, bottom, right, top = obj.get_bounds()
            image_area += abs((right-left)*(top-bottom))
        if image_area/area > .3 and len(rows[i]['text'].strip()) < 1500:
            flagged.append(i+1)
        page.close()
    doc.close()
    result.append(dict(book_id=book['book_id'], image_review_pages=flagged))
(base/'image-audit.json').write_text(json.dumps(result,indent=2),encoding='utf8')
