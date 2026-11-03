# Padronização da marca — 01/11/2026

Somente local. Nenhum commit, push, deploy ou alteração na Hostinger.

Textos de apresentação usam DETOX BIOEQUILÍBRIO, STS DETOX BIOEQUILÍBRIO e
DETOX IÔNICO. Abrange home, Livros, checkout, eletrodos, menus, rodapé, títulos,
metadados, textos alternativos, mensagens de WhatsApp e respostas do Assistente.
As menções abreviadas BIOEQUILÍBRIO também usam caixa alta.

O nome no cabeçalho pode ocupar duas linhas em telas estreitas, para evitar que
o nome oficial seja cortado com reticências. Cores e restante do layout mantidos.

## Material digital

Informação oficial em `digitalStudyMaterialText`, usada nas regras prioritárias:

> O aparelho DETOX BIOEQUILÍBRIO acompanha os acessórios e o material de estudo em formato digital, disponibilizado para a capacitação do novo cliente. O material de estudo não é vendido separadamente.

A FAQ aprovada do assistente também registra essa informação. Perguntas sobre
curso, treinamento, apostila, capacitação, formato e material que acompanha o
aparelho recebem essa explicação e oferecem os quatro livros para conhecimento
independente. Interesse no aparelho conserva o atendimento humanizado e WhatsApp
oficial; eletrodos conservam o destino de modelos, conectores e valores.

## Limites da padronização

- Nenhuma renomeação de arquivos, componentes, funções, variáveis, rotas, URLs,
  identificadores de produto ou integrações. Rótulos de produto usados também
  como contexto do assistente foram atualizados junto com suas comparações.
- Acervo, PDFs, índice e registros privados F4 preservados. Apenas a apresentação
  do texto, título e fonte recebidos é padronizada no frontend; consulta original
  e verificação de evidências permanecem intactas.
- Capas, fotos e vídeos originais preservados. Letras incorporadas às imagens
  não foram redesenhadas. Perguntas digitadas pelo visitante mantêm sua grafia.
- Documentação histórica, rascunho antigo `proposta-eletrodos.html`, nomes técnicos
  e entradas de testes conservam grafias anteriores. Não fazem parte do build
  público. Títulos/descrições das playlists têm normalização de apresentação,
  sem alterar a API ou mídias externas.

## Conferência e testes

- Busca geral: nenhuma grafia mista restante nos textos públicos pesquisáveis
  de `src`, `index.html` e títulos de produtos gerados pelo servidor. Padrões de
  reconhecimento e normalização não são textos de saída.
- Comparação dos 20 arquivos da substituição textual: URLs literais, importações,
  IDs JSX e caminhos preservados. Links WhatsApp continuam no número oficial;
  somente os textos das mensagens foram atualizados.
- `npm.cmd run verificar`: TypeScript e build aprovados, saída `build`.
- `node scripts/test-assistant-commerce.mjs`: aprovado; 17 respostas/recortes,
  81 variantes, 54 perguntas de conhecimento/material, oito frases obrigatórias
  da etapa anterior, grafias alternativas de entrada, formato digital, preços,
  ações, bivolt automático 110/220 V e apresentação de respostas F4.
- `npm.cmd run test:commerce`: 20/20 aprovados com acesso ao loopback.
- `scripts/test-assistant-private.py`: aprovado; 154 decisões OCR, oito respostas
  com variantes, fontes e recusa de exportação.
- `scripts/test-assistant-corpus.py`: aprovado; quatro perguntas recuperam as
  páginas esperadas. O teste atualiza somente seu relatório privado de exemplos.
- `node scripts/test-assistant-local-http.mjs`: aprovado; resposta com fonte,
  proteções de origem/formato/tamanho e bloqueio HTTP dos arquivos privados.
- `node scripts/test-assistant.mjs`: **continua falhando na comparação editorial
  entre FAQs do assistente e páginas**. A divergência foi reproduzida antes desta
  alteração; home e Livros têm versões editoriais diferentes da base de 30/10.
  O teste agora executa as demais verificações antes de reportar a divergência:
  15 FAQs do assistente, fallbacks, quatro livros e WhatsApp passaram. Não foram
  substituídas respostas médicas/educativas aprovadas para forçar essa igualdade.
- Navegador integrado: home, Livros e compra em desktop 1280×900 e celular
  390×844; menu móvel, fontes e respostas do assistente; teste adicional da home
  em 320×740. Sem overflow horizontal observado. Resposta real do F4 sobre
  DETOX IÔNICO exibida com fonte e grafia padronizadas.

Não houve compra, cotação nos provedores reais, envio de WhatsApp, teste em celular
físico ou revalidação de reprodução de vídeos/YouTube. Build não comprova reprodução.

Disponível em http://127.0.0.1:5174/ no servidor local existente.
