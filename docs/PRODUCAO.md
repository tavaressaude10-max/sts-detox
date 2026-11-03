# Produção — Node.js 22 e MySQL no Business

Preparação LOCAL em 01/11/2026. Sem deploy, push, contratação, cobrança ou e-mail real.
Este documento substitui a proposta anterior com Python, Docker e volume persistente.
A auditoria anterior permanece histórica; não foi refeita.

## Arquitetura

Navegador → Web App Node.js 22 da Hostinger → MySQL da Hostinger.
Node serve a SPA Vite em build e as APIs /api/loja/* e /api/assistente-local na mesma origem.
Entrada server.js; npm start; build npm run build:hostinger (frontend + .server-build).
Instalação npm ci; Node 22 >=22.12. O build necessita devDependencies para Vite/TypeScript.
O processo final executa JavaScript compilado, sem TypeScript runtime, Python ou Docker.
A configuração estática atual do painel não foi alterada e não executa este backend.
Não é necessário configurar proxy personalizado; usar HTTPS e PORT fornecidos pelo Web App.
No servidor, HOST=0.0.0.0. Não copiar HOST=127.0.0.1 do exemplo local para o Web App.

## Persistência e ambientes

COMMERCE_STORAGE=mysql é o padrão. Produção recusa file.
MySQL armazena cotações, pedidos, associação de pagamentos, outbox, fila/recibos de e-mail e snapshot F4.
Tabelas InnoDB sts_records/sts_locks, consultas parametrizadas, transações e locks entre processos.
Registros cifrados AES-256-GCM, com ambiente e identidade autenticados. Chaves dos registros são hashes.
Pedido/intenção é commitado antes da criação no Mercado Pago: timeout não perde a idempotência.
Inicialização verifica tabelas e marcador de schema cifrado; não cria tabelas automaticamente.
Sem banco pronto o servidor falha fechado. Deadlocks/timeouts não repetem POST automaticamente.
Não há dependência de arquivos mutáveis no ambiente público.

Usar bancos e usuários distintos para homologação e produção; o namespace interno é proteção adicional.
MYSQL_TEST_HOST/PORT/DATABASE/USER/PASSWORD/TLS e MYSQL_PRODUCTION_HOST/PORT/DATABASE/USER/PASSWORD/TLS.
Host local 127.0.0.1 permite conexão interna; host remoto exige TLS=true e certificado válido.
Usar o host efetivamente informado no painel. Pool limitado a cinco conexões por processo.
COMMERCE_DATA_KEY é de teste; COMMERCE_PRODUCTION_DATA_KEY é exclusiva de produção (32 bytes hex).
Guardar backup da chave separadamente: perdê-la impede recuperar pedidos e F4 cifrados.
Não trocar chaves de registros existentes. Preparar backups/restauração do MySQL antes de operação real.
Variáveis privadas jamais usam VITE_ nem entram no Git, bundle ou logs públicos.

## Preparação explícita do banco e F4 — ainda não executada externamente

npm run db:migrate e npm run f4:import sem argumentos são simulações, sem conexão.
Após autorização/configuração: db:migrate -- --apply e f4:import -- --apply.
Em produção ambos exigem também --confirm-production. Executar com ambiente privado correto e build pronto.
Migração cria somente tabelas ausentes/marcador, sem DROP/TRUNCATE/DELETE.
Importação exige MySQL, valida evidências e recusa substituir snapshot diferente existente.
Não roda automaticamente no build nem no startup. Usuário de runtime deve ter somente SELECT/INSERT/UPDATE;
CREATE é necessário apenas para a migração com usuário autorizado.

npm run f4:export é ferramenta exclusivamente local: lê SQLite original readOnly com Node,
valida hashes e gera .private-assistant-node/f4.json separado. O original não é apagado ou alterado.
São preservadas as oito respostas curadas, aliases, citações e dez trechos que as fundamentam.
O acervo completo e o índice original continuam preservados localmente; não são publicados.
O motor público mantém intenções exatas, limite de resposta, recusa ambiguidade, hashes e OCR revisado.
Não acrescenta busca livre, IA, exportação de páginas ou download dos livros.
Após importar o snapshot PRIVADAMENTE no banco, ASSISTANT_ENABLED=true ativa F4.
O snapshot não deve entrar em public/build/Git; só a ferramenta de importação precisa acessá-lo.
Python permanece somente nas ferramentas históricas locais de curadoria, sem dependência do servidor.

## Compras e integrações preservadas

SuperFrete usa sandbox em teste e endpoint de produção em produção, com tokens separados.
MERCADOPAGO_TEST_ACCESS_TOKEN/SELLER_ID/WEBHOOK_SECRET e SUPERFRETE_TEST_TOKEN para teste.
MERCADOPAGO_PRODUCTION_ACCESS_TOKEN/SELLER_ID/WEBHOOK_SECRET e SUPERFRETE_PRODUCTION_TOKEN para produção.
COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false mantém bloqueada a criação de cobranças reais.
COMMERCE_SITE_ORIGIN deve coincidir com a origem HTTPS de início/retorno da compra.
Retorno /compra?pedido=... não confirma pagamento: backend consulta e valida vendedor, ambiente,
moeda, valor e referência. Cookie HttpOnly/SameSite=Lax/Secure em produção.
Webhook futuro: https://stsdetox.com.br/api/loja/webhooks/mercadopago, evento order no ambiente correto.
HMAC/timestamp/ID e consulta remota permanecem obrigatórios. Nenhum webhook foi configurado nesta etapa.
Acompanhamento existente do pagamento e notificações foi preservado; não foi criado rastreamento logístico novo.

## Cron de e-mail

cron-email.js executa uma passagem finita, limite de 20 itens devidos e orçamento de 10 minutos,
com timeouts SMTP. Sem timer permanente no servidor e sem SMTP dentro do webhook.
Modo padrão é simulação: EMAIL_CRON_SEND=false, EMAIL_DELIVERY=disabled.
Envio só se modo production + EMAIL_CRON_SEND=true + EMAIL_DELIVERY=smtp + SMTP completo.
SMTP_HOST/PORT (465 ou 587)/USER/PASSWORD/FROM são privados; TLS obrigatório.
Fila, tentativas e recibos ficam no MySQL. Locks impedem processamento simultâneo normal do mesmo item.
SMTP não garante exatamente uma vez: queda após aceitação e antes do commit pode repetir mensagem.
Message-ID estável e recibos reduzem duplicação; validar remetente, SPF/DKIM e entrega posteriormente.
Cron não herda necessariamente as variáveis do Web App. Fornecer as mesmas variáveis e chaves por
mecanismo privado da hospedagem; nunca na URL ou em comando público. Não pressupor arquivo persistente.
Confirmar no painel o caminho do Node, diretório atual do deploy e forma de injetar o ambiente.
Só então preparar comando/agendamento. Nenhum cron, SMTP ou envio foi configurado/executado externamente.

## Validação e limites

Resultados desta etapa e inventário: BUSINESS_NODE_MYSQL.md.
Não há MySQL instalado/acessível localmente: testes de contrato do driver NÃO substituem integração InnoDB.
Pendentes: banco real, concorrência entre processos, persistência após novo deploy, backup/restauração,
Web App server-side, HTTPS/retorno/webhook sandbox, credenciais externas e cron/SMTP.
Não publicar até resolver e homologar; não é necessário contratar VPS com a capacidade confirmada pelo cliente.

Referências técnicas: [mysql2](https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper),
[locks InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html).
