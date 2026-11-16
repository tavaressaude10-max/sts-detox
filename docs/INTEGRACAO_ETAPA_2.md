# Integração local — 16/11/2026

Branch exclusiva: `codex/integracao-assistente-loja`, criada em `15e639ec`.
Não houve push, alteração de domínio, migração ou implantação. Produção preservada.

## Fontes e escopo

- Visual, mídias, vitrine/Amazon, navegação, páginas e quinto vídeo: `15e639ec`.
- Backend original: `651fb2bc`, incorporado através da evolução `f904a0a` e das proteções locais posteriores, revisadas nesta etapa.
- Correções posteriores selecionadas: checkout fechado por configuração, retorno assinado, tratamento de assinatura do webhook, independência da prontidão F4, autenticação/proxy e quarentena, entrada compatível com carregamento por require.
- Frontend do Assistente e compra: `f904a0a`; nenhum texto curado do F4 foi reescrito.
- `server/`, `server.js` e `cron-email.js` mantêm as guardas locais. O servidor hospedável continua recusando comércio. Dev/preview legados, migração/importação e cron permanecem bloqueados.
- `tools/local-commerce/` contém uma cópia explicitamente isolada da lógica comercial corrigida de `f904a0a`, com produção e provedores externos recusados. Não é compilada em `.server-build`, nem importada pela entrada Hostinger. Não deve ser usada como backend de produção.

Esta etapa entrega integração visual e funcional local simulada. Não representa homologação comercial externa, nem libera o checkout hospedado.

## Executar localmente

Node 22 >=22.12, na raiz deste worktree:

```powershell
npm.cmd ci
npm.cmd run verificar
npm.cmd run test:integration
npm.cmd run test:guards
npm.cmd run local:integration
```

Abrir `http://127.0.0.1:4173`. O servidor usa somente loopback, rejeita outro Host/Origin e serve somente `build/`. O aviso de simulação aparece na compra. Fretes fixos PAC/SEDEX e pagamento aprovado são fictícios. Usar somente dados fictícios. Pedidos em memória desaparecem ao parar o processo; não há SMTP, MySQL ou chamadas a provedores.

Para consultar o F4 real, fornecer como argumento o caminho absoluto do snapshot privado **existente**:

```text
npm run local:integration -- CAMINHO_PRIVADO_DO_SNAPSHOT
```

Não copiar o snapshot para public, build ou Git. Sem esse argumento, as respostas públicas e o WhatsApp continuam disponíveis, mas o endpoint F4 fica indisponível. Para testar citações, definir `ASSISTANT_FIXTURE_FILE` somente no processo de teste; é um caminho local, não uma credencial. O teste não imprime conteúdo privado.

`test:commerce` aponta aos testes ativos da simulação e `test:server` às guardas. Suites históricas em tests/commerce e parte de tests/server permanecem como referência; não são aprovação de serviços hoje bloqueados.

## Hostinger: preparação futura, sem aplicar agora

