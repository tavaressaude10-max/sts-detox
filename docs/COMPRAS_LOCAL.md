# Compras de eletrodos — somente teste local

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
