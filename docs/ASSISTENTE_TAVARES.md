# Assistente Tavares — avaliação local, 30/10/2026

Complemento de 01/11/2026: apoio à compra de eletrodos no mesmo assistente,
com base comercial separada e preservação F4. Implementação, arquivos e testes
registrados em [ASSISTENTE_COMPRAS.md](ASSISTENTE_COMPRAS.md). Sem publicação.

Estado em 31/10/2026: demonstração F4 com integração privada **somente local**.
Ver `INTEGRACAO_PRIVADA_LOCAL.md` para revisão OCR, execução, testes e limites.
Oito respostas curtas dos livros são consultadas no servidor com verificação
de fonte. Não há IA nem publicação. Mantido o diálogo/foco validado no F3.

Não publicado. Nenhum commit/push, serviço de IA, conta ou cobrança foi ativado.

## Continuidade F3 e base privada — estado mais recente

Validação posterior pelo proprietário no Firefox externo: Home local e Livros
local exibem F3, abrem e funcionam normalmente; os quatro livros aparecem.
A pergunta “Trata saúde” não travou e recebeu falta de resposta fundamentada
com continuidade para atendimento humano. O travamento após Q não voltou a
ocorrer nos cenários testados. Tratar essa reprodução como resolvida nesses
testes, sem atribuir uma causa adicional não comprovada. A confirmação é do
proprietário, não de controle automatizado do Firefox. Publicação continua
proibida nesta etapa. Os parágrafos abaixo preservam o histórico da investigação.

Base privada preparada: ver `BASE_PRIVADA_ASSISTENTE.md`. Os quatro PDFs foram
processados localmente (1.092 páginas, 1.720 trechos), sem conectar esse acervo
ao navegador. O site continua com FAQs fixas e a identificação “sem IA”.

A porta 5174 foi conferida por HTTP: componente atualizado contém “Teste local
F3”; a entrada `/teste-assistente.html` responde 200. Índice SQLite, texto JSONL
via `?raw` e arquivo de controle via `/@fs/` respondem 403. Build não contém
PDFs, SQLite, JSONL privados, IDs de trechos ou marca de diagnóstico F3.

No teste isolado, o mesmo componente em StrictMode funcionou no navegador
compatível: abrir, digitar Q, completar “Quais são os livros?”, enviar pelo
botão e por Enter, receber a resposta, fechar pelo botão e por Escape e
retornar o foco ao lançador. Não houve controle do Firefox externo.

Retorno posterior do proprietário: no Firefox externo, “F3 aparece e a
pergunta completa funciona” na página isolada. Isso confirma a digitação
nesse cenário; não confirma envio, fechamento ou funcionamento nas páginas
completas. Próxima comparação: `/` e `/livros`, após Ctrl+F5 e conferência
do mesmo rótulo F3, primeiro sem abrir menus e depois após usar o menu Livros.
O resultado restringe a investigação à diferença entre os cenários, sem
atribuir antecipadamente a causa aos menus, cache ou extensões.

A correção anterior removeu html/head/body aninhados na raiz React da SPA e
o efeito que sincronizava showModal/close com estado. A implementação atual
não tem efeito no chat executado por digitação; seu único focus explícito
ocorre no fechamento. SiteHeader registra os listeners uma vez e remove no
cleanup; Escape fecha menus, sem foco forçado. Não foi identificada disputa
de foco atual nem novo ciclo que explique o travamento Firefox após Q.
Essas observações não confirmam que o problema daquele navegador foi resolvido.
Recursos de acessibilidade foram mantidos.

Roteiro inicial de teste manual Firefox (digitação isolada já confirmada): abrir
`http://127.0.0.1:5174/teste-assistente.html`, atualizar com Ctrl+F5, confirmar
o rótulo F3, abrir o chat, digitar Q e depois o restante da pergunta. Enviar,
fechar e reabrir; comparar com `/` e `/livros`. Registrar versão Firefox e se
a falha ocorre também na página isolada. Se só ocorrer na página completa,
investigar integração; se também ocorrer isolada, investigar o componente,
estilo/modal e ambiente do navegador com essa reprodução mínima. Não inferir
que extensões ou cache são a causa sem evidência. Celular real e encaminhamento
externo de WhatsApp continuam pendentes de validação ponta a ponta.

`npm run verificar`, testes das FAQs/WhatsApp e os quatro testes de recuperação
privada passaram. Os registros históricos abaixo documentam as etapas anteriores.

## Correção do travamento — 30/10/2026

Atribuir os timeouts anteriores somente à ferramenta foi insuficiente: havia
um defeito na estrutura da SPA. `createRoot(#root)` montava uma RootShell com
`html/head/body`, embora esses elementos já pertençam ao `index.html`.
React 19 reutiliza os elementos únicos do documento; isso associa ancestrais
do container à árvore React montada dentro dele. A travessia de ancestrais
do sistema de eventos passa a ter uma estrutura incompatível com a montagem.
O console confirmou `html cannot be a child of div`. A correção remove somente
o invólucro de documento da RootShell e mantém HeadContent, rotas e metadados.
Após recarregar, digitar e enviar deixaram de travar no navegador compatível.

