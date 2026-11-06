"""Regressão de recuperação em livros reais; executada somente com acervo privado."""
import importlib.util
import json

spec = importlib.util.spec_from_file_location('corpus', __file__.replace('test-assistant-corpus.py', 'assistant-corpus.py'))
corpus = importlib.util.module_from_spec(spec)
spec.loader.exec_module(corpus)
cases = [
    ('livro-1', 'A cor da água indica toxinas?', 114),
    ('livro-2', 'Qual o caráter informativo educacional do livro?', 4),
    ('livro-3', 'O livro constitui protocolo veterinário?', 2),
    ('livro-4', 'Qual é a função das mitocôndrias na produção de ATP?', 77),
]
report = []
for book, question, expected_page in cases:
    results = corpus.search(question, book)
    assert any(r['pdf_page'] == expected_page for r in results), (book, expected_page)
    pages = {r['pdf_page']: r for r in [json.loads(l) for l in (corpus.BASE/'pages'/f'{book}-enriched.jsonl').read_text(encoding='utf8').splitlines()]}
    for result in results:
        assert result['book'] == book and result['method'] == 'native'
        assert result['text'] in ' '.join(pages[result['pdf_page']]['native_text'].split())
    report.append(dict(question=question, expected_pdf_page=expected_page, results=results))
assert not corpus.search('xyzzyqwerty987654321')
(corpus.BASE/'search-examples.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('OK: quatro perguntas recuperam a página esperada entre os três resultados; fontes correspondem ao texto original; OCR sem revisão excluído por padrão; consulta sem correspondência vazia.')
