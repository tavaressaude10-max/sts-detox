import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageOps, ImageDraw

base = Path(__file__).resolve().parents[1] / '.private-assistant'
(base / 'review').mkdir(exist_ok=True)
audit_path = base / 'image-audit.json'
audit = {b['book_id']: b['image_review_pages'] for b in json.loads(audit_path.read_text(encoding='utf8'))} if audit_path.exists() else {}
for book in json.loads((base / 'inventory.json').read_text(encoding='utf-8')):
    pdf = pdfium.PdfDocument(book['file'])
    wanted = sorted(set([1, 2, 3, 4, 5] + [p['pdf_page'] for p in book['problems']] + audit.get(book['book_id'], [])))
    thumbs = []
    for page_no in wanted:
        page = pdf[page_no - 1]
        im = page.render(scale=1.7).to_pil().convert('RGB')
        im.save(base / 'review' / f"{book['book_id']}-p{page_no:04d}.png")
        thumb = ImageOps.contain(im, (220, 290))
        card = Image.new('RGB', (240, 320), 'white')
        card.paste(thumb, ((240-thumb.width)//2, 24))
        ImageDraw.Draw(card).text((8, 5), f"{book['book_id']} PDF {page_no}", fill='black')
        thumbs.append(card)
        page.close()
    for start in range(0, len(thumbs), 16):
        subset = thumbs[start:start+16]
        sheet = Image.new('RGB', (960, 320*((len(subset)+3)//4)), '#cccccc')
        for i, card in enumerate(subset): sheet.paste(card, ((i%4)*240, (i//4)*320))
        sheet.save(base / 'review' / f"{book['book_id']}-sheet-{start//16+1}.jpg")
    pdf.close()
    print(book['book_id'], 'rendered', len(wanted), flush=True)
