# Compras de eletrodos — somente teste local

## Preparação da primeira compra simulada — 05/11/2026

Webhook externo confirmado às 14h19: assinatura válida, HTTP 200, evento Order,
modo teste e vendedor corretos. Esse recurso externo não tinha pedido local
associado: ainda não valida o ciclo completo de uma compra originada na loja.

Proprietário autorizou preparar/liberar exclusivamente checkout de teste, sem
criar pedidos nesta etapa. Credencial reconfirmada por GET /users/me: vendedor
test_user e ID correspondente; credenciais de produção ausentes. Leitura/escrita
do PrivateStore verificadas com marcador diagnóstico removido após conferência.
Esta execução usa arquivos cifrados em `.private-commerce`, não MySQL.
URLs de retorno de sucesso/pendência/falha apontam à mesma origem HTTPS do túnel;
GET /compra e /api/loja/session retornaram 200, sessão test e cookie Secure.
Retorno completo e registro via webhook aguardam a primeira compra simulada.

Processo diagnóstico reiniciado com `COMMERCE_MODE=test`,
`COMMERCE_CHECKOUT_DISABLED=false`, `COMMERCE_DIAGNOSTIC_TEST_CHECKOUT=true`,
`COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false` e origens HTTPS do túnel.
O script continua recusando produção; checkout permanece bloqueado por padrão
e só é liberado pela opção explícita acima junto da configuração normal.
Credenciais e arquivo `.env.commerce.local` não alterados.
Log: `%LOCALAPPDATA%/Temp/sts-detox-tunnel/webhook-diagnostic-20261105-142429.log`.
Nenhum POST de criação de order, pedido, pagamento ou e-mail enviado nesta etapa.

## Diagnóstico temporário do webhook — 05/11/2026

Reteste às 14h04 (Brasília): HTTP 401/signature_mismatch em 16 ms. Rota POST,
evento Order, modo teste, vendedor, ID esperado, query e corpo correspondem;
sem headers duplicados ou espaços externos em request-id. HMAC do manifesto
normalizado como no SDK e alternativas de capitalização não coincidem.
Comparação isolada com o código oficial do SDK: oito cenários fictícios
concordaram com o validador local. Sonda exclusivamente em loopback usando corpo
deliberadamente inválido: assinatura válida, seguida de 400/test_guard antes
de qualquer consulta/processamento de pedido. Nenhuma sonda assinada com segredo
real foi enviada ao túnel público.
Inspeção booleana do segredo local identificou espaços internos e padrão de
texto de instrução de preenchimento; valor não exibido nem alterado. É necessário
conferir a cópia do valor puro no painel antes de nova simulação. Não se concluiu
que a origem da divergência é falha no algoritmo. Nenhum pagamento ou publicação.

Reteste às 13h57 (Brasília): POST chegou à rota correta; HTTP 401 em 11 ms,
`signature_mismatch`, mesmo após preservar a capitalização. Essa correção não
comprovou a causa da divergência real. Diagnóstico ampliado: compara HMAC do
manifesto do SDK, variações de capitalização apenas para observação, presença
única de headers/query, correspondência do ID esperado/corpo/query, modo do
payload e vendedor. Somente booleanos são registrados; corpo é limitado a 24 KB,
usado em memória e descartado, nunca gravado. Nenhuma alternativa diagnóstica
é aceita pelo handler. Startup confere por booleano se o segredo carregado
corresponde ao arquivo. Teste HTTP isolado com fixtures confirmou 200/401,
preservação do processamento e ausência de segredos/IDs no log. Build aprovado.
Aguarda nova simulação externa para observar esses indicadores adicionais.

