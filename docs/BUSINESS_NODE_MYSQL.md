# Etapa local — Business Node.js 22 + MySQL

Data: 01/11/2026. Implementação local concluída no escopo independente de serviços externos.
Não houve deploy, push, contratação, cobrança, envio de e-mail ou inserção de credenciais reais.
Sem VPS. A mudança no painel ainda não foi realizada.

## Backup e preservação

Backup anterior às alterações: backup-business-node-mysql-20261101-195523.zip, na raiz local.
581 arquivos, 320.892.621 bytes. SHA-256:
8c44c685349fb6af52dcd56e1ab8cc53f218b7c6e73dfdf557ca5fbca196967b
Contém manifesto SHA-256 por arquivo e a base original; guardar privadamente, não publicar o ZIP.
Conferência após implementação: 389 arquivos originais de .private-assistant intactos.
Todos os arquivos src/ e public/ existentes no backup permanecem idênticos, incluindo textos e mídias.
As alterações anteriores do cliente permanecem no workspace e não foram revertidas.
Snapshot Node separado .private-assistant-node/f4.json, ignorado pelo Git, oito respostas/dez evidências.

## Implementado

- Entrada server.js e build de servidor JavaScript em .server-build; frontend continua em build.
- APIs e site na mesma origem, aproveitando os handlers e regras existentes.
- F4 em Node: intenções exatas, respostas/citações preservadas, validação de hashes e OCR revisado.
- MySQL com registros cifrados, namespace por ambiente, transações e locks InnoDB.
- Checkout confirma a persistência da intenção antes de chamar o provedor externo.
- Migração explícita e importação privada do F4, ambas em simulação por padrão.
- cron-email.js finito, envio desativado por padrão, fila e recibos persistidos no banco.
- Credenciais MySQL/teste/produção separadas. Produção recusa armazenamento file.
- Dockerfile e .dockerignore da proposta anterior removidos; recuperáveis no backup.
- Python histórico de curadoria preservado localmente, sem chamada no runtime de produção.

## Verificações aprovadas

- npm ci concluído com package-lock.json atualizado.
- npm run verificar: TypeScript do site/API e builds frontend/backend aprovados.
- npm run test:commerce: 28/28, incluindo recuperação da intenção após rollback/timeout externo.
- npm run test:server: 7/7 (HTTP, F4, cifra, configuração MySQL, contrato transacional e cron).
- node scripts/test-assistant.mjs: 16 FAQs, 10 fallbacks e quatro livros aprovados.
- node scripts/test-assistant-commerce.mjs: 81 variantes comerciais, 54 perguntas de conhecimento/material aprovadas.
- node scripts/test-assistant-local-http.mjs: F4 Node via Vite, fonte, recusas e bloqueios aprovados.
- Exportação Node do F4 validou originais; db:migrate/f4:import em simulação concluídos, sem DB.
- cron-email.js local terminou com dryRun=true e sent=0.
- Preview real node server.js no loopback: Home, Livros e Compra renderizaram; formulário e catálogo carregaram.
- npm audit executado: 14 moderadas na cadeia de desenvolvimento ESLint/minimatch, zero altas/críticas.
  Resultado em AUDITORIA-NPM-BUSINESS.json. Nenhuma correção forçada de dependências.

A primeira execução HTTP no sandbox falhou por restrição de loopback; repetição com permissão local passou.
Testes de pagamentos/frete/e-mail usam provedores simulados; não executam operações externas.
Build ainda informa chunk acima de 500 kB e aviso de vite-tsconfig-paths; sem falha de compilação.
Não foi reavaliada reprodução de YouTube: esta etapa não alterou vídeos nem playlists.

## Limitações e pendências

