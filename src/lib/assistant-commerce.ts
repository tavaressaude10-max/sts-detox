import { normalize, type Answer } from './assistant';

// Base comercial fornecida pelo proprietário em 01/11/2026.
// Independente das FAQs anteriores e da recuperação privada F4. Sem inferência
// por palavras soltas: só perguntas/variantes aprovadas recebem respostas factuais.
export const commerceAnswers = [
  {
    id: 'voltage',
    product: 'Equipamento DETOX BIOEQUILÍBRIO',
    questions: ['O aparelho é bivolt?', 'O DETOX BIOEQUILÍBRIO é bivolt?', 'Qual a voltagem do aparelho?', 'O aparelho funciona em 110 ou 220 V?', 'Preciso selecionar 110 ou 220 V?', 'Preciso mudar a chave de voltagem?', 'O aparelho é 110 ou 220?', 'O bivolt é automático?'],
    text: 'O DETOX BIOEQUILÍBRIO é bivolt automático (110/220 V). O próprio equipamento reconhece e ajusta a voltagem; não é necessário selecionar 110 V ou 220 V manualmente.',
  },
  {
    id: 'power-connection',
    product: 'Equipamento DETOX BIOEQUILÍBRIO',
    questions: ['Como conectar o aparelho à tomada?', 'Como ligar o DETOX BIOEQUILÍBRIO na tomada?', 'Basta conectar o cabo à tomada?', 'Preciso ajustar a voltagem antes de conectar à tomada?'],
    text: 'Basta conectar o cabo do DETOX BIOEQUILÍBRIO à tomada. Ele é bivolt automático (110/220 V) e ajusta a voltagem sem seleção manual.',
  },
  {
    id: 'sessions',
    questions: ['O eletrodo faz realmente 100, 200 ou 250 sessões?', 'Quantas sessões dura o eletrodo?', 'Quantas sessões o eletrodo faz?', 'O eletrodo dura 100 sessões?', 'O eletrodo dura 200 sessões?', 'O eletrodo dura 250 sessões?'],
    text: 'A quantidade é aproximada: o eletrodo pode realizar mais ou menos sessões, conforme o uso, a quantidade de sal, a conservação e o manuseio. A estimativa usa como referência sessões de 30 minutos.',
  },
  {
    id: 'water',
    questions: ['Qual água posso usar?', 'Que água posso usar?', 'Qual água devo usar?', 'Posso usar água de poço?', 'Posso usar água filtrada?', 'Posso usar água tratada?'],
    text: 'Pode ser utilizada água tratada, filtrada ou de poço. Se a água de poço tiver salinidade suficiente, não é necessário acrescentar sal.',
  },
  {
    id: 'salt',
    questions: ['Qual sal devo usar?', 'Qual sal posso usar?', 'Que sal posso usar?', 'Posso usar sal comum?', 'Qual o tipo de sal?', 'Qual sal usar no equipamento?'],
    text: 'Pode ser utilizado sal comum. Sua função é aumentar a condutividade elétrica da água. A quantidade deve seguir as orientações de uso do equipamento.',
  },
  {
    id: 'duration',
    questions: ['Quanto tempo o eletrodo pode ficar funcionando?', 'Quanto tempo pode durar a sessão?', 'Qual a duração da sessão?', 'Quanto tempo dura uma sessão?'],
    text: 'Depende do equipamento: no DETOX IÔNICO, a recomendação é não ultrapassar 30 minutos. No DETOX BIOEQUILÍBRIO, a programação pode chegar a 55 minutos; os primeiros 30 correspondem à etapa de DETOX IÔNICO e o restante à proposta BIOEQUILÍBRIO. A estimativa de durabilidade do eletrodo usa sessões de 30 minutos.',
  },
  {
    id: 'more-salt',
    questions: ['Posso colocar mais sal para aumentar o funcionamento?', 'Posso colocar mais sal?', 'Posso aumentar a quantidade de sal?', 'Mais sal melhora o funcionamento?', 'Quanto sal devo usar?', 'Qual a quantidade de sal?'],
    text: 'Não é recomendado aumentar a quantidade de sal por conta própria. Utilize a quantidade indicada nas orientações de uso do equipamento.',
  },
  {
    id: 'choice',
    questions: ['Qual eletrodo devo comprar: 100, 200 ou 250 sessões?', 'Qual eletrodo devo comprar?', 'Qual eletrodo escolher?', 'Qual é melhor, 100, 200 ou 250 sessões?', 'Devo comprar o eletrodo mais caro?'],
    text: 'A escolha é sua, conforme a necessidade de uso e as condições financeiras. Compare as características e a quantidade aproximada de sessões. O modelo de 250 sessões é exclusivo para o DETOX BIOEQUILÍBRIO.',
  },
  {
    id: 'p10',
    questions: ['O eletrodo de 250 sessões serve em qualquer aparelho com entrada P10?', 'O eletrodo de 250 sessões serve em qualquer aparelho P10?', 'O eletrodo de 250 sessões serve em qualquer aparelho?', 'P10 garante compatibilidade com o eletrodo de 250 sessões?'],
    text: 'Não. O conector P10, sozinho, não determina a compatibilidade. O eletrodo de aproximadamente 250 sessões foi desenvolvido para o DETOX BIOEQUILÍBRIO e possui configuração própria de cabo.',
  },
  {
    id: 'connector',
    questions: ['Qual conector devo escolher?', 'Qual conector escolher?', 'Qual conector devo comprar?'],
    text: 'Confira o conector utilizado pelo seu equipamento e compare com as opções da página. Se houver dúvida de compatibilidade, fale com o professor Tavares antes de comprar.',
    handoff: true,
  },
  {
    id: 'unknown-connector',
    questions: ['Não sei qual é o conector do meu aparelho. O que faço?', 'Não sei qual é o conector do meu aparelho', 'Não sei qual conector comprar', 'Não conheço o conector do meu aparelho'],
    text: 'Para evitar uma compra incompatível, fale com o professor Tavares antes de finalizar o pedido.',
    handoff: true,
  },
  {
    id: 'care',
    questions: ['Como conservar o eletrodo para durar mais?', 'Como conservar o eletrodo?', 'Como cuidar do eletrodo?', 'Como fazer o eletrodo durar mais?'],
    text: 'Utilize a quantidade de sal indicada, faça a limpeza após o uso e cuide do manuseio e armazenamento. A durabilidade pode variar conforme a utilização e a conservação.',
  },
  {
    id: 'guarantee',
    questions: ['A duração do eletrodo tem garantia de número exato de sessões?', 'O número de sessões é garantido?', 'As sessões do eletrodo são garantidas?', 'Tem garantia de 100 sessões?', 'Tem garantia de 200 sessões?', 'Tem garantia de 250 sessões?'],
    text: 'Não. A quantidade de sessões é aproximada e varia conforme as condições de uso, a quantidade de sal, a conservação e o manuseio.',
  },
  {
    id: 'quantity',
    questions: ['Posso comprar vários eletrodos no mesmo pedido?', 'Posso comprar mais de um eletrodo?', 'Quantos eletrodos posso comprar?', 'Posso comprar 9 eletrodos?', 'Posso comprar 10 eletrodos?', 'O frete é calculado para quantos eletrodos?'],
    text: 'Sim. O site calcula automaticamente o frete para até 8 eletrodos. Para 9 unidades ou mais, fale com o professor Tavares para atendimento direto.',
  },
  // Recortes da resposta sobre duração: não acrescentar outros assuntos.
  {
    id: 'ionic-time',
    questions: ['Quanto tempo dura a sessão de DETOX IÔNICO?', 'Quanto tempo pode durar uma sessão de DETOX IÔNICO?', 'Qual o tempo máximo no DETOX IÔNICO?'],
    text: 'No DETOX IÔNICO, a recomendação é não ultrapassar 30 minutos por sessão. O tempo pode ser menor em situações específicas, conforme as orientações de uso do equipamento.',
  },
  {
    id: 'bio-time',
    questions: ['Quanto tempo dura a sessão de DETOX BIOEQUILÍBRIO?', 'Qual o tempo máximo no DETOX BIOEQUILÍBRIO?', 'O DETOX BIOEQUILÍBRIO pode chegar a 55 minutos?'],
    text: 'A programação do DETOX BIOEQUILÍBRIO pode chegar a 55 minutos. Os primeiros 30 minutos correspondem à etapa de DETOX IÔNICO; o período posterior faz parte da proposta BIOEQUILÍBRIO.',
  },
  {
    id: 'reference-time',
    questions: ['Por que a estimativa usa 30 minutos?', 'Toda sessão precisa durar 30 minutos?', 'Os 30 minutos são obrigatórios?'],
    text: 'Não é uma duração obrigatória para todas as sessões. Os 30 minutos são a referência usada para estimar a quantidade aproximada de sessões do eletrodo; o tempo de uso depende das orientações do equipamento.',
  },
] satisfies { id: string; questions: string[]; text: string; handoff?: boolean; product?: string }[];

export function answerCommerceQuestion(question: string): Answer | undefined {
  const key = normalize(question);
  const entry = commerceAnswers.find(item => item.questions.some(q => normalize(q) === key));
  if (entry) return {
    text: entry.text, handoff: Boolean(entry.handoff), product: entry.product ?? 'Eletrodos',
    reason: entry.handoff ? 'human' : 'commercial',
    sourceLabel: `Orientações fornecidas pelo responsável — ${entry.product ?? 'eletrodos'}`,
  };
  // Fora das variantes conhecidas, compatibilidade sempre exige confirmação
  // humana. Não concluir compatibilidade a partir do nome do conector/aparelho.
  if (/\b(conector(?:es)?|compatibilidade|compativel|compativeis|p10|xlr|mike)\b/.test(key)
    || (/\beletrodos?\b/.test(key) && /\b(serve|servem|encaixa|encaixam|funciona com|funcionam com)\b/.test(key))) {
    return { text: 'Para confirmar a compatibilidade antes da compra, fale com o professor Tavares.', handoff: true, product: 'Eletrodos', reason: 'human' };
  }
  return undefined;
}
