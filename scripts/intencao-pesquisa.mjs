import { normalizeQuestion } from '../.server-build/server/assistant-core.js';

// Vocabulário da consulta e critérios para escolher evidências. O texto da
// resposta e o número de página são sempre lidos do índice.
const intents = [
  ['benefits', /\b(?:beneficios?|vantagens?|efeitos? positivos?|pontos? positivos?|faz bem|(?:pode )?ajudar)\b/],
  ['purpose', /\b(?:(?:para|pra) (?:o )?(?:que|q) serv(?:e|em)|(?:finalidade|utilidade|objetivo|proposito)|serve (?:para|pra) (?:que|q))\b/],
  ['operation', /\b(?:funciona(?:m|mento)?|opera(?:cao)?|mecanismo|como (?:age|atua)|de que (?:forma|maneira) funciona)\b/],
];
const evidence = {
  purpose: ['proposta OR finalidade OR objetivo', /^(?:a proposta|a finalidade|o objetivo) (?:do metodo|do equipamento|do aparelho) /],
  operation: ['equipamento AND (operar OR funciona OR utiliza)', /^o (?:equipamento|aparelho) (?:foi desenvolvido para operar|funciona|opera|utiliza) /],
  report: ['relatos AND relaxamento', /^(?:entre os relatos|(?:alguns|muitos) participantes relatam) .*?(?:relaxamento|bem estar)/],
  limit: ['relatos AND "comprovação científica"', /^(?:esses|os|tais) relatos .*?(?:nao devem ser confundidos com|nao constituem) comprovacao cientifica/],
};

export function researchIntent(query, book, books, passages) {
  const cleaned = query.replace(/\bben[ei]f(?:ic|iss|is|c)ios?\b/g, 'beneficio')
    .replace(/\b(?:funcoina|funsiona|funcioan)\b/g, 'funciona').replace(/\bbio equilibrio\b/g, 'bioequilibrio');
  const intent = intents.find(([, pattern]) => pattern.test(cleaned));
  // As consultas anatômicas, comerciais e sobre outros assuntos continuam no fluxo anterior.
  if (!intent || !/\b(?:detox|bioequilibrio|ionico)\b/.test(cleaned + ' ' + (book?.alias ?? ''))) return undefined;
  const subjects = ['bioequilibrio','ionico','pet'].filter(term => cleaned.split(' ').includes(term));
  if (!subjects.length && book?.alias.startsWith('detox ') && !cleaned.includes('detox')) subjects.push(book.alias.split(' ')[1]);
  if (subjects.length !== 1 || !subjects[0]) return {
    text:'Você quer saber sobre o aparelho DETOX BioEquilíbrio, a técnica DETOX Iônico ou o DETOX PET? Inclua o nome na pergunta.',
    product:'', sourceLabel:'', handoff:false
  };
  const subject = subjects[0];
  // Não responder a um pedido específico (por exemplo, benefício para diabetes)
  // com uma passagem genérica sobre conforto.
  const remainder = cleaned.replace(intent[1], ' ').split(/\s+/).filter(Boolean);
  const general = /^(?:o|a|os|as|um|uma|e|sao|tem|ter|traz|trazem|oferece|oferecem|pode|podem|quais?|qual|que|q|como|de|do|da|dos|das|no|na|em|seu|sua|algum|alguma|alguns|algumas|possivel|possiveis|seria|seriam|existem|existe|para|pra|por|favor|gostaria|quero|saber|sobre|aparelho|equipamento|metodo|tecnica|detox|bioequilibrio|ionico|pet|clinicamente|comprovados?|cientificamente|funcionamento)$/;
  if (remainder.some(word => !general.test(word)) || subject === 'pet') return null;

  function find(kind) {
    const [expression, describes] = evidence[kind];
    for (const row of passages.iterate(expression, book?.book_id ?? null, book?.book_id ?? null, -1)) {
      const source = books.find(b => b.book_id === row.book);
      const context = normalizeQuestion(row.text);
      if (!source || source.alias === 'detox pet' ||
          /\b(?:tens|nmes|animais|veterinari[oa]|outra tecnica)\b/.test(context)) continue;
      for (const raw of row.text.match(/[^.!?]+[.!?](?=\s|$)/gu) ?? []) {
        const sentence = raw.trim();
        const words = normalizeQuestion(sentence);
        // Fora da obra dedicada, a própria frase precisa identificar o assunto.
        if (!source.alias.endsWith(' ' + subject) && !words.includes('detox ' + subject)) continue;
        if (sentence.length > 500 || !sentence.endsWith('.') || !describes.test(words)) continue;
        return {sentence, source, page: row.pdf_page};
      }
    }
    return null;
  }
  const benefits = intent[0] === 'benefits';
  const first = find(benefits ? 'report' : intent[0]);
  if (!first) return null;
  const limit = benefits && find('limit');
  if (benefits && !limit) return null;
  return {
    text: limit ? 'Relatos dos participantes: “' + first.sentence + '”\nLimite da evidência: “' + limit.sentence + '”' : first.sentence,
    sourceLabel: first.source.title + ' — ' + first.source.edition + ' — página ' + first.page + ' do livro' +
      (limit ? ' (relatos); ' + (limit.source === first.source ? '' : limit.source.title + ' — ' + limit.source.edition + ' — ') + 'página ' + limit.page + ' do livro (limite da evidência)' : ''),
    product:first.source.title, handoff:false
  };
}