Foi reproduzida também uma corrida de fechamento/reabertura: `close` nativo
é assíncrono e podia atualizar o estado depois da reabertura. Abertura e
fechamento agora são comandos explícitos do diálogo, sem efeito de sincronização;
um evento close atrasado não altera o estado de um diálogo já reaberto.
O diálogo nativo, modalidade, Escape, rótulos e retorno de foco foram mantidos.
Não foi necessário remover acessibilidade nem alterar os menus existentes.

Validação interativa que supera parte das limitações históricas abaixo:

- Abrir pelo mouse; digitar sequencialmente “O STS realiza diagnóstico?”;
  enviar por Enter e confirmar resposta e fonte dentro do chat.
- Fechar por Escape; confirmar foco no lançador; reabrir por Enter;
  digitar “Fale sobre o livro DETOX Iônico” e enviar clicando em Perguntar.
- Fechar pelo X; abrir menu móvel e depois chat; Tab alcança os assuntos;
  digitar/enviar “Existe material de estudo?” e receber resposta.
- Viewport desktop 1280×900: menu Livros e chat, consulta comercial digitada
  sobre DETOX PET e abertura da revisão com produto e solicitação corretos.
- Edição por teclado do resumo refletida no href do WhatsApp, sem envio;
  na home, digitação completa de “A cor da água representa toxinas?”, envio
  pelo mouse e resposta com fonte também confirmados. TypeScript, build e
  testes de conteúdo passaram após as correções.
- Nenhum desses fluxos voltou a travar no navegador de testes compatível.
  Firefox externo não foi controlado devido ao bloqueio da ferramenta;
  validação no Firefox e celular físico continua pendente. Não houve envio
  de mensagem pelo WhatsApp. Recarregar a aba antiga é necessário para
  substituir a estrutura inválida; apenas hot reload não é uma confirmação.

## Estrutura encontrada e preservada

SPA React 19/TypeScript, duas rotas, sem chatbot, backend, banco de dados ou
configuração de IA existente. A API externa das playlists não é um servidor
de atendimento. Reutilizado `wa()` de `src/lib/whatsapp.ts`, com número oficial
5583989094835. Nenhuma chave foi criada ou colocada no frontend.

Já havia alterações locais em `docs/VALIDACAO.md`, `SiteHeader.tsx`,
`whatsapp.ts` e `routes/index.tsx`. Esses arquivos não foram editados nesta etapa.
O assistente foi montado na raiz, preservando o Outlet e as duas páginas.

## Avaliar

Execute `npm.cmd run dev -- --host 127.0.0.1 --port 5174` e abra
http://127.0.0.1:5174/ ou http://127.0.0.1:5174/livros no mesmo computador.
O endereço de loopback não serve para abrir em outro celular físico.

- Botão Assistente Tavares acima do WhatsApp existente, com espaço entre eles.
- Demonstração claramente identificada como sem IA conectada.
- Assuntos: equipamento, materiais de estudo, quatro livros e atendimento.
- Os quatro livros incluem DETOX PET; cada opção responde dentro do chat com
  apresentação e fonte, sem abrir revisão comercial nem presumir compra.
- 15 FAQs copiadas integralmente das duas páginas, com links para as fontes.
- Perguntas digitadas só recebem uma FAQ se coincidirem com a pergunta
  publicada, desconsiderando maiúsculas, acentos e pontuação. Também são
  reconhecidos títulos e pedidos gerais como “Fale sobre o livro DETOX Iônico”.
  Não há busca semântica nem interpretação livre. Perguntas específicas sem
  correspondência aprovada ou com dúvida/conflito recebem fallback humano.
- Compra e contato humano oferecem revisão da mensagem para WhatsApp.
- Resumo editável: assunto, produto/livro e solicitação do visitante. O botão
  de uma resposta usa aquela pergunta e seu produto; o contato humano geral
  inclui até cinco últimas perguntas/interesses. Não é
  um resumo gerado por IA. Texto limitado a 3.000 caracteres na revisão.
- Abrir WhatsApp não confirma envio ou recebimento. O visitante precisa enviar
  no próprio WhatsApp. Nenhuma mensagem foi enviada nos testes.
- Conversa apenas em memória da página; até 20 interações, sem persistência.
  Recarregar ou seguir links que recarreguem a página apaga a conversa.
- Não há diagnóstico, prescrição, promessa de cura, interpretação diagnóstica
  da água nem distribuição de livros completos ou materiais restritos.

## Arquivos e manutenção

