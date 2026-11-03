# Conferência final local — 01/11/2026

Solicitação: últimos ajustes antes da aprovação final. **Não publicar.**
Esta etapa não fez commit, push, deploy ou alteração na Hostinger.

## Identidade oficial

- STS DETOX IÔNICO: empresa/marca institucional.
- DETOX BIOEQUILÍBRIO: aparelho/equipamento.
- DETOX IÔNICO: técnica/proposta de base.

Esta distinção substitui a orientação institucional anterior de usar
“STS DETOX BIOEQUILÍBRIO”. Cabeçalho, abertura, rodapé, metadados e identificação
do Assistente usam a empresa correta. Textos sobre o aparelho usam seu nome.
Mensagens preparadas para WhatsApp foram corrigidas por contexto; número,
destinos e funcionamento não mudaram. Nenhum identificador técnico foi renomeado.
As referências ao “Método STS BIOEQUILÍBRIO” no conteúdo dos livros foram
preservadas: descrevem o método da obra, não a identidade institucional.

## Blocos da home

`ConceitoBioequilibrio.tsx` reúne dois blocos com o texto fornecido pelo titular:

1. `/#conceito-bioequilibrio`: imediatamente após o vídeo de boas-vindas e antes
   de `/#equipamento`. Explica proposta, primeiros 30 minutos e continuidade até
   55 minutos. A redação não foi tratada como validação científica independente.
2. `/#trajetoria`: após a apresentação/conceito existente, antes dos eletrodos.
   Preserva a distinção entre experiências, pesquisas e eletroestimulação clínica.

O player da abertura permanece em 16:9, com o mesmo arquivo, controles e cantos.
Nenhuma área de representantes foi criada.

## Assistente e preservações

Respostas fixas de identidade antecedem a consulta F4, depois das regras
comerciais. Perguntas explicitamente sobre livros continuam com suas apresentações.
Pedidos de compra do “DETOX IÔNICO” continuam direcionados ao aparelho, com rótulo
DETOX BIOEQUILÍBRIO; a técnica não vira um segundo produto.

Material digital, ausência de venda separada, quatro livros para estudo
independente, WhatsApp oficial, eletrodos e resposta bivolt 110/220 V mantidos.
Catálogo, preços, conectores, Mercado Pago, SuperFrete, acervo/worker F4,
checkout, arquivos de vídeo e capas não foram modificados nesta etapa.

## Resultados

- `npm.cmd run verificar`: aprovado (TypeScript e build em `build`). Avisos de
  tamanho do bundle e plugin de paths, sem erro de build.
- `node scripts/test-assistant-commerce.mjs`: aprovado, incluindo 15 perguntas
  de identidade, regras comerciais, oito frases obrigatórias anteriores,
  material digital, livros, bivolt e roteamento F4.
- `npm.cmd run test:commerce`: 20/20 aprovados com loopback autorizado.
- `scripts/test-assistant-private.py`: aprovado; revisão OCR, oito respostas,
  evidências e bloqueio de exportação.
- `scripts/test-assistant-corpus.py`: aprovado; quatro recuperações de referência.
- `node scripts/test-assistant-local-http.mjs`: aprovado; fontes e proteções HTTP.
- `node scripts/test-assistant.mjs`: verificações de respostas, fallbacks, livros
  e WhatsApp passaram. **Permanece a falha preexistente de igualdade editorial
  das FAQs**, em `index` e `livros`. Informada ao titular antes de prosseguir;
  não foram igualadas as versões aprovadas nem removida a verificação.
- Navegador: desktop 1280×900 e celular 390×844; blocos novos, ordem, conteúdo,
  títulos institucionais, livros, compra e respostas de identidade/comerciais.
  Sem overflow horizontal observado. Os controles e a proporção do player
  permanecem presentes. Um aviso transitório de mídia na aba antiga desapareceu
  após recarregar; os quatro elementos de vídeo então não apresentavam erro.
- `git diff --check`: aprovado.

Não houve transação externa, envio de WhatsApp, nova homologação dos provedores,
teste em celular físico ou teste completo de reprodução dos nove vídeos/YouTube.
O servidor de conferência continua em http://127.0.0.1:5174/.
