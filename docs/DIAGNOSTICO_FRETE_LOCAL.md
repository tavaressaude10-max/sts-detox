# Conferência de frete e conectores — 01/11/2026

Somente local. Não publicar. Cotação real no sandbox confirmada no reteste abaixo;
isso não homologa produção ou pagamentos.

## Reteste com credencial gerada no Sandbox — 01/11/2026

Arquivo .env.commerce.local relido e processo da API de compras totalmente
reiniciado. Autenticação aceita: HTTP 200 para os dois CEPs, com opções reais
da API SuperFrete Sandbox, sem mocks. Origem 58315000, uma unidade,
pacote 11 × 11 × 21 cm, 0,3 kg.

| CEP | PAC | Prazo PAC | SEDEX | Prazo SEDEX |
| --- | --- | --- | --- | --- |
| 58417-065 | R$ 18,91 | 10 dias úteis | R$ 24,28 | 4 dias úteis |
| 15375-126 | R$ 70,64 | 16 dias úteis | R$ 92,98 | 10 dias úteis |

Prazos após postagem. O botão Calcular frete foi testado com ambos os CEPs e
exibiu as mesmas opções, valores e prazos. API e prévia deixadas ativas.

Ocorrências: a primeira chamada do CEP 58417-065 excedeu o timeout local de
12 segundos, sem resposta HTTP. Repetição diagnóstica com limite de 45 segundos
retornou 200 em cerca de 3,7 segundos; segundo CEP em cerca de 1,8 segundo.
Não houve erro de autenticação nem mensagem de erro do provedor nas respostas
bem-sucedidas. O limite do código não foi alterado. A prévia estava desligada
ao recarregar; Vite reiniciado na porta 5174 antes dos testes pela interface.
Nenhuma alteração de código, pagamento, emissão de etiqueta ou publicação.

Os registros seguintes são históricos e foram superados por este reteste.

## Reteste após token salvo — 01/11/2026

Configuração relida e API local reiniciada. Token presente, sem exposição do
valor. As chamadas reais ao endpoint sandbox retornaram HTTP 401 e mensagem
`Token inválida!` tanto para 58417-065 quanto para 15375-126. Nenhuma opção
ou preço retornado; sem mocks. Cenário: uma unidade, origem 58315000,
pacote 11 × 11 × 21 cm, 0,3 kg.

Botão “Calcular frete” testado na prévia para ambos os CEPs após reiniciar a
API: exibe a mensagem de indisponibilidade/atendimento humano, sem opções.
O impedimento atual é rejeição da credencial pelo sandbox; não mais token
vazio. A resposta não distingue token de outro ambiente, revogado ou inválido.
Necessário confirmar a validade e o ambiente da credencial na SuperFrete.
Nenhuma mudança de código, compra, etiqueta ou publicação neste reteste.

O diagnóstico abaixo registra a situação anterior ao preenchimento do token.

## Causa observada e correção parcial

A prévia Vite estava ativa em 5174, mas a API de compras em 8788 não estava
respondendo: GET `/api/loja/session` retornava 502 pelo proxy. A API foi iniciada
com `npm.cmd run commerce:dev`; sessão passou a retornar 200.

`SUPERFRETE_TOKEN` está vazio em `.env.commerce.local`. O adaptador interrompe
a operação com `not_configured` antes do fetch. Portanto, **não houve resposta
da SuperFrete nem valores reais obtidos**. O erro de configuração agora é
exibido explicitamente, em vez de ser substituído pelo atendimento genérico.
Essa alteração não resolve a ausência da credencial e não é homologação.

| CEP testado na interface e no HTTP local | Normalizado | Resultado |
| --- | --- | --- |
| 58417-065 | 58417065 | HTTP 503, not_configured; sem cotação |
| 15375-126 | 15375126 | HTTP 503, not_configured; sem cotação |

Nenhum valor simulado foi apresentado na prévia. A suíte automatizada utiliza
providers e respostas controladas: ela verifica regras e protocolo, não a
credencial da conta, disponibilidade externa ou valores reais.

## Chamada preparada

POST `https://sandbox.superfrete.com/api/v0/calculator`, Bearer token apenas
no servidor, Content-Type/Accept JSON e User-Agent com contato. Serviços `1,2`
(PAC/SEDEX). Origem `58315000`, destino normalizado com oito dígitos.

Embalagens existentes preservadas (altura × largura × comprimento em cm; kg):
1 unidade: 11 × 11 × 21 / 0,3; 2–4: 11 × 11 × 21 / 1;
5–8: 22 × 22 × 21 / 2; 9+ segue atendimento humano.
Seguro desativado, sem mão própria/aviso de recebimento. Sem alteração dos
dados aprovados e sem confirmação externa de aceitação enquanto faltar token.

Para concluir: preencher localmente SUPERFRETE_TOKEN com credencial sandbox,
reiniciar `npm.cmd run commerce:dev` e executar:

```powershell
node --env-file=.env.commerce.local --experimental-strip-types scripts/diagnose-shipping.mjs
```

O diagnóstico não usa mocks; informa se houve chamada, status HTTP e opções
válidas ou código de falha, sem imprimir token ou resposta bruta. Repetir os
dois CEPs pela interface. Credenciais Mercado Pago são independentes do frete
e não foram alteradas. Não ativar produção como substituto da homologação.

## Conectores e verificações

Nove cartões com enquadramentos SVG das quatro fotos existentes no próprio
`Guia de Eletrodos e Conectores.png`: 1-A XLR macho, 1-B XLR fêmea,
Nº 2 P10 macho e Nº 3 Mike fêmea. Nenhum arquivo de imagem gerado ou alterado.
P10 também no modelo exclusivo de 250 sessões. Nomes, preços, sessões e nove
links de compra preservados. Conferência visual em 1280×900 e 390×844,
sem transbordamento horizontal no celular.

`npm.cmd run verificar`: aprovado. `npm.cmd run test:commerce`: 21/21.
`node scripts/test-assistant-commerce.mjs`: aprovado, incluindo as oito
frases obrigatórias anteriores. Nenhuma mudança no Assistente, F4,
Mercado Pago, WhatsApp, vídeos ou outras seções.
