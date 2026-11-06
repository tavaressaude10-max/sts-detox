# Implantação com checkout fechado — conferência de 05/11/2026

## Versão correta
Consulta git ls-remote em 05/11 confirmou:
- origin/main: 651fb2bcd5cd5e1c5fd457bad90ec031ad108d29.
- origin/backup-site-vite-2026-11-03: 674d6fa8b7fb89b576db0b9461158cd89539efb0.
- A branch codex/assistente-homologacao ainda não existe no remoto.
- HEAD local eafe69b acrescenta isolamento/prontidão de APIs sobre main; o candidato completo inclui também as alterações locais e os arquivos novos necessários. Não publicar main atual supondo conter esses ajustes, nem usar git archive HEAD omitindo-os.
- Antes de envio: consolidar candidato em branch de revisão, conferir diff e arquivos privados, registrar commit final. Não enviar para main antes de autorização de publicação (deploy automático histórico).

## Estado real do backend
GET público /api/assistente-local e /api/loja/session retornaram 200 text/html, não respostas de API. Portanto o domínio atual não demonstra backend funcional; é compatível com fallback SPA estático.
O código server.js está preparado para Node 22, mas exige MySQL, schema cifrado e snapshot F4 privado validado. ASSISTANT_ENABLED=true e COMMERCE_SITE_ORIGIN precisam corresponder à origem HTTPS canônica; redirecionar www/apex para a escolhida. Servir somente build como estático, nunca a raiz do projeto.
A pesquisa ampliada SQLite de homologacao.mjs --pesquisa-local é explicitamente restrita ao computador local e NÃO integra o backend de produção. O backend hospedável atual atende o F4 curado (oito respostas), além das respostas comerciais/contextuais do frontend. Não prometer equivalência com a busca local ampliada sem homologar as perguntas aprovadas.

## Configuração candidata, sem execução externa
- Node 22 >=22.12, entrada server.js, npm start, instalação npm ci, build npm run build:hostinger.
- COMMERCE_CHECKOUT_DISABLED=true; COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false; VITE_CHECKOUT_ENABLED=false. Não preencher tokens Mercado Pago/SuperFrete para esta publicação fechada.
- Validar primeiro em Web App isolado com homologacao.mjs e banco de homologação; essa entrada fixa test e checkout fechado. Não reutilizar banco/chave de produção nos testes.
- Conferir schema e F4 via ferramentas existentes; não executar migração/importação no banco de produção nesta preparação.
- Aprovação mínima: /api/health responde JSON; /api/ready 200 após F4 válido; perguntas aprovadas retornam resposta e fonte; /compra mostra compras em preparação; POST checkout permanece bloqueado; home/livros/vídeos preservados.
- Ferramentas Hostinger não expostas nesta sessão; configurações efetivas, banco e processo hospedado ainda não inspecionados. Não modificar a hospedagem nem publicar sem autorização expressa.

## Reversão
O responsável confirmou download/conferência dos backups de arquivos e MySQL de produção de 05/11/2026. Preservar esses backups juntos com as chaves privadas existentes, fora do Git. Não pedir novo backup sem alteração do ambiente.
Antes da troca autorizada, anotar build ativo e configuração de entrada/build/variáveis sem seus valores secretos. Preservar implantação anterior. Se a verificação falhar, restaurar a implantação/configuração anterior; restaurar banco de 05/11 apenas se necessário e com autorização, para não sobrescrever dados posteriores. A branch backup é alternativa histórica, não prova do conteúdo exato do backup baixado.
Nenhuma publicação, alteração de credenciais, migração de banco ou pagamento realizada nesta etapa.