Continuidade: duas simulações chegaram à rota POST correta e retornaram 401,
`signature_mismatch`. Segredo preenchido, sem espaços externos, modo test.
Comparação com o SDK Node oficial revelou que o código local convertia `data.id`
para minúsculas no manifesto HMAC, enquanto o SDK preserva a capitalização.
Falha reproduzida com segredo fictício e ID de teste em maiúsculas. Corrigido
localmente para assinar `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` com
o ID recebido na query. ID do corpo é conferido depois da autenticação, não
substitui o identificador da query na assinatura. Segredo não alterado;
HMAC-SHA256, comparação em tempo constante, prazo e bloqueios de ambiente mantidos.
Testes cobrem maiúsculas/minúsculas e rejeição de ID/request-id adulterados.
30 testes de compras e `npm run verificar` aprovados. Aguarda nova simulação
externa para confirmar se essa diferença explica a assinatura recebida.
Referência: https://github.com/mercadopago/sdk-nodejs/blob/master/src/utils/webhook/index.ts
e teste oficial `uppercase dataId is preserved in HMAC` em `webhook.spec.ts`.

`scripts/diagnose-webhook.mjs` inicia a mesma API na porta 8788, exclusivamente
em teste e com checkout desativado por padrão (liberação explícita documentada acima). Observa no máximo 200 requisições às rotas
de webhook, sem mudar as validações ou o processamento. Registra somente hora,
contador local, método POST/OTHER, correspondência da rota, resultado categórico
da validação de assinatura, status HTTP e duração. Não registra URL/query, IDs
externos, assinatura, segredo, headers, corpo, dados pessoais ou resposta remota.
Saída desta execução: `%LOCALAPPDATA%/Temp/sts-detox-tunnel/webhook-diagnostic-20261105-134822.log`.
O processo recebeu a mesma origem HTTPS temporária documentada abaixo e relê
o segredo do arquivo privado. Para desativar o diagnóstico, encerrar esse processo
e iniciar a entrada normal `server/commerce/main.ts` com o ambiente adequado;
não perder as substituições temporárias de origem/teste/bloqueio de checkout.

Validação: sete cenários em memória (assinatura válida, divergente, ID ausente,
ID de outro ambiente, request-id ausente, formato inválido e timestamp expirado),
ausência de credenciais nos registros e recusa de produção. Sem chamadas HTTP
nesses cenários. `npm run verificar` e 30 testes de compras aprovados. Sessão
HTTPS retornou 200/test após reinício. Sem mudanças visuais, ordens externas,
pagamentos, envio de simulação, publicação ou alterações em produção.
A causa da simulação anterior não pode ser recuperada dos logs existentes;
aguarda-se nova simulação pelo proprietário para registrar o motivo exato.

## Túnel HTTPS temporário — 05/11/2026

Prévia de homologação ativa nesta execução:
`https://uncertainty-rack-conducted-locations.trycloudflare.com/compra`.
Webhook a cadastrar posteriormente pelo responsável, somente em teste:
`https://uncertainty-rack-conducted-locations.trycloudflare.com/api/loja/webhooks/mercadopago`.
Nenhuma configuração do Mercado Pago foi alterada ou notificação enviada.

Cloudflared portátil oficial 2026.10.7, SHA-256 conferido com o release oficial,
em `%TEMP%/sts-detox-tunnel/cloudflared.exe`; sem serviço Windows instalado.
Túnel aponta para 127.0.0.1:5174; proxy existente encaminha `/api/loja` à porta 8788.
Vite aceita somente o novo hostname adicional através da variável de processo
`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`. Não liberar todos os hosts.
API iniciada com variáveis de processo: `COMMERCE_MODE=test`,
`COMMERCE_SITE_ORIGIN` e `MERCADOPAGO_TEST_RETURN_ORIGIN` iguais à origem HTTPS,
`COMMERCE_CHECKOUT_DISABLED=true` e `COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false`.
Arquivo `.env.commerce.local` e credenciais preservados. As substituições acima
valem apenas para os processos iniciados; um reinício comum não as mantém.
Criar pagamentos permanece bloqueado nesta preparação.

Vite passou a bloquear também `.codex`, `.hostinger`, ZIPs e logs pela regra fs.deny.
`npm run verificar` aprovado. GET HTTPS `/compra`: 200 e formulário renderizado
com aviso de teste; GET `/api/loja/session`: 200, mode=test e cookie Secure.
Bloqueios de `.env.commerce.local`, backup ZIP existente e código do servidor
verificados exclusivamente com HEAD em loopback: 403, sem ler conteúdo.
Caminhos inexistentes podem receber HTML da SPA; isso não comprova exposição.

