# Apoio comercial no Assistente Tavares — 01/11/2026

## Regra final: conhecimento sem aquisição do aparelho

`src/lib/assistant-guidance.ts` acrescenta 23 formulações sobre conhecimento e
material: o material de estudo/capacitação acompanha o aparelho e não é vendido
separadamente. Interesse apenas em conhecimento oferece “Conhecer os livros”,
com link interno direto para `/#livros`, a vitrine dos quatro títulos com Amazon.
Não foi criada outra seção/FAQ nem outra instância do assistente.

Preços genéricos sem produto conhecido pedem identificação (aparelho ou
eletrodos). A resposta seguinte “Aparelho” encaminha ao professor Tavares;
“Eletrodos” oferece a seção `/#eletrodos-conexoes`. Produto já identificado é
respeitado, inclusive livros das regras anteriores. Aquisição/valor do aparelho
vai ao atendimento humano; pedido de material separado esclarece a regra e
oferece os livros. Perguntas de compatibilidade mantêm encaminhamento humano.

Arquivos desta continuidade: novo `src/lib/assistant-guidance.ts`; alterações em
`src/lib/assistant.ts` (somente tipos de ação e esclarecimento),
`src/lib/assistant-response.ts` (precedência da regra comercial),
`src/components/AssistenteTavares.tsx` (ação interna e contexto de esclarecimento),
`scripts/test-assistant-commerce.mjs` e neste documento. Nenhuma alteração em
Mercado Pago, SuperFrete, fluxo de compra, acervo, middleware ou worker F4.

Validação: 81 variantes anteriores mais 23 formulações novas e cenários de
preço/contexto aprovados; 20 testes da loja e teste HTTP F4 aprovados;
TypeScript/build e diff-check aprovados. Navegador confirmou ação para os quatro
livros, esclarecimento de preço e os dois encaminhamentos, sem erro de console.
Hashes do acervo e servidor comparados ao início desta etapa, sem alteração.
Backup: `backup-regra-conhecimento-20261101.zip` (ignorado pelo Git).
Sem publicação, push, envio de WhatsApp ou operação nos provedores externos.

## Histórico dos complementos anteriores

Complemento informado pelo proprietário: DETOX BioEquilíbrio bivolt automático
110/220 V, reconhece e ajusta a voltagem sem seleção manual; basta conectar o
cabo à tomada. Acrescentadas duas respostas curtas (voltagem e conexão à tomada),
com 12 variantes. Total atual: 17 respostas/recortes e 81 variantes. Essas
respostas identificam o equipamento, não os eletrodos, como produto de interesse.
Informação restrita ao DETOX BioEquilíbrio; não estendida a aparelhos de terceiros.

Complemento local solicitado pelo proprietário. Sem publicação, push,
configuração externa, novos serviços ou dependências.

## Implementação

O mesmo `AssistenteTavares` montado na raiz atende a compra. O botão discreto
“Posso ajudar em mais alguma coisa?”, associado ao nome Assistente Tavares,
dispara um evento de abertura desse diálogo. Não há segunda instância de chat.
O diálogo mantém o histórico e devolve o foco ao botão usado para abri-lo,
tanto pelo lançador anterior quanto pelo novo acesso da compra.

`assistant-commerce.ts` contém separadamente as 12 respostas fornecidas pelo
proprietário, resumidas sem acrescentar alegações, e três recortes da orientação
sobre duração. São 69 formulações explícitas, normalizadas por acentos, caixa e
pontuação. Não há IA, busca aproximada ou dedução de compatibilidade.

O roteador `assistant-response.ts` responde primeiro às formulações comerciais
reconhecidas. Elas não consultam nem são sobrescritas pela recuperação privada.
Perguntas desconhecidas sobre compatibilidade encaminham ao professor Tavares.
Para as demais perguntas, o caminho anterior `answerQuestion → consultLocalBase`
permanece intacto. As respostas anteriores não foram removidas nem reescritas.

