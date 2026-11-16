import { answerQuestion, answerIdentityQuestion, formatPublicBrand, normalize, type Answer } from './assistant';
import { answerCommerceQuestion } from './assistant-commerce';
import { consultLocalBase } from './assistant-local';
import { answerCommercialGuidance } from './assistant-guidance';
import { resolveBookContext, type Subject } from './assistant-context';

// Paráfrase conferida nas páginas impressas 141, 176 e 191 do DETOX IÔNICO.
// Lista finita: não substitui as perguntas/aliases das oito respostas do F4.
const waterAppearanceQuestions = [
  'O que significam as cores, os resíduos e as espumas na água durante o DETOX IÔNICO?',
  'O que significam as cores, resíduos e espumas na água durante o DETOX IÔNICO?',
  'A espuma significa toxinas?',
  'A espuma na água significa eliminação de toxinas?',
  'O que a medicina chinesa diz sobre as cores da água?',
  'O que a MTC diz sobre as cores da água?',
  'O que significam as cores e a espuma na água durante o DETOX IÔNICO?',
  'O que significam os resíduos na água durante o DETOX IÔNICO?',
].map(normalize);

function isWaterAppearanceQuestion(question: string) {
  const key = normalize(question);
  if (waterAppearanceQuestions.includes(key)) return true;
  // Aceita singular/plural e conectivos sem transformar qualquer pergunta
  // que mencione água em uma resposta genérica (diagnóstico, compra etc.).
  const wording = key
    .replace(/\bcores\b/g, 'cor')
    .replace(/\bespumas\b/g, 'espuma')
    .replace(/\bresiduos\b/g, 'residuo')
    .replace(/\b(?:o|a|os|as|e|na|nas|no|nos|da|das|do|dos|de|durante)\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  // A pergunta geral sobre a cor, sozinha, continua pertencendo ao F4.
  return /^que (?:significa|significam|representa|representam) (?:(?:(?:cor|residuo|espuma) ){2,3}|(?:residuo|espuma) )agua(?: detox ionico)?$/.test(wording)
    || /^espuma(?: agua)? (?:significa|significam|representa|representam|indica|indicam) (?:eliminacao )?toxinas$/.test(wording)
    || /^que (?:medicina (?:tradicional )?chinesa|mtc) diz sobre (?:cor|espuma|residuo) agua$/.test(wording);
}

const waterAppearanceAnswer: Answer = {
  text: 'Na interpretação da Medicina Tradicional Chinesa (MTC) apresentada no livro, as cores, os resíduos e as espumas podem ser interpretados segundo conceitos energéticos tradicionais.\n\nJá a explicação científica relaciona essas alterações principalmente à eletrólise e à oxidação dos eletrodos, sem comprovação científica suficiente de que representem a eliminação de toxinas do organismo.',
  sourceLabel: 'Livro DETOX IÔNICO, página 191 do livro (interpretação tradicional); Livro DETOX IÔNICO, página 141 do livro (cores, espuma e limites científicos); Livro DETOX IÔNICO, página 176 do livro (resíduos, eletrólise e oxidação).',
  product: 'DETOX IÔNICO',
  handoff: false,
};

// Resposta conjunta; perguntas individuais e pedidos clínicos seguem o fluxo existente.
function isCombinedBenefitsQuestion(question: string) {
  const key = normalize(question).replace(/\bbio equilibrio\b/g, 'bioequilibrio')
    .replace(/\b(?:o|a|os|as|e|do|da|dos|das|de)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const pair = '(?:detox ionico detox bioequilibrio|detox bioequilibrio detox ionico)';
  return new RegExp(`^(?:${pair} (?:oferecem|tem|trazem|proporcionam) beneficios|quais (?:sao )?(?:beneficios|vantagens) ${pair})$`).test(key);
}

const combinedBenefitsAnswer: Answer = {
  text: 'Segundo o livro DETOX IÔNICO, usuários relatam experiências positivas, como relaxamento, sensação de bem-estar e melhora do sono.\n\nO DETOX BIOEQUILÍBRIO é descrito no livro como um sistema com água e eletrodos que utiliza estimulação elétrica de baixa intensidade, apresentada na técnica como uma possível contribuição ao bem-estar e ao equilíbrio corporal.\n\nEsses relatos representam experiências individuais e não comprovam, por si só, benefícios clínicos ou eliminação de toxinas.',
  sourceLabel: 'Livro DETOX IÔNICO, página 27 do livro (relatos e sono); Livro DETOX IÔNICO, página 37 do livro (bem-estar e limites dos relatos); Livro DETOX BIOEQUILÍBRIO, página 58 do livro (sistema, bem-estar e limites sobre toxinas); Livro DETOX BIOEQUILÍBRIO, página 67 do livro (baixa intensidade elétrica).',
  handoff: false,
};

export async function resolveAssistantAnswer(question: string, previousProduct: string | undefined, signal: AbortSignal, clarifyingPrice = false, previousSubjects: readonly Subject[] = []): Promise<Answer & { subjects?: Subject[] }> {
  const guidance = answerCommercialGuidance(question, previousProduct, clarifyingPrice);
  if (guidance) return guidance;
  const commerce = answerCommerceQuestion(question);
  if (commerce) return commerce;
  const identity = answerIdentityQuestion(question);
  if (identity) return identity;
  if (isCombinedBenefitsQuestion(question)) return { ...combinedBenefitsAnswer, subjects: ['technique', 'equipment'] };
  if (isWaterAppearanceQuestion(question)) return { ...waterAppearanceAnswer, subjects: ['technique'] };
  const fallback = answerQuestion(question, previousProduct);
  if (fallback.reason === 'commercial' || fallback.reason === 'human') return fallback;
  const context = resolveBookContext(question, previousSubjects);
  if (context.clarification) return { text: context.clarification, handoff:false, subjects:context.subjects };
  const answer = await consultLocalBase(context.query, fallback, signal);
  return {
    ...answer,
    subjects: context.subjects,
    text: formatPublicBrand(answer.text),
    ...(answer.sourceLabel && { sourceLabel: formatPublicBrand(answer.sourceLabel) }),
    ...(answer.product && { product: formatPublicBrand(answer.product) }),
  };
}
