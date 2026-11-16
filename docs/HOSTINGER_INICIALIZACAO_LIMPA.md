# Inicialização limpa — 16/11/2026

Base: integração `9a9f181`. Branch local: `codex/hostinger-inicializacao-limpa`.
Nenhum push, deploy, alteração no hPanel, domínio ou banco nesta missão.

## Decisão

Manter `server.js`. É uma entrada pequena, sem top-level await, que importa o
backend compilado dentro de uma função assíncrona. Trocar para app.js/index.js
ou adicionar Express não resolveria o 503 intencional da política de quarentena.
Os testes desta missão confirmam execução direta e via require() no Node 22.23.4.
Isso não é comprovação do launcher remoto da conta.

O pacote antigo de quarentena não é uma entrega funcional completa. A solução
recomendada é uma aplicação Node separada, construída a partir do Git completo,
com frontend e backend da mesma revisão. Não reutilizar sts-quarantine-missao7.zip
nem trocar arquivos dentro dele. Não publicar apenas build/ como Vite estático.

## Correções realizadas

- server.js resolve build/ em relação à sua própria localização. O frontend
  não depende mais do diretório em que o supervisor iniciou o processo.
- Mensagens de log fixas distinguem configuração, importação, listener,
  quarentena, frontend ausente e F4 indisponível. Nunca mostram exceção bruta,
  ambiente, senha, chave, caminho privado ou conteúdo dos livros.
- `npm run hosting:check` verifica offline entrada, backend compilado,
  dependências e assets referenciados no HTML. Não conecta MySQL nem abre porta.
- `npm run build:hostinger` compila e executa essa checagem. Arquivos ausentes
  fazem o build falhar antes de se tentar iniciar uma entrega incompleta.
- Política de acesso, respostas, backend comercial, MySQL, chaves, cron e
  scripts de migração/importação mantidos; nenhum bloqueio foi removido.

## Estado de prontidão

**Pronto localmente para testar inicialização/pacote. Não pronto para homologação
funcional completa do Assistente e da loja na Hostinger.**

Os dois impedimentos funcionais não são corrigidos por renomear a entrada:

1. O modo restricted exige proxy autenticável, HTTPS e rota exclusiva ao Node.
   Falta confirmação do peer estável e da sanitização dos headers no plano.
   Não preencher IP por suposição nem retirar a autenticação. Obter essa
   informação uma única vez do suporte; se a plataforma não oferece a garantia,
   este runtime restricted não deve ser implantado ali. Um servidor separado
   com proxy e isolamento administráveis é alternativa, mas requer planejamento
   e autorização próprios, sem contratação nesta missão.
2. O runtime hospedável é F4-only: comércio está explicitamente bloqueado.
   A loja integrada funciona localmente com simuladores. Para comércio sandbox
   hospedado ainda é necessário um runtime autorizado com escrita em banco de
   teste e validação dos provedores/webhook. Nenhuma variável sozinha libera isso.

Não recomendar outra implantação de quarantine como solução funcional. Ela só
serve, se solicitado, para conferir que o processo inicia com acesso fechado.

## Configuração da futura aplicação separada

Somente após autorização de implantação e envio desta branch ao GitHub:

| Campo | Configuração |
|---|---|
| Aplicação | Nova Web App Node.js, independente do site público e do ZIP antigo |
| Domínio | Domínio temporário exclusivo atribuído a essa nova aplicação |
| Repositório | tavaressaude10-max/sts-detox |
| Branch desta preparação | codex/hostinger-inicializacao-limpa — ainda somente local |
| Framework | Other/custom Node.js (backend); não publicação estática Vite |
| Node | 22.x, no mínimo 22.12 |
| Gerenciador | npm |
| Raiz do projeto | . (raiz do repositório) |
| Instalação | npm ci --include=dev |
| Comando de build | npm run build:hostinger |
| Se o painel pedir nome do script | build:hostinger |
| Arquivo de entrada | server.js, na raiz |
| Comando de início, se houver campo | npm start |
| Artefatos necessários | server.js, package.json/lock, build/, .server-build/ e dependências runtime |
| Output directory, se exigido pelo modo custom | . (raiz completa da aplicação); build é apenas a saída do frontend |
| HOST | 0.0.0.0 |
| PORT | Usar a variável injetada pela Hostinger; não fixar outra porta no painel |
| Auto-deploy | Não habilitar nesta preparação |

A nomenclatura dos campos depende do painel. Se o preset aceitar somente uma
pasta pública estática, ele não corresponde à aplicação Node necessária: não
tentar compensar apontando a raiz com segredos para um servidor estático.
Confirmar que todo acesso HTTP passa pelo Node antes de adicionar dados privados.

## Variáveis por modo

Para um teste técnico **fechado**, sem banco ou credenciais, caso autorizado:

```text
NODE_ENV=production
STS_RUNTIME=homologacao
HOMOLOG_ACCESS_MODE=quarantine
HOMOLOG_SITE_ORIGIN=https://DOMINIO-TEMPORARIO-REAL
HOST=0.0.0.0
COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false
EMAIL_CRON_SEND=false
EMAIL_DELIVERY=disabled
```