`src/lib/assistant-faq.ts` registra a cópia das FAQs aprovadas.
`src/lib/assistant.ts` contém a seleção conservadora de respostas e o resumo.
Também contém seis apresentações fundamentadas nas páginas públicas: quatro
livros, equipamento e material de estudo, com nome e link da fonte. Não foram
incorporados arquivos integrais dos livros. DETOX PET tem apenas identificação,
autoria e capa nesta base; o assistente informa esse limite. A inclusão de
conteúdo adicional exige trechos aprovados e referência verificável, sem
expor material restrito. Fontes abrem em nova aba para preservar a conversa.
`src/components/AssistenteTavares.tsx` e seu CSS contêm a interface.
Ao mudar FAQs públicas, atualizar a cópia e executar
`node scripts/test-assistant.mjs`: o teste detecta divergências com as páginas.

## Validação realizada e limites

- Node 22.23.4. `npm ci` concluído, zero vulnerabilidades relatadas.
  Foi necessário parar a prévia antiga do próprio projeto, que bloqueava
  o módulo nativo lightningcss. Dependências e lockfile não foram alterados.
- `npm run verificar`: TypeScript e build aprovados, saída `build`.
- `node scripts/test-assistant.mjs`: 15 FAQs iguais às fontes, 10 cenários
  de fallback (incluindo saúde, dados comerciais não aprovados e material
  restrito), quatro livros e codificação do WhatsApp aprovados.
  Na revisão do fluxo, também foram testadas apresentações dos quatro livros
  sem intenção comercial, consultas de pagamento, pedido humano, conflito de
  fontes e continuidade “Quanto custa?” preservando o produto anterior.
  “Corpo Humano” não é tratado como pedido de atendimento humano.
- HTTP local 200. Home e livros carregaram no navegador. Screenshot desktop
  mostrou botões flutuantes separados; diálogo nativo abriu com título,
  opções, campo de pergunta e foco inicial em Fechar assistente.
- O navegador de avaliação apresentou repetidos timeouts em comandos de
  interação e em tentativa de viewport móvel. Não foi possível concluir os
  testes visuais de respostas, Tab/Shift+Tab/Enter/Escape, fechar/reabrir,
  edição do resumo e abertura efetiva do WhatsApp nem validar layout móvel.
  A URL e seu texto foram validados em teste de código, não de ponta a ponta.
  Na revisão seguinte, a abertura do chat, seleção de “Quatro livros” e
  resposta “DETOX Iônico” com fonte foram confirmadas pela árvore acessível
  do navegador, sem abrir revisão de compra. A tentativa de digitação
  automatizada voltou a resultar em timeout; continuam os limites de teclado,
  celular e WhatsApp ponta a ponta descritos acima.
- O componente usa diálogo nativo modal, foco e Escape do navegador,
  rótulos acessíveis, região de conversa anunciada e altura baseada em dvh.
  A presença desses recursos no código não substitui o teste em dispositivos.
- Pendentes antes de publicar: repetir os fluxos acima em navegador responsivo
  e celular real (incluindo teclado virtual e orientação horizontal), testar
  abertura do WhatsApp sem enviar e revisar as respostas com o proprietário.
- Não houve teste de reprodução YouTube nesta etapa.

## IA futura e custos

Esta demonstração não precisa de serviço externo de IA e não tem cobrança
de API de IA. O WhatsApp é um link de continuidade, sem WhatsApp Business API.

Para linguagem natural, ainda falta escolher e conectar um provedor de IA
por um backend próprio, com credencial em segredo do servidor (nunca `VITE_*`
ou código público), base aprovada, limites de uso, proteção contra abuso e
política de retenção dos dados. Nenhum provedor ou modelo foi contratado.

O custo futuro não está orçado: depende do provedor/modelo, volume de entrada
e saída, hospedagem do backend e eventual serviço de atendimento. Antes de
contratar/ativar, apresentar tarifas oficiais atuais, estimativa mensal e
limite de gasto para aprovação. Não presumir crédito gratuito ou plano incluso.

## Ajuste restrito à digitação — 31/10/2026

O proprietário relatou recorrência de travamento durante digitação no Firefox.
Inspeção do código: não há bloqueio de letras ou foco forçado ao digitar;
a rolagem depende apenas do histórico. O campo controlado atualizava o estado
do componente inteiro por caractere. Isso é um ponto de interferência possível,
não uma causa do travamento Firefox comprovada por reprodução nesta etapa.

Alterado somente AssistenteTavares.tsx: texto/cursor passam a ser mantidos pelo
input nativo (ref, sem value controlado). onInput atualiza somente a transição
entre texto vazio e não vazio para habilitar Perguntar. Enviar lê o valor atual;
enviar/limpar esvaziam o campo nos mesmos momentos anteriores. Não há novo
listener de teclado, chamada de foco ou mudança no efeito/CSS da rolagem.
Base privada, respostas e fontes não foram editadas.

npm run verificar aprovado. No navegador integrado, as três frases solicitadas
foram digitadas sequencialmente; Backspace, Delete, Home, seleção total,
correções e continuidade mantiveram texto e foco. Envio por Enter funcionou;
a pergunta ficou a aproximadamente 20px do topo da área rolável. Limpar deixou
o campo vazio e Perguntar desabilitado. Firefox não foi controlado: confirmação
da resolução nesse navegador depende do teste manual do proprietário após
recarregar a página. Sem publicação.
