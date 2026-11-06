import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeQuestion } from '../.server-build/server/assistant-core.js';
import { researchIntent } from './intencao-pesquisa.mjs';
import { resolveBookContext } from '../.server-build/src/lib/assistant-context.js';

const directory = new URL('../.private-assistant/', import.meta.url);
const bookNames = ['detox bioequilibrio', 'detox ionico', 'detox pet', 'enciclopedia'];
const stop = new Set(('a o as os e de da do das dos em um uma para por com no na nos nas que qual quais como sobre sao se ao ' +
  'livro obra segundo descreve explica diz fala texto estudo menciona afirma cita significa trata aborda apresenta').split(' '));

// Somente pedidos de listagem. Perguntas temáticas sobre livros seguem para a busca.
const catalogIntent = /^(?:(?:quais|que) (?:sao )?(?:os )?(?:quatro |4 )?(?:livros|obras)|(?:liste|listar|mostre) (?:os |as )?(?:quatro |4 )?(?:livros|obras))(?: (?:disponiveis|disponivel|para estudo|para estudar|do catalogo|do acervo|estao disponiveis|posso estudar))*$/;

export function openPrivateSearch() {
  const catalog = JSON.parse(readFileSync(new URL('catalog.json', directory), 'utf8'));
  const books = bookNames.map((alias, i) => {
    const book = catalog.find(item => item.book_id === 'livro-' + (i + 1));
    if (!book?.title || !Number.isInteger(book.edition_pdf_page)) throw Error('Catálogo privado incompleto.');
    return { ...book, alias };
  });
  const db = new DatabaseSync(fileURLToPath(new URL('search.sqlite', directory)), {readOnly:true});
  const passages = db.prepare(`SELECT book, pdf_page, text FROM chunks
    WHERE chunks MATCH ? AND method IN ('native','ocr_reviewed') AND (? IS NULL OR book = ?)
    ORDER BY bm25(chunks), chunk_id LIMIT ?`);

  return function search(question) {
    const context = resolveBookContext(question);
    if (context.clarification) return {text:context.clarification, product:'', sourceLabel:'', handoff:false};
    let query = normalizeQuestion(context.query)
      .replace(/\b(?:segundo|conforme|de acordo com) (?:os |as )?(?:livros|obras) de (?:severino )?tavares(?: da silva)?\b/g, ' ').trim();
    if (catalogIntent.test(query)) return {
      text: books.map((b,i) => (i+1) + '. ' + b.title + ' — ' + b.edition + ' (página ' + b.edition_pdf_page + ' do livro)').join('\n'),
      product: 'Catálogo', sourceLabel: 'Catálogo privado das quatro obras', handoff: false
    };
    let book;
    for (const candidate of books) {
      const shortTitle = candidate.title.split(':')[0];
      const name = '(?:' + normalizeQuestion(candidate.title) + '|' + normalizeQuestion(shortTitle) + '|' + candidate.alias + ')';
      const source = new RegExp('\\b(?:(?:livro|obra|segundo|conforme) (?:o |a )?' +
        name + '\\b|(?:o |a )?' + name + '(?= (?:descreve|explica|diz|menciona|aborda|apresenta)\\b))', 'g');
      if (!source.test(query)) continue;
      if (book) return null;
      book = candidate;
      query = query.replace(source, ' ').trim();
    }
    // Consulta extrativa para estudo. Não inferir recomendações, negações ou comparações.
    if (/\b(?:nao|exceto|contraindicacoes|devo|posso|dose|dosagem|trate|curar|compare|comparar)\b/.test(query)) return null;
    const educational = researchIntent(query, book, books, passages);
    if (educational !== undefined) return educational;
    const functionTopic = query.trim().match(/^(?:qual (?:e )?a funcao|quais (?:sao )?as funcoes) (?:de|do|da|dos|das) (.+)$/)?.[1];
    const terms = [...new Set((functionTopic ?? query).split(' ').filter(t => t && !stop.has(t)))];
    if (!terms.length || (!functionTopic && terms.length === 1 && terms[0].length < 6) || terms.length > 12) return null;
    const match = terms.map(t => '"' + t + '"').join(' AND ');
    const definition = /^o que e (?:o |a |um |uma )?(?:(?:metodo|tecnica) (?:de )?)?detox ionico$/.test(query.trim());
    const definesTopic = /^(?:o |a )?(?:(?:metodo|tecnica) (?:de )?)?detox ionico (?:e (?:descrit[oa] como |uma? )|consiste em |refere se a )/;
    // Exigir que o assunto seja o sujeito de uma ação, e preferir descrições de mais de uma função.
    const action = '(?:regula[m]?|produz(?:em)?|filtra[m]?|bombeia[m]?|transporta[m]?|absorve[m]?|participa[m]?|elimina[m]?|secreta[m]?|controla[m]?)';
    const describesFunction = functionTopic && new RegExp('^(?:(?:os?|as?) )?' + functionTopic + ' ' + action + '\\b');
    const secondAction = new RegExp('\\be ' + action + '\\b');
    let best = null, bestScore = -Infinity;
    for (const row of passages.iterate(match, book?.book_id ?? null, book?.book_id ?? null, definition || functionTopic ? -1 : 24)) {
      const source = books.find(b => b.book_id === row.book);
      if (!source) continue;
      // Citar uma frase completa, sem recortar condicionais, usar cabeçalhos ou completar fragmentos.
      const sentences = row.text.match(/[^.!?]+[.!?](?=\s|$)/gu) ?? [];
      for (const raw of sentences) {
        const sentence = raw.trim();
        if (!/^\p{Lu}/u.test(sentence) || sentence.length < (functionTopic ? 12 : 48) || sentence.length > 520 ||
            /\p{Lu}{3,}\s+\p{Lu}{3,}|[|•]/u.test(sentence) || sentence.endsWith('?')) continue;
        const normalized = normalizeQuestion(sentence);
        if (definition && !definesTopic.test(normalized)) continue;
        const words = new Set(normalized.split(' '));
        if (!terms.every(term => words.has(term))) continue;
        if (describesFunction && !describesFunction.test(normalized)) continue;
        const answer = {
          text: sentence, product: source.title, handoff:false,
          sourceLabel: source.title + ' — ' + source.edition + ' — página ' + row.pdf_page + ' do livro'
        };
        if (!functionTopic) return answer;
        const score = (secondAction.test(normalized) ? 1000 : 0) - sentence.length;
        if (score > bestScore) { bestScore = score; best = answer; }
      }
    }
    return best;
  };
}