Manter computador ligado, conectado, sem suspensão, e Vite/API/cloudflared ativos.
Ao encerrar o túnel, a URL temporária deixa de funcionar; um novo túnel gera outro
endereço, que exige alinhar origem, retorno, hostname permitido e webhook de teste.
Começar a compra pelo HTTPS durante a homologação: a origem HTTP local não
corresponde à origem autorizada da API nesta execução.
Sem pedidos, pagamentos, deploy, push ou alteração no site oficial.

## Alteração de CEP no endereço — 05/11/2026

Na etapa “Endereço de entrega”, o botão “Alterar CEP e recalcular frete”
descarta a cotação e modalidade anteriores, retorna ao cálculo e focaliza o CEP.
Só é possível avançar após nova cotação e seleção de entrega. Ao editar o CEP,
o endereço anterior é limpo; ao continuar, a consulta preenche o novo endereço.
Nome, CPF/CNPJ, telefone e e-mail permanecem durante a navegação entre etapas.
Número/complemento precisam ser preenchidos novamente quando o CEP muda.
O botão “Alterar produtos ou frete” foi preservado; trocar apenas a modalidade
mantém o endereço e os dados pessoais. Alterar itens ou CEP invalida a cotação.

Validação local no navegador integrado, com SuperFrete sandbox e ViaCEP reais:
uma unidade `e250-p10`, R$ 339,00; CEP 15375-126 / PAC R$ 70,64, total R$ 409,64;
troca para 58417-065 / SEDEX R$ 24,28, total R$ 363,28; retorno pelo botão
existente e troca para PAC R$ 18,91, total R$ 357,91. Confirmados os novos
logradouro/cidade/UF, limpeza de número/complemento, preservação dos quatro
dados pessoais e bloqueio de continuação até selecionar a nova modalidade.
Revisão e retorno aos dados testados sem acionar pagamento. Conferência visual
desktop realizada; Firefox não automatizado nesta etapa.
`npm.cmd run verificar` aprovado e `npm.cmd run test:commerce`: 30/30 aprovados.
Sem mudanças em produtos/preços, pagamento, Assistente ou outras seções;
sem pedidos externos, commit, push ou publicação.

Complemento local de 01/11/2026: acesso discreto ao mesmo Assistente Tavares
e respostas comerciais isoladas do F4. Sem mudanças no fluxo de compra ou
integrações. Consulte [ASSISTENTE_COMPRAS.md](ASSISTENTE_COMPRAS.md).

Continuidade em 01/11/2026 do chat interrompido em 31/10. Nada publicado.
O site existente, F4 e seu acervo privado foram preservados. A loja usa um
processo Node separado; não utiliza o middleware nem o índice do Assistente.

## Executar

Use Node 22 >=22.12, `npm.cmd ci` e `npm.cmd run commerce:setup`.
O setup cria `.env.commerce.local` com chave de criptografia aleatória e nunca
sobrescreve um arquivo existente. Preencha as credenciais **nesse arquivo local**,
nunca no chat, no código ou em variáveis com prefixo `VITE_`.

Em dois terminais na raiz:

```powershell
npm.cmd run commerce:dev
```

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Abra http://127.0.0.1:5174/compra. Use exatamente esse host: `localhost` é outra
origem para cookies e proteção CSRF. API em 127.0.0.1:8788, proxy `/api/loja`.
Encerre ambos com Ctrl+C. Sem tokens, a falha de cotação mostra atendimento
humano; nenhum frete fictício é apresentado pelo serviço normal.

## Configuração privada pendente

- `COMMERCE_MODE=test`: produção é recusada.
- `COMMERCE_DATA_KEY`: chave gerada pelo setup; não substituir se quiser manter
  acesso aos registros locais existentes.
