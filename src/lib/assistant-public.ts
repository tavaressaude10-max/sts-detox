import { publicAnswers } from './assistant-public-data.ts';
export { publicAnswers };
export type PublicAnswer = (typeof publicAnswers)[number];
export const normalizeQuestion = (text: string) =>
  (text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').match(/[a-z0-9]+/g) || []).join(' ');
// Vocabulário finito: termos extras, negações e múltiplos assuntos não são
// descartados. Sem similaridade probabilística ou respostas geradas.
const keyFor = (text: string) => normalizeQuestion(text)
  .replace(/^(ola |oi |bom dia |boa tarde |boa noite )/, '')
  .replace(/^(por favor |gostaria de saber |quero saber |me diga )/, '')
  .replace(/ por favor$/, '')
  .replace(/\bsessoes\b/g, 'sessao').replace(/\beletrodos\b/g, 'eletrodo')
  .replace(/\bcriancas\b/g, 'crianca').replace(/\bpodem\b/g, 'pode')
  .split(' ').filter(word => !['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'um', 'uma'].includes(word))
  .sort().join(' ');
export function findPublicAnswer(question: string): PublicAnswer | null {
  if (!question.trim() || question.length > 400) return null;
  const key = keyFor(question);
  const matches = publicAnswers.filter(answer => answer.aliases.some(alias => keyFor(alias) === key));
  return matches.length === 1 ? matches[0]! : null;
}
export const unsupportedMessage = 'Esse atendimento é realizado diretamente pelo Professor Tavares.';
export function makeHandoff(questions: readonly string[]): string {
  return 'Olá, Professor Tavares. Gostaria de atendimento.'
    + (questions.length ? '\n\nMinha dúvida: ' + questions.at(-1)!.slice(0, 400) : '');
}
