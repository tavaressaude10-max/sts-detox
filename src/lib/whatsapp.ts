export const WHATSAPP_PHONE = "5583989094835";

export const wa = (mensagem: string) =>
  `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    mensagem,
  )}&type=phone_number&app_absent=0`;

export const waGeral = wa(
  "Olá! Conheci a STS DETOX IÔNICO pelo site e gostaria de mais informações.",
);
export const waPessoal = wa(
  "Olá! Conheci o aparelho DETOX BIOEQUILÍBRIO pelo site e gostaria de informações para uso pessoal.",
);
export const waProfissional = wa(
  "Olá! Gostaria de conhecer o material de estudo e o equipamento DETOX BIOEQUILÍBRIO.",
);
export const waFormacao = wa(
  "Olá! Gostaria de informações sobre o material de estudo do aparelho DETOX BIOEQUILÍBRIO.",
);

export const waLivros = wa(
  "Olá! Estou vendo a página de livros de Severino Tavares da Silva e gostaria de mais informações.",
);
export const waEnciclopedia = wa(
  "Olá! Conheci pelo site a Enciclopédia Corpo Humano: O Mais Extraordinário Laboratório do Mundo, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waLivroDetox = wa(
  "Olá! Conheci pelo site o livro DETOX IÔNICO: Entre a Medicina Convencional e as Terapias Integrativas, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waLivroBioequilibrio = wa(
  "Olá! Conheci pelo site o livro DETOX BIOEQUILÍBRIO: Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo, de Severino Tavares da Silva, e gostaria de receber informações para aquisição.",
);
export const waTresLivros = wa(
  "Olá! Conheci pelo site os três livros de Severino Tavares da Silva e gostaria de receber informações para adquirir a Enciclopédia Corpo Humano, o livro DETOX IÔNICO e o livro DETOX BIOEQUILÍBRIO.",
);

/** Link oficial de aquisição do livro DETOX IÔNICO (Amazon). */
export const amazonLivroDetox = "https://a.co/d/00FNIa7L";

/** Links oficiais de aquisição dos livros na Amazon. */
export const amazonLivroBioequilibrio = "https://www.amazon.com/dp/B0HLWWJG7Z";
export const amazonEnciclopedia = "https://www.amazon.com/dp/B0HLSVTLZL";
