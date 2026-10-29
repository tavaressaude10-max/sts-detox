export const WHATSAPP_PHONE = "5583989094835";

export const wa = (mensagem: string) =>
  `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    mensagem,
  )}&type=phone_number&app_absent=0`;

export const waGeral = wa(
  "Olá! Conheci o STS DETOX BioEquilíbrio pelo site e gostaria de mais informações.",
);
export const waPessoal = wa(
  "Olá! Conheci o STS DETOX BioEquilíbrio pelo site e gostaria de informações para uso pessoal.",
);
export const waProfissional = wa(
  "Olá! Sou profissional e gostaria de conhecer o equipamento STS DETOX BioEquilíbrio.",
);
export const waFormacao = wa(
  "Olá! Gostaria de informações sobre a formação STS DETOX BioEquilíbrio.",
);

export const waLivros = wa(
  "Olá! Estou vendo a página de livros de Severino Tavares da Silva e gostaria de mais informações.",
);
export const waEnciclopedia = wa(
  "Olá! Conheci pelo site a Enciclopédia Corpo Humano: O Mais Extraordinário Laboratório do Mundo, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waLivroDetox = wa(
  "Olá! Conheci pelo site o livro DETOX Iônico: Entre a Medicina Convencional e as Terapias Integrativas, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waLivroBioequilibrio = wa(
  "Olá! Conheci pelo site o livro DETOX BioEquilíbrio: Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waTresLivros = wa(
  "Olá! Conheci pelo site os três livros de Severino Tavares da Silva e gostaria de receber informações para adquirir a Enciclopédia Corpo Humano, o livro DETOX Iônico e o livro DETOX BioEquilíbrio.",
);

/** Link oficial de aquisição do livro DETOX Iônico (Amazon). */
export const amazonLivroDetox = "https://a.co/d/00FNIa7L";

/** Links oficiais de aquisição dos livros na Amazon. */
export const amazonLivroBioequilibrio = "https://www.amazon.com/dp/B0HLWWJG7Z";
export const amazonEnciclopedia = "https://www.amazon.com/dp/B0HLSVTLZL";
