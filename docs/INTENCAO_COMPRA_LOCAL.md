# Intenção de compra do assistente — 01/11/2026

Alteração somente local, sem commit, push ou publicação.

`src/lib/assistant-guidance.ts` trata as intenções antes das respostas comerciais
genéricas e do F4. Curso, treinamento, apostila e material de estudo não são
oferecidos separadamente: a resposta explica que o material acompanha o aparelho
e oferece os quatro livros em `/#livros`. Pedidos de estudo independente também
levam aos livros. Interesse no aparelho/DETOX e em ser praticante recebe a
mensagem acolhedora aprovada, com acessórios e material de capacitação.

O botão “Falar com o professor Tavares” dessa resposta agora é um link direto
ao WhatsApp oficial, gerado pelo helper `wa`, em nova aba. Não envia mensagem
automaticamente. Os demais encaminhamentos humanos mantêm a revisão anterior.
Eletrodos continuam direcionados a `/#eletrodos-conexoes`.

Os padrões reconhecem frases completas e variações de intenção, acentos,
pontuação e formas de cortesia. Não são uma interpretação ilimitada de linguagem
natural. Perguntas técnicas e frases não reconhecidas conservam o fluxo anterior.

## Validação

As oito frases abaixo passaram tanto no teste automatizado dos módulos reais
quanto no assistente aberto no navegador local:

| Frase exata | Destino |
| --- | --- |
| Quero comprar o curso. | Explicação sobre material + livros |
| Quanto custa o curso? | Explicação sobre material + livros |
| Quero o aparelho. | Apresentação do conjunto + WhatsApp |
| Quero comprar o DETOX. | Apresentação do conjunto + WhatsApp |
| Quero comprar o DETOX IÔNICO. | Apresentação do conjunto + WhatsApp |
| Quero adquirir o DETOX BioEquilíbrio. | Apresentação do conjunto + WhatsApp |
| Qual o valor do aparelho? | Apresentação do conjunto + WhatsApp |
| Qual valor do eletrodo? | Seção de modelos, conectores e valores |

- `node scripts/test-assistant-commerce.mjs`: aprovado; inclui variantes,
  não confundir livro com aparelho, negação, respostas técnicas, bivolt automático
  110/220 V e roteamento F4 com fetch simulado.
- `npm.cmd run verificar`: TypeScript e build aprovados.
- `npm.cmd run test:commerce`: 20/20 aprovados com loopback autorizado.
  A primeira execução isolada bloqueou fetch do teste HTTP; repetição passou.
- Navegador: respostas e botões visíveis; cliques de livros e eletrodos chegaram
  às seções corretas. Os quatro livros foram conferidos no destino. URL oficial
  do WhatsApp validada no teste, sem envio de mensagem ou abertura do aplicativo.
- Mercado Pago, SuperFrete, catálogo e checkout não foram editados. Testes usam
  simulações; nenhuma transação ou cotação externa foi realizada.
- F4 privado, digitação e rolagem não foram alterados. Não houve revalidação do
  acervo completo, de Firefox externo, celular físico ou reprodução do YouTube.

Conferência: http://127.0.0.1:5174/ (servidor local já em execução).