- `MERCADOPAGO_ACCESS_TOKEN`: credencial do vendedor de teste.
- `MERCADOPAGO_TEST_SELLER_ID`: ID desse vendedor. O servidor confere a tag
  `test_user` antes de criar uma order e só aceita IDs `ORDTST`.
- `SUPERFRETE_TOKEN`: token sandbox. Origem 58315-000; somente PAC e SEDEX.
- `MERCADOPAGO_TEST_RETURN_ORIGIN`: origem HTTPS de teste. Para um ensaio externo,
  a compra precisa começar nessa mesma origem e `COMMERCE_SITE_ORIGIN` deve
  corresponder a ela; retornar de HTTPS para uma sessão criada em loopback perde
  o cookie. Nenhum túnel foi aberto ou publicação realizada.
- `MERCADOPAGO_WEBHOOK_SECRET`: segredo da notificação de teste. Endpoint
  `/api/loja/webhooks/mercadopago`; precisa ser acessível por HTTPS para entrega
  externa. Sem webhook, o retorno consulta o status no servidor.

Não considerar a integração homologada antes de testar com os provedores:
cotação real sandbox, retorno HTTPS com sessão, assinatura de webhook, estados
de pagamento, Pix e condições de parcelamento efetivamente exibidas. A API Orders recusou installments_cost. Validar no painel e no checkout se as condições de juros correspondem às anunciadas antes de liberar vendas.

## Funcionamento e limites

Nove SKUs mantêm os preços 198/298/339 reais e conectores existentes. Produtos,
quantidades, frete e total são conferidos no servidor. Até oito unidades usam as
três regras de embalagem solicitadas; nove ou mais seguem para atendimento humano.
Dados pessoais só aparecem após escolher frete e continuar. CEP pode preencher
endereço; falha permite preenchimento manual. Trocar CEP limpa o endereço anterior.
Revisão antecede o redirecionamento ao Checkout Pro via Orders API.

Pedidos, cotações e notificações ficam cifrados em `.private-commerce`, ignorada
pelo Git e bloqueada pelo Vite. Uma instância local por diretório. Não há painel,
armazenamento de cartão, compra de etiquetas ou automação de WhatsApp.
Após aprovação conferida no servidor, duas mensagens são preparadas na outbox:
comprador e saudeq@hotmail.com. **Preparadas não significa enviadas**: o provedor
de e-mail ainda não está configurado. Rastreamento permanece manual.

O build `build/` continua sendo frontend estático. Não contém o serviço Node nem
os dados privados. Uma futura publicação de compras exigirá planejar backend,
persistência e HTTPS; enviar apenas o build não disponibiliza a API.

Referências oficiais consultadas:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/create-order
- https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro/create-order/post

## Conferência das 16 alterações registradas pelo Codex

O histórico da etapa interrompida registra estes 16 arquivos em patches:

1. `server/commerce/domain.ts`: validação e embalagens.
2. `src/lib/shop-catalog.ts`: nove SKUs, preços e tipos.
3. `server/commerce/providers.ts`: adaptadores externos em teste.
4. `server/commerce/store.ts`: persistência privada cifrada.
5. `server/commerce/service.ts`: cotações, pedidos e confirmação.
6. `.env.example`: variáveis, sem credenciais.
7. `.gitignore`: exclusão dos dados privados da loja.
8. `scripts/setup-commerce.mjs`: preparação local sem sobrescrita.
9. `server/commerce/http.ts`: sessão, CSRF e webhook assinado.
10. `server/commerce/main.ts`: API em loopback.
11. `tsconfig.commerce.json`: checagem do servidor e testes.
12. `vite.hostinger.config.ts`: proxy local e bloqueio dos arquivos privados.
13. `src/components/CompraEletrodos.tsx`: etapas e retorno de pagamento.
14. `src/lib/shop-api.ts`: comunicação do navegador.
15. `src/routes/compra.tsx`: rota de teste sem indexação.
16. `tests/commerce/commerce.test.ts`: testes de domínio, serviço e HTTP.

