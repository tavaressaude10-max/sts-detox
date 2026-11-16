import { commercialHandoffText, digitalStudyMaterialText, normalize, type Answer } from './assistant';
import { wa } from './whatsapp';

// Regra comercial final aprovada pelo responsável. Sem modificar FAQs ou F4.
export const knowledgeQuestions = [
  'Quero aprender, mas não quero comprar o aparelho.',
  'Quero aprender sem comprar o aparelho',
  'Quero estudar sem comprar o aparelho',
  'Não quero comprar o aparelho, só aprender',
  'Quero apenas conhecer melhor a técnica.',
  'Quero apenas estudar',
  'Quero só conhecimento',
  'Onde posso estudar mais sobre DETOX IÔNICO e DETOX BIOEQUILÍBRIO?',
  'Onde posso estudar mais sobre DETOX IÔNICO?',
  'Onde posso estudar mais sobre DETOX BIOEQUILÍBRIO?',
  'Existe algum livro sobre o assunto?',
  'Tem algum livro sobre DETOX IÔNICO?',
  'Tem algum livro sobre DETOX BIOEQUILÍBRIO?',
];
export const materialQuestions = [
  'Existe material de estudo?',
  'Existe material de estudo para acompanhar o equipamento?',
  'Como posso aprender a utilizar o equipamento?',
  'O que acompanha o aparelho?',
  'Qual material acompanha o aparelho?',
  'O material é digital?',
  'O material de estudo é digital ou impresso?',
  'O material de estudo é digital?',
  'O material de estudo é impresso?',
  'O curso é online?',
  'Tem curso?',
  'Tem treinamento?',
  'Tem apostila?',
  'Como é o material que acompanha o aparelho?',
  'Qual é o formato do material de estudo?',
  'Quero saber sobre a capacitação',
  'Como recebo o material de estudo?',
  'Como funciona a capacitação?',
  'Como funciona o curso?',
  'Como funciona o treinamento?',
  'O aparelho acompanha curso?',
  'O aparelho acompanha treinamento?',
  'O aparelho acompanha material de estudo?',
  'O curso é vendido separadamente?',
  'O treinamento é vendido separadamente?',
  'A apostila é vendida separadamente?',
  'Curso',
  'Treinamento',
  'Capacitação',
  'Material de estudo',
  'Fale sobre material de estudo',
  'Tem algum material que eu possa comprar para estudar?',
  'Posso comprar somente o material de estudo?',
  'Posso comprar só o material?',
  'O material de estudo é vendido separadamente?',
  'Quero comprar apenas o material de estudo',
  'Quero comprar o material de capacitação',
  'Quanto custa o material de estudo?',
  'Qual o preço do material de estudo?',
  'O material de capacitação acompanha o aparelho?',
  'O material de estudo acompanha o aparelho?',
];
const matches = (key: string, questions: string[]) => questions.some(q => normalize(q) === key);
const sourceLabel = 'Orientações comerciais fornecidas pelo responsável';
const books = (material = false): Answer => ({
  text: material
    ? `${digitalStudyMaterialText} Para adquirir conhecimento sem comprar o aparelho, conheça os quatro livros de Severino Tavares da Silva.`
    : 'Se o seu interesse é adquirir conhecimento sem comprar o aparelho, você pode conhecer os livros de Severino Tavares da Silva. Eles reúnem conteúdos sobre DETOX IÔNICO, DETOX BIOEQUILÍBRIO e temas relacionados.',
  handoff: false, reason: 'commercial', product: material ? 'Material de estudo STS' : 'Livros de Severino Tavares da Silva',
  sourceLabel, action: { label: 'Conhecer os livros', href: '/#livros' },
});
const equipment = (): Answer => ({
  text: `Que bom saber do seu interesse no DETOX BIOEQUILÍBRIO! ${digitalStudyMaterialText} ${commercialHandoffText}`,
  handoff: true, reason: 'commercial', product: 'Equipamento DETOX BIOEQUILÍBRIO',
  action: { label: 'Falar com o professor Tavares', href: wa('Olá! Tenho interesse em adquirir o aparelho DETOX BIOEQUILÍBRIO com acessórios e material de estudo em formato digital para capacitação.'), external: true },
});
const electrodes = (): Answer => ({
  text: 'Confira os modelos, conectores e valores na seção de eletrodos do site.',
  handoff: false, reason: 'commercial', product: 'Eletrodos', sourceLabel,
  action: { label: 'Ver modelos e valores dos eletrodos', href: '/#eletrodos-conexoes' },
});