1. Confirmar uma aplicação Node separada e domínio temporário, sem alterar `stsdetox.com.br`, seu vínculo Git ou a branch publicada. Não conectar auto-deploy nesta etapa.
2. Confirmar Node 22 >=22.12, raiz do pacote como cwd, instalação `npm ci`, build `npm run build:hostinger`, entrada `server.js`, início `npm start`. O build gera `build/` e `.server-build/`; publicar apenas `build/` não executa APIs. Manter devDependencies durante o build.
3. Runtime usa `HOST=0.0.0.0` e `PORT` fornecida pela hospedagem. Ele não carrega .env automaticamente.
4. Configuração inicial fechada: `STS_RUNTIME=homologacao`, `HOMOLOG_ACCESS_MODE=quarantine`, `HOMOLOG_SITE_ORIGIN` com o HTTPS temporário verificado. Quarentena responde 503 vazio e não inicializa banco/F4. Não interpretar 503 como falha que autorize remover guardas.
5. Antes de restricted, confirmar com Hostinger o proxy confiável, sanitização do protocolo, roteamento exclusivo ao Node e ausência de acesso estático/aliases que contornem autenticação. O código exige IPs exatos em `HOMOLOG_TRUSTED_PROXY_IPS`; não adivinhar nem confiar em headers enviados pelo visitante.
6. Para F4 restrito: `HOMOLOG_ADMIN_USER`, `HOMOLOG_ADMIN_VERIFIER` (scrypt), `HOMOLOG_MYSQL_HOST/PORT/DATABASE/USER/PASSWORD/TLS`, `HOMOLOG_DATA_KEY` e `HOMOLOG_F4_SHA256`. Inserir segredos somente no ambiente privado. O contrato atual fixa host 127.0.0.1, porta 3306 e banco de homologação dedicado; confirmar compatibilidade antes de configurar. Usuário F4 deve ter SELECT-only. Schema/snapshot previamente preparados exigem etapa separada autorizada; scripts de importação/migração continuam bloqueados.
7. Manter checkout e e-mail desativados. Não inserir credenciais de produção nem alterar `COMMERCE_PRODUCTION_DATA_KEY`. Não usar `VITE_` para segredos.
8. A loja real sandbox necessita outro ciclo: banco segregado com escrita, contratos de segurança e provedor de teste, webhook e retorno HTTPS, concorrência, falhas e backup/restauração. Não apontar o simulador local para a internet nem simplesmente remover `denyLegacyOperation`.

Não foi criado pacote de deploy automático. O futuro artefato deve excluir tools, tests, acervo, .env, logs e credenciais, e ter fontes/compilados identificados.

## Pendências

- MySQL real, grants, schema, importação privada, locks e restauração não testados.
- Proxy/autenticação e F4 no ambiente hospedado não homologados.
- Checkout Mercado Pago sandbox, SuperFrete, retorno/webhook e estados adversos não testados externamente nesta etapa.
- SMTP/cron, estoque, painel de pedidos, etiquetas e expedição não liberados.
- Auditoria npm e resultados locais registrados abaixo; não fazer correções forçadas de dependências.
- Testes HTTP/build não confirmam reprodução YouTube ou todos os vídeos em dispositivos reais.

## Reversão

Produção não mudou: não há reversão remota necessária. Encerrar o servidor local elimina somente os pedidos simulados em memória. O workspace original e as branches existentes permanecem preservados. Para abandonar a integração, conservar esta branch para revisão e retornar à cópia original; não usar reset/clean sobre o trabalho do cliente. Uma futura publicação exigirá guardar o artefato/commit implantado, backup do banco e chave já existente, testar restauração e definir reversão compatível com os dados. Não reverter chave nem apagar tabelas para voltar o frontend.

## Resultados desta execução

- npm ci: concluído (353 pacotes); primeira tentativa restrita falhou no npm, repetição limpa concluída.
- npm run verificar: aprovado, incluindo frontend e servidor. Avisos: plugin vite-tsconfig-paths e chunk JS acima de 500 kB.
- Testes de integração: seis casos, incluindo HTTP/sessão/CSRF, preservação visual/mídias, oito respostas privadas e lógica comercial simulada.
- Guardas: 12 testes aprovados. Primeira tentativa HTTP recebeu EACCES do sandbox; repetição com loopback permitida passou.
- Preservação: todos os arquivos públicos idênticos à base (textos com normalização CRLF); home, livros, vitrine/Amazon, cabeçalho, rodapé, playlists e WhatsApp comparados. Backend e entradas guardadas idênticos ao workspace original desta etapa.
- npm audit: sete alertas moderados na cadeia typescript-eslint/minimatch, zero altos/críticos. Nenhum audit fix executado.
- Navegador desktop: home, diálogo do Assistente com resposta/citação 114 PDF/110 impressa, e compra e250-p10 com PAC simulado, revisão e retorno aprovado de R$ 359. Nenhum provedor chamado.
- Limites: não testado em celular físico/viewport móvel; reprodução integral dos vídeos e YouTube não confirmada; sem MySQL real, SMTP ou pagamento externo.
- Inventário completo: [ARQUIVOS_ETAPA_2.md](ARQUIVOS_ETAPA_2.md).