Também estavam presentes os ajustes feitos por comandos em `package.json`,
`src/routeTree.gen.ts` e `src/components/EletrodosConexoes.tsx`. Conferidos e
preservados. Não confundir essa lista com todas as alterações acumuladas no Git.

Backup antes desta continuidade: `backup-continuacao-local-20261101.zip`,
ignorado pelo Git, com fontes/configuração/documentação e sem credenciais ou acervo.

Nesta continuidade, o componente de compra recebeu somente duas correções:
limpar endereço ao mudar CEP e retornar à cotação quando uma tentativa existente
conflitar com dados corrigidos. Documentação operacional acrescentada e teste
de regressão para correção de dados após tentativa persistida.

## Validação de 01/11/2026

- Node 22.23.4; `npm.cmd ci` concluído, lockfile inalterado.
- `npm.cmd run verificar`: TypeScript do frontend/servidor/testes e build aprovados.
- `npm.cmd run test:commerce`: 20/20 aprovados, incluindo HTTP em loopback.
  A primeira execução sob isolamento impediu fetch local; a execução autorizada
  com loopback passou. Nenhum teste chama os provedores de pagamento/frete reais.
- Navegador: desktop e viewport 390×844; home, Livros, menu móvel, nove links
  de compra e seleção do modelo 250 sessões conferidos. Sem overflow horizontal
  observado no checkout móvel. Dados pessoais ausentes na etapa inicial.
- Fluxo com simulador descartável local: dois eletrodos de 200 sessões, SEDEX,
  subtotal R$ 596,00 + R$ 35,00 = R$ 631,00; endereço preenchido, dados, revisão,
  botão de pagamento condicionado à conferência e mensagem de falha testados.
  Troca de CEP com falha na consulta limpou o endereço anterior corretamente.
  Nove unidades exibiram atendimento humano. Simulador encerrado ao concluir.
- Serviço normal sem tokens: mensagem de falha do frete e link WhatsApp corretos.
- HTTP 200 para `/`, `/livros`, `/compra`, nove MP4 e dois PNG de eletrodos.
  HTTP 403 para `.env.commerce.local`, arquivos de servidor/scripts, arquivo
  privado existente do F4 e marcador privado da loja (também com `?raw`).
  Caminhos privados inexistentes podem retornar HTML da SPA; isso não entrega dados.
- Comparação SHA-256 de 16 arquivos de código/scripts do F4: zero alterações.
  Acervo não editado, reindexado nem consultado pelo assistente nesta etapa.
- `git diff --check` aprovado; nenhum commit, push, deploy ou mudança na Hostinger.
- Auditoria: 14 alertas moderados na cadeia ESLint/minimatch, zero altos/críticos;
  relatório em `AUDITORIA-NPM-2026-11-01.json`. Sem atualização de dependências.

Limites: não houve compra sandbox nos provedores (tokens e retorno HTTPS vazios),
entrega real de webhook/e-mail, teste em celular físico nem reconfirmação de
reprodução dos nove vídeos/YouTube. HTTP e build não comprovam reprodução.
As pendências editoriais de vídeos em `REVISAO_LOCAL_2026-10-31.md` continuam
dependendo da identificação das mídias pelo proprietário; não integram esta
etapa de compras e não foram preenchidas com vídeos presumidos.

### Compra simulada de 05/11/2026 — confirmação
Consulta autenticada confirmou a única order de R$ 357,91 como processed/accredited, vendedor de teste e valor integral pago. Pedido local reconciliado para approved, sem novo POST de pagamento; notificações apenas preparadas, sem envio. Webhook chegou duas vezes às 18:14Z e retornou 401: diagnóstico comprovou HMAC válido com ID em minúsculas, enquanto o simulador anterior preservava capitalização. Validador aceita os dois manifestos para o mesmo ID canônico, mantendo segredo, request-id, prazo, ambiente e consulta autenticada. Retorno em outra sessão permanece protegido (404); tela agora orienta abrir a URL na janela original da compra. A troca para janela privativa não transfere o cookie da loja. Testes commerce: 30 aprovados. Nenhuma credencial alterada e nenhuma publicação.
