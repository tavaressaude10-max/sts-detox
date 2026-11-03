import { answerQuestion, answerIdentityQuestion, formatPublicBrand, type Answer } from './assistant';
import { answerCommerceQuestion } from './assistant-commerce';
import { consultLocalBase } from './assistant-local';
import { answerCommercialGuidance } from './assistant-guidance';

export async function resolveAssistantAnswer(question: string, previousProduct: string | undefined, signal: AbortSignal, clarifyingPrice = false): Promise<Answer> {
  const guidance = answerCommercialGuidance(question, previousProduct, clarifyingPrice);
  if (guidance) return guidance;
  const commerce = answerCommerceQuestion(question);
  if (commerce) return commerce;
  const identity = answerIdentityQuestion(question);
  if (identity) return identity;
  // Caminho anterior preservado integralmente para todas as outras perguntas.
  const answer = await consultLocalBase(question, answerQuestion(question, previousProduct), signal);
  return {
    ...answer,
    text: formatPublicBrand(answer.text),
    ...(answer.sourceLabel && { sourceLabel: formatPublicBrand(answer.sourceLabel) }),
    ...(answer.product && { product: formatPublicBrand(answer.product) }),
  };
}
