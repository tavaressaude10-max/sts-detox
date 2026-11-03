# Assistente Tavares F4 — integração privada local

31/10/2026. Sem publicação, push, serviço externo, IA ou cobrança.

## Revisão do OCR

Foi feita triagem visual de todas as 154 páginas da fila anterior. Cinco corpos
de texto da Enciclopédia (PDF 5, 7, 8, 9 e 10) foram conferidos integralmente
em imagens individuais e corrigidos. Os 149 restantes tiveram o OCR excluído
da recuperação: 55 capas/aberturas/editoriais, 84 diagramas/figuras e 10
fotografias/registros observacionais. Essa exclusão é uma decisão de adequação
para respostas, não uma afirmação de que todos os rótulos foram transcritos
e validados. Reaproveitar esses diagramas exigiria revisão específica.

Correções verificadas: palavras deformadas no título, mistura entre colunas
na página 8, ruído e rótulos laterais na página 9, associação de faixas de
capítulos e pergunta omitida na página 10. Os originais e o OCR bruto ficaram
intactos. Texto nativo das páginas mistas foi preservado separadamente.

O manifesto privado `ocr-review.json` registra uma decisão por página, escopo,
motivo e hashes das imagens e do OCR. A reconstrução do índice falha se esses
arquivos mudarem. `REVISAO_OCR_2026-10-31.md` é a versão legível desse relatório.
O índice passou de 1.720 para 1.552 trechos após exclusões/correções. O OCR
excluído não volta à busca nem pela opção administrativa `--include-ocr`.

## O que funciona agora

O chat local consulta `POST /api/assistente-local`. Um middleware Vite, somente
em desenvolvimento, executa um worker Python local, sem shell, com entrada
JSON. O worker lê o índice SQLite e registros de respostas em
`.private-assistant/`. Nenhum desses arquivos é importado pelo React.

O adaptador atual é deliberadamente finito: oito respostas curtas revisadas,
com algumas formulações equivalentes. Não é IA generativa nem uma busca
semântica aberta sobre os livros. Ele verifica a existência e o hash dos
trechos antes de entregar a paráfrase e a referência; não retorna trechos
brutos, IDs internos, caminhos, páginas inteiras ou links de download.

Perguntas para avaliação:

1. A cor da água indica toxinas? — BioEquilíbrio, PDF 114, impressa 110.
2. O DETOX Iônico substitui tratamento médico? — Iônico, PDF 4.
3. O DETOX PET é um protocolo veterinário? — PET, PDF 2, impressa 2.
4. O que a Enciclopédia explica sobre mitocôndrias e ATP? — PDF 77.
5. O que significa a farmácia do corpo humano? — Enciclopédia, PDF 5.
6. Quantos capítulos tem a Enciclopédia? — PDF 8.
7. Como estudar a Enciclopédia? — PDF 10.
8. Fale sobre o livro DETOX PET — PET, PDF 2.

As respostas são fixas, limitadas a 90 palavras e não certificam cientificamente
as obras. A revisão de fontes distingue hipóteses e relatos de comprovação.
Preços, condições e pedidos humanos mantêm precedência no fluxo existente;
não se chama o worker nesses casos. A continuidade comercial preserva o produto
da resposta anterior. Perguntas não cobertas usam FAQs públicas ou oferecem
atendimento humano. Falha/timeout não produz resposta inventada.

O diálogo nativo e o gerenciamento de foco do F3 foram preservados. A mudança
é assíncrona apenas ao enviar, sem efeito de consulta por letra. Há bloqueio
de envios concorrentes, timeout e cancelamento ao limpar; uma resposta antiga
não reaparece depois de limpar a conversa. Fechar/reabrir mantém o histórico.

## Execução

Manter Node 22 e dependências já instaladas pelo lockfile. Nenhuma dependência
npm foi acrescentada. O runtime Python usado nesta máquina está configurado
em `.private-assistant/runtime.json`; também pode ser definido pela variável
**do servidor** `ASSISTANT_PYTHON`. Usam-se apenas bibliotecas padrão no worker.

```powershell
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Abrir `http://127.0.0.1:5174/` ou `/livros`, atualizar e conferir **F4** no chat.
Em “Quatro livros” há perguntas de avaliação da base privada. O servidor local
anterior já recebeu esta configuração. Não executar dois processos na mesma
porta. No futuro, regenerar `response-records.json` somente após conferir as
fontes e os rascunhos; não atualizar hashes automaticamente para contornar uma
falha de integridade. Os scripts de preparação com textos estão na pasta privada.