NODE_ENV=production não é COMMERCE_MODE=production; não configurar este último.
O placeholder de domínio precisa ser substituído pelo domínio da nova aplicação.
Não inserir chaves comerciais, SMTP ou dados de produção nesse teste.
Resultado correto: log STS_QUARANTINE e HTTP 503 vazio/no-store. Isso comprova
apenas inicialização/bloqueio, nunca funcionalidade do Assistente.

Para **restricted**, somente depois de resolver o ingresso e preparar o banco:

- `HOMOLOG_ACCESS_MODE=restricted`;
- mesma origem temporária em `HOMOLOG_SITE_ORIGIN`;
- `HOMOLOG_TRUSTED_PROXY_IPS`: IPs exatos comprovados pelo provedor; não há valor
  conhecido seguro para fornecer nesta missão;
- `HOMOLOG_ADMIN_USER` e `HOMOLOG_ADMIN_VERIFIER` (`scrypt:salt32hex:hash64hex`),
  fornecidos privadamente;
- `HOMOLOG_MYSQL_HOST=127.0.0.1`, `HOMOLOG_MYSQL_PORT=3306`,
  `HOMOLOG_MYSQL_DATABASE=u897433725_sts_homologa`, conforme contrato atual;
- `HOMOLOG_MYSQL_USER` e `HOMOLOG_MYSQL_PASSWORD`: usuário dedicado com SELECT-only
  em sts_records, sem acesso ao banco de produção;
- `HOMOLOG_MYSQL_TLS`: true/false conforme transporte interno comprovado;
- `HOMOLOG_DATA_KEY`: a chave existente compatível com os registros de teste;
- `HOMOLOG_F4_SHA256`: digest do snapshot aprovado e previamente importado.

Não executar migração/importação automaticamente. Não mudar
COMMERCE_PRODUCTION_DATA_KEY. Não expor valores em VITE_, logs ou Git.
`npm run hosting:check -- --config` valida o formato da configuração sem conectar
ao banco; não comprova grants, credenciais válidas nem segurança do proxy.

## Critério objetivo para interpretar logs/HTTP

| Log / resposta | Significado e ação |
|---|---|
| STS_ENTRY_CONFIG | STS_RUNTIME ausente/incorreto; conferir o modo |
| STS_ENTRY_IMPORT | Backend/dependências ausentes ou importação incompatível; conferir build/pacote |
| STS_ENTRY_START | Configuração recusada antes de escutar; conferir variáveis do modo |
| STS_LISTEN_FAILED | Porta/interface não pôde ser aberta; conferir o contrato do supervisor |
| STS_QUARANTINE + 503 | Bloqueio deliberado; não renomear entrada nem repetir o deploy esperando 200 |
| STS_LISTENING | Listener ativo e protegido; ainda não confirma o F4 |
| STS_BUILD_UNAVAILABLE | Frontend ausente/inacessível no pacote |
| STS_F4_UNAVAILABLE | F4 não inicializado; banco/schema/chave/digest precisam ser conferidos privadamente |
| STS_F4_READY | Carga inicial validada; confirmar /api/ready com autenticação |
| 401 em restricted | Credencial administrativa ausente/incorreta |
| 403 em restricted | Host/proxy/protocolo recusado, ou rota comercial bloqueada |

Sem log correspondente, o status HTTP sozinho não prova que a resposta veio do
Node: pode ser do proxy. Não foi feita leitura de logs remotos nesta missão.

## Testes e reversão

`npm run verificar`, `npm run hosting:check`, `npm run test:hosting`,
`npm run test:guards` e `npm run test:integration` (com caminho do snapshot privado
somente no ambiente de teste). Nenhuma dependência foi alterada.
O teste de inicialização usa MySQL interceptado, credenciais sintéticas e loopback;
não representa MySQL real ou autenticação remota.

A branch de integração 9a9f181 e a produção ficam intactas. Para abandonar esta
preparação, voltar à branch de integração em uma árvore limpa. Não fazer reset
do workspace original, não restaurar/apagar bancos e não trocar chaves. Não há
reversão remota necessária, porque nada foi implantado.

Fontes oficiais consultadas:
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/changelog/nodejs-hosting-now-supports-applications-without-a-detected-framework

## Resultado executado

Node 22.23.4. npm run verificar e hosting:check aprovados; 12 testes de inicialização/contrato F4, 12 testes de guardas e 6 de integração aprovados (30 no total). F4 privado verificado somente por leitura local. Frontend, mídias, política de acesso, backend comercial, adaptador MySQL e lockfile sem alterações em relação a 9a9f181. Não houve nova revisão visual porque não houve mudança de interface; os hashes dos bundles frontend permaneceram iguais aos da etapa anterior. Avisos existentes de Vite/chunk mantidos. Nenhum teste de MySQL real, proxy remoto ou pagamento externo foi realizado.
