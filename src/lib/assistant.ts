import { homeFaq, booksFaq } from './assistant-faq';

export const topics = ['Equipamento', 'Materiais de estudo', 'Quatro livros', 'Atendimento'] as const;
export type Topic = typeof topics[number];
export const bookTitles = ['Enciclopédia Corpo Humano', 'DETOX IÔNICO', 'DETOX BIOEQUILÍBRIO', 'DETOX PET'] as const;
export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
export const commercialHandoffText = 'Esse atendimento é humanizado. Entre em contato com o professor Tavares, que vai orientar você pessoalmente.';
export const digitalStudyMaterialText = 'O aparelho DETOX BIOEQUILÍBRIO acompanha os acessórios e o material de estudo em formato digital, disponibilizado para a capacitação do novo cliente. O material de estudo não é vendido separadamente.';
// Somente apresentação; não aplicar a URLs, perguntas ou acervo privado.
export const formatPublicBrand = (text: string) => text
  .replace(/\bdetox\s+bioequil[ií]brio\b/gi, 'DETOX BIOEQUILÍBRIO')
  .replace(/\bdetox\s+i[oô]nico\b/gi, 'DETOX IÔNICO')
  .replace(/\bbioequilíbrio\b/gi, 'BIOEQUILÍBRIO');
// Apenas apresentações e trechos já publicados pelo proprietário. Não é o texto integral dos livros.
export const productInfo = [
  { name: bookTitles[0], aliases: ['enciclopedia corpo humano', 'enciclopedia', 'corpo humano'], text: 'A Enciclopédia Corpo Humano, de Severino Tavares da Silva, apresenta uma visão progressiva do organismo, das células aos tecidos, órgãos e sistemas. Inclui redes de comunicação e regulação, defesa, adaptação, equilíbrio e homeostase, com linguagem visual e acessível para estudo e consulta.', source: '/livros#enciclopedia', sourceLabel: 'Enciclopédia Corpo Humano — apresentação e “O que você encontrará”' },
  { name: bookTitles[1], aliases: ['detox ionico'], text: 'O livro DETOX IÔNICO — Entre a Medicina Convencional e as Terapias Integrativas, de Severino Tavares da Silva, aborda o DETOX IÔNICO e o diálogo entre a medicina convencional e as terapias integrativas. É uma publicação educativa e não substitui as orientações de uso do equipamento nem acompanhamento médico.', source: '/livros#detox-ionico', sourceLabel: 'DETOX IÔNICO — apresentação pública e dúvidas sobre os livros' },
  { name: bookTitles[2], aliases: ['detox bioequilibrio'], text: 'O livro DETOX BIOEQUILÍBRIO, de Severino Tavares da Silva, organiza fundamentos, reflexões e observações sobre o Método STS BIOEQUILÍBRIO. Entre os temas publicados estão estímulos bioelétricos leves, percepção sensorial, relaxamento, experiência corporal integrada e responsabilidade profissional. A obra não se apresenta como comprovação de diagnóstico, prevenção, tratamento ou cura de doenças.', source: '/livros#bioequilibrio', sourceLabel: 'DETOX BIOEQUILÍBRIO — temas, apresentação e prefácio publicados' },
  { name: bookTitles[3], aliases: ['detox pet'], text: 'DETOX PET é um dos quatro livros de Severino Tavares da Silva apresentados no site. A base disponível nesta demonstração contém o título, a autoria e a capa; ainda não inclui trechos aprovados do conteúdo desse livro. Posso identificar a obra aqui, mas não fundamentar orientações sobre animais a partir dela.', source: '/livros#detox-pet', sourceLabel: 'DETOX PET — identificação e capa na página de livros' },
  { name: 'Equipamento DETOX BIOEQUILÍBRIO', aliases: ['equipamento sts detox bioequilibrio', 'equipamento', 'aparelho', 'sts detox bioequilibrio'], text: 'O DETOX BIOEQUILÍBRIO é apresentado como uma proposta complementar de relaxamento, conforto e bem-estar. Durante a sessão, os pés permanecem em água preparada para condução elétrica, enquanto o equipamento produz estímulos elétricos de baixa intensidade. Não realiza diagnóstico nem deve ser anunciado como prevenção, tratamento ou cura de doenças.', source: '/#o-que-e', sourceLabel: 'Equipamento — seção “O que é” e perguntas frequentes' },
  { name: 'Material de estudo STS', aliases: ['material de estudo sts', 'material de estudo', 'materiais de estudo'], text: homeFaq[5]!.a, source: '/#formacao', sourceLabel: 'Material de estudo — conteúdo público da seção “Material de estudo”' },
];
export type Answer = { text: string; source?: string; sourceLabel?: string; handoff: boolean; product?: string | undefined; reason?: 'commercial' | 'human' | 'unsupported' | undefined; action?: { label: string; href: string; external?: boolean }; clarification?: 'price-product' };
export const identityQuestions = [
  'Qual é o nome da empresa?', 'Qual o nome da marca?', 'Qual é o nome do aparelho?',
  'STS DETOX IÔNICO', 'O que é a STS DETOX IÔNICO?', 'Fale sobre a empresa STS DETOX IÔNICO',
  'DETOX BIOEQUILÍBRIO', 'O que é o DETOX BIOEQUILÍBRIO?', 'O que é DETOX BIOEQUILÍBRIO?',
  'DETOX IÔNICO', 'O que é o DETOX IÔNICO?', 'O que é DETOX IÔNICO?',
  'Qual a diferença entre a empresa e o aparelho?',
  'STS DETOX IÔNICO é o aparelho?', 'DETOX BIOEQUILÍBRIO é a empresa?',
  'Qual a diferença entre STS DETOX IÔNICO e DETOX BIOEQUILÍBRIO?',
];
export function answerIdentityQuestion(question: string): Answer | undefined {
  const key = normalize(question);
  if (!identityQuestions.some(q => normalize(q) === key)) return undefined;
  return {
    text: 'STS DETOX IÔNICO é o nome da empresa/marca institucional. DETOX BIOEQUILÍBRIO é o nome do aparelho, um equipamento de DETOX IÔNICO com uma proposta ampliada de utilização. DETOX IÔNICO é a técnica/proposta de base relacionada ao equipamento.',
    handoff: false,
    product: key.includes('bioequilibrio') || key.includes('aparelho') ? 'Equipamento DETOX BIOEQUILÍBRIO' : undefined,
    source: '/#conceito-bioequilibrio',
    sourceLabel: 'Identidade e conceito aprovados pelo responsável',
  };
}
export function identifyProduct(question: string) {
  const key = normalize(question);
  const matches = productInfo.filter(item => item.aliases.some(alias => new RegExp(`\\b${alias}\\b`).test(key)));
  return matches.length === 1 ? matches[0]?.name : matches.length > 1 ? matches.map(item => item.name).join(' e ') : undefined;
}
export function questionsFor(topic: Topic) {
  if (topic === 'Quatro livros') return booksFaq;
  if (topic === 'Materiais de estudo') return homeFaq.filter(faq => faq.q === 'Existe material de estudo para acompanhar o equipamento?');
  if (topic === 'Atendimento') return [];
  return homeFaq;
}
export function answerQuestion(question: string, previousProduct?: string): Answer {
  // Correspondência exata: não inferir uma resposta técnica a partir de palavras isoladas.
  const key = normalize(question);
  const product = identifyProduct(question) ?? previousProduct;
  const faq = [...homeFaq, ...booksFaq].find(item => normalize(item.q) === key);
  if (faq) return { text: faq.a, source: homeFaq.includes(faq) ? '/#duvidas' : '/livros#duvidas-livros', sourceLabel: `FAQ publicada: ${faq.q}`, handoff: /adquirir/.test(key), product, reason: /adquirir/.test(key) ? 'commercial' : undefined };
  if (/\b(comprar|compra|aquisicao|precos?|valores?|orcamento|adquirir|custa|custam|pagamento|parcelas?|parcelamento|parcelar|frete|desconto|pix|cartao|condicoes comerciais)\b/.test(key)) {
    return { text: commercialHandoffText, handoff: true, product, reason: 'commercial' };
  }
  if (/\b(atendente|uma pessoa|atendimento humano|falar com um humano|whatsapp|falar com a equipe)\b/.test(key)) return { text: 'Posso preparar uma mensagem para você continuar com uma pessoa do atendimento. Revise antes de abrir o WhatsApp; nada é enviado automaticamente.', handoff: true, product, reason: 'human' };
  // Só apresentações gerais reconhecidas. Perguntas específicas não recebem uma sinopse como se fosse resposta.
  for (const info of productInfo) {
    if (info.aliases.some(alias => new RegExp(`^(?:(?:quero saber sobre|gostaria de saber sobre|me fale sobre|fale sobre|sobre|o que e|o que aborda|qual o conteudo d[oe]|conhecer|gostaria de informacoes sobre) )?(?:(?:o|a|os|as) )?(?:livro )?${alias}$`).test(key))) {
      return { ...info, sourceLabel: info.sourceLabel, handoff: false, product: info.name };
    }
  }
  if (/^(quais sao os livros|quais livros|livros|quatro livros)$/.test(key)) return { text: booksFaq[0]!.a, source: '/livros#duvidas-livros', sourceLabel: 'FAQ: Os quatro livros já estão publicados?', handoff: false };
  return { text: 'Não encontrei uma resposta fundamentada na base aprovada disponível para essa pergunta. Também encaminho dúvidas ou conflitos nas fontes para uma pessoa do atendimento, sem escolher uma resposta por suposição. Posso preparar sua mensagem. Não diagnostico, prescrevo, prometo cura nem interpreto a cor da água como diagnóstico. Para dúvidas individuais de saúde, procure um profissional habilitado. Não disponibilizo livros completos ou materiais restritos.', handoff: true, product, reason: 'unsupported' };
}
export function makeHandoff(topic: string, questions: string[], product?: string) {
  const summary = questions.length ? questions.slice(-5).map(q => `• ${q}`).join('\n') : 'Gostaria de mais informações sobre este assunto.';
  return `Olá! Vim pelo site STS DETOX IÔNICO.\nAssunto: ${topic}\nProduto/livro de interesse: ${product || 'A informar — preencha antes de enviar, se aplicável.'}\nSolicitação do visitante / resumo:\n${summary}\nGostaria de continuar com uma pessoa do atendimento.`;
}