export function answerCommercialGuidance(question: string, previousProduct?: string, clarifyingPrice = false): Answer | undefined {
  const key = normalize(question).replace(/^(?:ola |oi )?(?:por favor )?/, '').replace(/ por favor$/, '');
  if (matches(key, knowledgeQuestions)) return books();
  if (matches(key, materialQuestions)) return books(true);
  if (/^(?:(?:o |a )?(?:curso|treinamento|apostila|material de estudo|material de capacitacao|capacitacao)(?: (?:de |do |sobre )?detox(?: ionico| bioequilibrio)?)?|(?:quero saber sobre|fale sobre|como funciona) (?:o |a )?(?:curso|treinamento|apostila|material de estudo|material de capacitacao|capacitacao))$/.test(key)) return books(true);
  // Padrões completos de intenção: não capturar dúvidas técnicas pelo nome
  // do produto, nem confundir o livro DETOX com a aquisição do aparelho.
  const purchase = '(?:quero(?: comprar| adquirir)?|gostaria de(?: comprar| adquirir)?|desejo(?: comprar| adquirir)?|tenho interesse (?:em comprar|em adquirir|em|no|na)|como (?:faco para |posso )?(?:comprar|adquirir)|onde (?:posso )?(?:comprar|adquirir)|qual (?:e )?(?:o )?(?:preco|valor)(?: d[oa]s?)?|quanto custa[m]?)';
  const device = '(?:(?:o|um|no) )?(?:(?:aparelho|equipamento)(?: (?:de )?detox(?: ionico| bioequilibrio)?)?|detox(?: ionico| bioequilibrio)?)';
  const material = '(?:(?:o|um|a|uma|somente o|so o|apenas o) )?(?:curso|treinamento|apostila|material(?: de estudo| de capacitacao)?)(?: (?:de |sobre )?detox(?: ionico| bioequilibrio)?)?(?: separadamente| para aprender| para estudar)?';
  if (new RegExp(`^${purchase} ${material}$`).test(key)
    || /^(?:quero|gostaria de|desejo) (?:fazer|cursar) (?:o |um )?(?:curso|treinamento)(?: de detox)?$/.test(key)) return books(true);
  if (/^(?:quero|gostaria de|desejo) (?:aprender|estudar)(?: (?:sobre )?detox(?: ionico| bioequilibrio)?)?(?: sem (?:comprar|adquirir) (?:o )?(?:aparelho|equipamento))?$/.test(key)) return books();
  if (new RegExp(`^${purchase} ${device}(?: com (?:os )?acessorios(?: e (?:o )?material de estudo)?)?$`).test(key)
    || /^(?:(?:quero|gostaria de|desejo) (?:ser|me tornar) (?:um )?praticante|como (?:faco para |posso )?(?:comprar|adquirir))$/.test(key)) return equipment();
  if (new RegExp(`^${purchase} (?:(?:o|os|um|uns) )?eletrodos?(?: de (?:100|200|250) sessoes)?$`).test(key)) return electrodes();
  if (/^(?:o |do |sobre o )?(?:aparelho|equipamento)$/.test(key) && clarifyingPrice) return equipment();
  if (/^(?:(?:os |dos |sobre os |o |do |sobre o ))?eletrodos?$/.test(key)) return electrodes();
  if (/^(?:quero comprar|quero adquirir|como comprar|como adquirir|onde comprar|qual o preco d[oe]s?|qual e o preco d[oe]s?|qual o valor d[oe]s?|quanto custa[m]?) (?:o |os |um )?(?:aparelho|equipamento)(?: detox (?:bioequilibrio|ionico))?$/.test(key)) return equipment();
  if (/^(?:quero comprar|quero adquirir|como comprar|onde comprar|qual o preco d[oe]s?|qual e o preco d[oe]s?|qual o valor d[oe]s?|quanto custa[m]?) (?:o |os |um )?eletrodos?(?: de (?:100|200|250) sessoes)?$/.test(key)) return electrodes();
  if (/^(?:qual (?:e )?o preco|qual (?:e )?o valor|quanto custa|quanto e|preco|valor|quanto custa isso|qual o preco disso)$/.test(key)) {
    if (previousProduct === 'Equipamento DETOX BIOEQUILÍBRIO') return equipment();
    if (previousProduct === 'Aparelho DETOX IÔNICO') return equipment();
    if (previousProduct === 'Eletrodos') return electrodes();
    if (previousProduct === 'Material de estudo STS') return books(true);
    // Um livro já identificado conserva o encaminhamento anterior.
    if (previousProduct && !previousProduct.startsWith('Livros de ')) return undefined;
    return { text: 'Você quer saber o preço do aparelho DETOX BIOEQUILÍBRIO ou dos eletrodos?', handoff: false, reason: 'commercial', clarification: 'price-product' };
  }
  return undefined;
}
