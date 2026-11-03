# Auditoria final de prontidão — 01/11/2026

> Relatório histórico preservado. Correções posteriores de implementação,
> testes e configurações externas ainda necessárias estão em PRODUCAO.md.
> Essas correções não constituem publicação nem homologação dos provedores.

## Continuidade e escopo

Auditoria retomada do chat “Ajustar intenção de compra”, interrompido por limite
de crédito. Resultados recuperados do último turno, sem repetir testes aprovados.
Nesta retomada foi concluída a inspeção restante de Livros no desktop (1280 px):
capas carregadas, ausência de overflow horizontal e expansão da FAQ funcionando.
Nenhum código ou conteúdo aprovado foi alterado. Sem commit, push, deploy,
cobrança, compra, etiqueta ou envio de mensagem.

## APROVADO

- TypeScript e build em `build/` passaram na auditoria interrompida.
- 21/21 testes de compras passaram: catálogo, preços calculados no servidor,
  embalagem, sessão, CSRF, idempotência, revalidação de frete, reconciliação,
  estados pendente/aprovado/recusado/cancelado/estornado e webhook HMAC.
  Os testes de pagamento usam fixtures; não equivalem à homologação externa.
- Assistente comercial: 17 respostas/recortes, 81 variantes e 54 perguntas de
  conhecimento/material aprovados; identidade, livros, material digital,
  atendimento humano, eletrodos e roteamento preservados. Bivolt 110/220 V
  também foi conferido pela interface na auditoria anterior.
- F4: testes HTTP, corpus e base privada aprovados localmente, incluindo
  fontes, restrições de exportação e exclusão do OCR não revisado.
- Inspeção anterior de segurança: nenhum segredo local encontrado nos 207
  arquivos examinados ou nos 274 blobs históricos do Git examinados. Arquivos
  privados ignorados; nenhum achado na busca adicional por padrões de segredo.
  Isso descreve o alcance da inspeção, não uma garantia universal.
- SuperFrete sandbox já validada diretamente e pela interface: HTTP 200,
  PAC/SEDEX reais de teste para 58417-065 e 15375-126. Não foi repetida a cotação.
- Catálogo preservado: nove SKUs, 100/200/250 sessões e R$ 198/298/339;
  250 sessões exclusivo do aparelho, P10. Nove ou mais unidades vão ao humano.
- Cotação no servidor, origem 58315-000. Embalagens (altura × largura × comprimento):
  1 unidade: 11 × 11 × 21 cm / 0,3 kg; 2–4: 11 × 11 × 21 cm / 1 kg;
  5–8: 22 × 22 × 21 cm / 2 kg. Timeout de 12 segundos, mensagem de falha e
  atendimento humano; não há frete fictício no adaptador normal.
- Conferências visuais recuperadas: home desktop e celular 390×844, menus,
  abertura 16:9, conceito, trajetória, eletrodos, livros, Assistente, rodapé e
  formulário móvel. Fluxo de formulário com simulador já constava aprovado
  em COMPRAS_LOCAL.md. Conclusão de Livros desktop feita nesta retomada.

## PENDÊNCIAS

1. **Compras não suportam produção.** `CommerceConfig` e `COMMERCE_MODE` só
   aceitam teste; SuperFrete está fixada no sandbox. Mercado Pago exige vendedor
   `test_user`, IDs `ORDTST` e rejeita pagamentos reais. É necessária implementação
   e validação explícita do modo produção; trocar tokens não resolve.
2. **Backend não faz parte da entrega pública.** O build é SPA estática; o proxy
   de desenvolvimento não publica `/api/loja`. Planejar serviço Node, proxy HTTPS,
   persistência privada durável e recuperação da chave/dados. O loopback pode
   permanecer internamente atrás de proxy, mas não pode ser a origem pública.
3. **Mercado Pago ainda não homologado nem em teste externo.** No levantamento
   recuperado estavam ausentes token, vendedor de teste, retorno HTTPS e segredo
   de webhook. Validar criação, retorno com sessão, entrega/assinatura de webhook,
   estados e integração pedido/frete, Pix e parcelamento, sem cobrança real.
4. **F4 é local.** `import.meta.env.DEV` desativa a consulta no build público.
   Respostas fixas permanecem; para disponibilizar o F4, preparar serviço privado
   próprio e acesso seguro, mantendo acervo e índice fora do frontend/Git.
5. **E-mails não são enviados.** A outbox apenas prepara duas mensagens de teste;
   falta serviço de envio e operação de confirmação. Rastreamento é manual.
6. **FAQs divergentes.** Home tem oito itens, Assistente sete. O Assistente mantém
   pergunta sobre profissionais oferecerem sessões; a página enfatiza manual e
   aprendizado e acrescenta onde obter informações. Há diferenças sobre cor da
   água/espuma, redação de bem-estar, uso doméstico, material digital e cuidados.
   Em Livros, item 7 fala em formação profissional no Assistente e em instruções
   de uso na página. Comparação literal completa em DIVERGENCIAS_FAQ_PRODUCAO.md.
   Risco: orientações editoriais inconsistentes e teste de igualdade reprovado;
   não foi identificada por essa divergência falha financeira ou de segurança.
   Definir a redação aprovada antes de sincronizar; nenhum texto foi alterado.

## CONFIGURAÇÕES QUE AINDA PRECISO FAZER

Após preparar o código e a arquitetura de produção:

- Configurar token SuperFrete de produção separado do sandbox e endpoint
  `https://api.superfrete.com/api/v0/calculator`. O endpoint foi confirmado na
  auditoria anterior pelo código do plugin oficial SuperFrete 3.3.4, disponível
  em https://wordpress.org/plugins/superfrete/ . Não foi feita cotação de produção.
- Configurar credenciais Mercado Pago de produção separadas das de teste,
  identificação do vendedor e segredo do webhook exclusivamente no backend.
- Configurar origem HTTPS do site, retorno de pagamento e endpoint HTTPS
  `/api/loja/webhooks/mercadopago`, coerentes com domínio e cookies.
- Configurar armazenamento privado persistente, chave de criptografia e backup;
  não substituir a chave dos registros existentes sem migração planejada.
- Configurar provedor/remetente de e-mail e verificar entrega das confirmações.
- Conferir o destino real na Hostinger antes da futura publicação autorizada.
  O registro existente aponta GitHub `tavaressaude10-max/sts-detox`, `main`,
  domínio `stsdetox.com.br`; não houve nova inspeção do painel nesta retomada.

Não enviar segredos pelo chat nem usar prefixo VITE_ para credenciais privadas.

## Limites e observações

Build e HTTP não confirmam reprodução completa dos nove vídeos ou do YouTube.
Não houve nova reprodução integral, celular físico, entrega real de e-mail ou
pagamento externo. Destinos dos links externos foram inspecionados, mas isso
não comprova disponibilidade ponta a ponta de Amazon e redes sociais.
Auditoria npm existente de 01/11: 14 moderadas na cadeia ESLint/minimatch,
nenhuma alta/crítica; dependências não alteradas ou auditadas novamente aqui.
Avisos de tamanho do bundle e plugin de paths não impediram o build.

## RECOMENDAÇÃO FINAL: NÃO PUBLICAR AINDA

A versão completa com compras e F4 não está pronta para produção. Os bloqueios
são implementação/infraestrutura e homologação, além de configuração; não se
resolvem somente preenchendo credenciais. A auditoria está concluída e registra
esses impedimentos sem autorizar publicação ou alterar a versão aprovada.