## Proteções e limites

- Somente loopback, Host `127.0.0.1:5174` ou `localhost:5174`, origem coincidente,
  cabeçalho customizado e JSON; sem CORS permissivo.
- Pergunta até 400 caracteres, corpo até 4 KiB, 30 requisições/minuto no processo,
  até dois workers concorrentes, timeout do worker de oito segundos.
- Sem registro persistente das perguntas/conversa. Rate limit guarda somente
  contador e horário; os limites reiniciam com o processo.
- Arquivos privados, `server/`, `scripts/`, `.env` e chaves não são servidos pelo
  Vite. Builds excluem endpoint, marca F4, registros e respostas privadas.
- Sem API de páginas, continuações, busca bruta ou arquivos. O conjunto finito
  de paráfrases não permite reconstruir os livros por pedidos sucessivos.
- Isso é uma integração de avaliação local, não um backend pronto para internet.
  O controle por origem não é autenticação contra outros programas deste PC.

Para IA futura: implementar um serviço persistente autenticado, credencial em
segredo do servidor, política de dados, controle de orçamento e limites por
usuário/sessão/IP, revisão das fontes, validação de citações e proteção cumulativa
contra extração. Nenhum provedor foi conectado. Antes de enviar trechos a um
provedor externo ou ativar cobrança, apresentar o fluxo e custo para aprovação.
A estimativa anterior está em `BASE_PRIVADA_ASSISTENTE.md`; não é contratação.

## Verificações

- `npm run verificar`: TypeScript/build aprovados.
- Testes de FAQs e WhatsApp aprovados.
- Testes privados: 154 decisões e hashes, cinco OCR permitidos, 149 excluídos,
  oito respostas/variantes, entradas inválidas e fonte adulterada bloqueada.
- HTTP real: resposta com fonte; recusa de exportação; origem/cabeçalho/formato/
  tamanho protegidos; arquivos privados e servidor retornam 403.
- Build inspecionado: não contém endpoint local, respostas privadas, SQLite,
  JSONL, registros privados ou marca F4.
- Navegador compatível: Home/Livros, letra Q e pergunta completa, Enter/mouse,
  resposta dos quatro livros, fonte do OCR corrigido, Escape, fechar/reabrir,
  limpar durante consulta, produto preservado no resumo comercial e fallback
  “Trata saúde”. WhatsApp não foi aberto nem houve envio de mensagem.
- Layout 390×844 e desktop 1280×900 conferidos. Botões flutuantes separados;
  foco devolvido ao lançador; menu móvel aberto não bloqueou o chat.
- A validação Firefox anterior do proprietário se refere ao F3. F4 não foi
  controlado no Firefox externo nesta etapa. Celular físico/teclado virtual
  e abertura externa do WhatsApp continuam pendentes.

## Continuidade — ajustes de interface de 31/10/2026

Pedido retomado do chat interrompido, sem refazer a preparação da base F4.
A pergunta mais recente agora fica no início da área rolável, seguida do nome
do assistente e da resposta; a rolagem até o fim permanece apenas ao preparar
a mensagem revisável. A apresentação foi encurtada com os avisos preservados.
O botão “Quero falar com uma pessoa” aparece nas respostas com encaminhamento
(comercial, humano ou sem fundamento) e na aba Atendimento, sem chamada global
redundante após respostas fundamentadas. FAQs, fontes e base privada preservadas.

Proposta separada: `/proposta-eletrodos.html`, arquivo na raiz, sem integração
na navegação ou entrada no build. Mostra XLR/P10 em esquemas ilustrativos,
reserva foto para Mike e para os modelos de 100/200/250 sessões, destaca que
250 sessões é exclusivo do aparelho DETOX BioEquilíbrio e reserva três áreas
para vídeos. Fotos, variantes, compatibilidades restantes e vídeos precisam
ser confirmados antes de integrar a seção. O vídeo da home não foi alterado.

Validação: TypeScript/build, testes existentes de FAQs/WhatsApp e teste HTTP
da base privada aprovados. Conferidos no navegador Home e Livros, respostas
com livro/página, pergunta alinhada no início, ausência de chamada humana nas
respostas fundamentadas e mensagem comercial editável com produto preservado.
Conferência em viewport móvel 390×844 e desktop 1280×900; proposta conferida
visualmente. Não houve envio pelo WhatsApp, teste em celular físico ou nova
verificação de reprodução do YouTube. Sem push, publicação ou contratação.