Uma pergunta sobre sal recebe somente a orientação sobre sal. A escolha entre
100/200/250 sessões é neutra, sem recomendação do modelo mais caro. P10 sozinho
não confirma compatibilidade. Não foram acrescentados FAQs à página nem textos
de venda ao redor do novo botão. O cabeçalho do assistente identifica explicitamente
“Atendimento automático”; encaminhamentos citam o professor Tavares.

O fluxo, valores, cotações, coleta de dados, revisão, pagamento e retorno da
compra não foram alterados. Também não foram alterados os adaptadores de
SuperFrete/Mercado Pago, arquivos privados, worker Python ou middleware F4.

## Arquivos desta etapa

Criados:
- `src/lib/assistant-commerce.ts`: base comercial separada.
- `src/lib/assistant-response.ts`: escolha entre base comercial e fluxo anterior.
- `src/lib/assistant-open.ts`: evento compartilhado para abrir o diálogo existente.
- `src/components/AssistenteCompra.tsx`: botão discreto na compra.
- `scripts/test-assistant-commerce.mjs`: regressão de respostas e roteamento.
- `docs/ASSISTENTE_COMPRAS.md`: este registro.

Alterados:
- `src/components/AssistenteTavares.tsx`: usa o roteador, recebe a abertura externa,
  retorna o foco à origem e identifica o atendimento automático.
- `src/routes/compra.tsx`: monta somente o novo botão, após o conteúdo da compra.
- `docs/ASSISTENTE_TAVARES.md` e `docs/COMPRAS_LOCAL.md`: referências à continuidade.

Backup prévio: `backup-assistente-compra-20261101.zip`, ignorado pelo Git,
sem acervo privado ou credenciais. Mudanças anteriores do cliente preservadas.

## Testes concluídos

- `node scripts/test-assistant-commerce.mjs`: 15 respostas/recortes e 69 variantes;
  concisão, sal sem assuntos adicionais, escolha neutra, recusa de adivinhação,
  perguntas médicas/fora da base seguem as regras anteriores; FAQs e apresentações
  dos quatro livros preservadas; fonte F4, sinal de cancelamento e corpo da consulta
  preservados. O teste utiliza fetch simulado para verificar a separação.
- `node scripts/test-assistant-local-http.mjs`: consulta real ao servidor local
  com fonte; origem/formato/tamanho protegidos; exportação recusada; arquivos
  privados inacessíveis pelo navegador.
- `test-assistant-private.py`, executado com o Python configurado no runtime F4:
  oito respostas e variantes, verificação das 154 decisões OCR, fontes verificadas,
  recusa de exportação e de fonte adulterada. Sem alteração dos arquivos originais.
- `npm.cmd run test:commerce`: 20/20 testes aprovados.
- `npm.cmd run verificar`: TypeScript e build aprovados após a correção do matcher
  de “conector” singular detectada no teste inicial.
- `git diff --check`: aprovado. Aviso preexistente do Vite sobre
  `vite-tsconfig-paths` não impede o build.
- Navegador local: novo botão e lançador anterior abrem o mesmo diálogo (uma
  instância); pergunta por botão e Enter; resposta curta sobre sal; compatibilidade
  encaminha com mensagem revisável; Enciclopédia retorna fonte/página 10 do PDF;
  Escape/X fecham; histórico, quantidade 3 e CEP preenchido permanecem.
  Viewports 390×844 e 1280×900 conferidos; sem overflow horizontal no celular
  e sem erros de console registrados. Não foi enviado WhatsApp.
- SHA-256: 389 arquivos do acervo privado e 18 arquivos preexistentes de
  servidor/scripts comparados com o início desta etapa: zero alterações.
- Comparação com o ZIP prévio confirmou que, dos arquivos existentes, somente
  os quatro listados acima foram alterados. Motor anterior, integração F4,
  componente do fluxo de compra, pacotes e configuração permanecem idênticos.

Limites: testes no navegador disponível, sem celular físico ou nova validação
de vídeos. Sem credenciais externas, compra em provedores, envio de e-mail ou
publicação. Os alertas npm registrados em `COMPRAS_LOCAL.md` continuam fora do
escopo deste complemento; nenhum pacote/lockfile foi modificado.
