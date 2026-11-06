# Preparação de publicação — 05/11/2026

## Confirmação do pedido existente
- Consulta autenticada e acesso temporário ao resumo do pedido já pago: HTTP 200, approved, R$ 357,91, test=true.
- Navegador integrado, sessão diferente da original: confirmou automaticamente “✅ PAGAMENTO APROVADO!”, pedido e valor. Nenhum clique de atualização e nenhum novo pagamento.
- O checkout antigo não contém a autorização adicionada depois; não basta reabrir sua URL sem a sessão original. Foi preparado um atalho PRIVADO em `.private-commerce/confirmacao-teste.url`, válido por 24 horas, para esse pedido exclusivamente. Não versionar nem compartilhar.
- Autorizações novas ficam no fragmento do retorno, são retiradas da barra e guardadas na sessão da aba. HMAC vincula pedido, ambiente e validade; acesso permite só resumo, nunca dados pessoais. Número do pedido/retorno=aprovado não autorizam nem aprovam nada.
- Aprovação sempre vem da reconciliação backend; simulação não envia produto nem e-mail. O fluxo completo de uma NOVA order com retorno protegido não foi executado, pois novas compras foram proibidas.

## Candidato de publicação
- `npm run verificar` gera `build/` e `.server-build/`.
- `/compra` no build público fica fechado por padrão (VITE_CHECKOUT_ENABLED ausente ou diferente de true). Desenvolvimento continua disponível para testes.
- Manter no backend COMMERCE_CHECKOUT_DISABLED=true e COMMERCE_PRODUCTION_CHECKOUT_ENABLED=false na futura hospedagem. Não transportar `.env.commerce.local`, dados cifrados, credenciais de teste ou URL temporária.
- Não habilitar VITE_CHECKOUT_ENABLED antes da homologação e autorização expressa. A trava visual não substitui a trava backend.
- Home, livros, produtos, preços, vídeos e Assistente preservados nesta etapa.
- Os 31 testes de compras e 13 testes de servidor passaram. Testes MySQL por contrato não comprovam operação real na hospedagem.

## Bloqueios indispensáveis
- Site oficial respondeu HTTP 200 nesta verificação; nada foi publicado.
- Configuração MCP Hostinger existe, mas suas ferramentas não estão disponíveis nesta sessão. Não foi possível confirmar o estado atual do painel.
- Histórico indica publicação estática por GitHub/main. A versão completa depende de API Node, MySQL/schema e base privada F4 para preservar o Assistente. Confirmar no painel quais já estão prontos e testar antes de substituir a versão atual; um ZIP estático sozinho não comprova essas funções.
- Pagamentos reais não homologados: ficam desativados. Não é necessário configurar credenciais reais para esta entrega com checkout fechado.

## Preservação e reversão
- Repositório: tavaressaude10-max/sts-detox; trabalho local em codex/assistente-homologacao. Não houve commit, push ou merge nesta etapa. Push em main pode publicar automaticamente.
- Backup histórico `stsdetox-backup-fonte-anterior-20261029.zip` existente, SHA256 conferido: 0895C15529B43CBAAED65F57B0198E1F7D8CA7D55FB5F809638C17D0BA75189A.
- Esse arquivo é histórico, NÃO snapshot atualizado do site oficial. Antes de publicar, registrar build/commit atualmente ativo e obter backup/restauração da versão atual pelo painel. Manter implantação anterior disponível; reverter para ela se smoke test falhar. Não sobrescrever produção antes dessa conferência.
- Publicar somente após autorização expressa, pela integração existente, sem fluxo FTP concorrente.