Não existe MySQL local disponível neste ambiente. O teste do adaptador usa contrato simulado de mysql2;
não comprova SQL/locks/rollback na engine real nem comportamento da hospedagem.
Antes de publicar, validar schema, importação, leitura/gravação, concorrência Web App/cron,
reinício/novo deploy, restauração de backup e recuperação de falhas com MySQL real.
Não importar pedidos locais de teste em produção. Não perder/trocar a chave de dados cifrados.
SMTP pode repetir mensagem após queda entre aceitação e commit; não promete exatamente uma vez.

Faltam no painel/serviços: bancos e usuários separados, variáveis privadas/chaves, aplicação server-side
Node 22 com entrada server.js, cron e seu ambiente privado, tokens SuperFrete/Mercado Pago separados,
retorno/webhook HTTPS, provedor/remetente SMTP e homologação externa sem cobrança real.
Essas configurações NÃO foram feitas. Orientações técnicas futuras em PRODUCAO.md.

## Próxima ação do proprietário — somente o primeiro passo

No hPanel: Sites → stsdetox.com.br → Painel/Gerenciar → Bancos de dados → Gerenciamento.
Crie primeiro um banco MySQL exclusivo de homologação (sugestão de sufixo: sts_homologacao),
com usuário próprio e senha forte; guarde os dados privadamente. Não reutilize banco existente,
não mude o Web App, não habilite acesso remoto e não faça deploy nesta etapa.
Depois informe apenas que o banco foi criado, sem enviar senha pelo chat.
Referência: [criar MySQL na Hostinger](https://www.hostinger.com/support/1583542-how-to-create-a-new-mysql-database-in-hostinger/).
O banco de produção e os demais passos serão tratados separadamente.

## Inventário desta etapa (comparado ao backup, não ao Git antigo)

### Alterados
- .env.example
- .gitignore
- docs/CONTEXTO.md
- docs/GITHUB_HOSTINGER.md
- docs/PRODUCAO.md
- docs/SEGURANCA.md
- package-lock.json
- package.json
- README.md
- server/assistant-http.ts
- server/assistant-local-plugin.ts
- server/commerce/email.ts
- server/commerce/providers.ts
- server/commerce/service.ts
- server/main.ts
- tests/commerce/commerce.test.ts
- tests/commerce/production.test.ts
- tests/server/app.test.ts
- vite.hostinger.config.ts

### Criados
- server/assistant-core.ts
- server/assistant-file.ts
- server/bootstrap.ts
- server/email-job.ts
- server/storage/crypto.ts
- server/storage/mysql.ts
- server/storage/types.ts
- scripts/db-migrate.mjs
- scripts/export-f4-node.mjs
- scripts/import-f4-mysql.mjs
- tests/server/node-mysql.test.ts
- docs/AUDITORIA-NPM-BUSINESS.json
- server.js
- cron-email.js
- tsconfig.server.json
- docs/BUSINESS-ALTERACOES.json
- docs/BUSINESS_NODE_MYSQL.md

### Removidos da proposta anterior
- .dockerignore
- Dockerfile

Artefatos locais ignorados: backup ZIP, snapshot privado F4, build e .server-build.
Inventário estruturado: BUSINESS-ALTERACOES.json.

## Recomendação

APROVADO: preparação e verificações locais descritas acima.
PENDÊNCIAS: MySQL real, configuração externa e homologação pública controlada.
RECOMENDAÇÃO FINAL: NÃO PUBLICAR AINDA.

## Continuidade — banco de homologação criado

O proprietário confirmou a criação de banco MySQL exclusivo de homologação, com usuário próprio, associado a stsdetox.com.br. Senha mantida privadamente; não recebida nem inserida pelo agente. Esta confirmação não equivale a teste de conexão ou execução de migração.
Próximo passo: proprietário consultar o estado do Acesso SSH no painel, sem ativar/modificar serviços nesta etapa, para definir execução isolada da migração sem deploy. Nenhuma configuração externa foi realizada. Proibições de publicação, deploy, push, compras/cobranças e e-mails reais permanecem vigentes.
