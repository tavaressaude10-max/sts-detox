> Estado atual 01/11/2026: adaptação LOCAL Business Node.js 22 + MySQL; entrada server.js.
> Python/Docker/disco persistente não são requisitos do servidor. Nenhum deploy/push autorizado nesta etapa.
> Consulte BUSINESS_NODE_MYSQL.md e PRODUCAO.md; instruções anteriores abaixo são históricas.

> Preparação local de produção em 01/11/2026: servidor Node + APIs/F4 e SMTP
> implementados, sem publicação. A configuração estática histórica abaixo não
> executa os novos serviços. Consulte `PRODUCAO.md` antes de configurar hospedagem.

# Contexto do site e da transferência

01/11/2026: retomada das 16 alterações da estrutura de compras interrompida.
Rota `/compra`, API Node local separada, Mercado Pago Orders/Checkout Pro e
SuperFrete sandbox. Sem publicação, credenciais externas ainda não preenchidas,
F4 preservado. Consulte `COMPRAS_LOCAL.md` para execução e limites.

Atualização local de 31/10/2026: F4 consulta a base privada por middleware de
desenvolvimento e worker Python. O build público continua SPA sem esse endpoint.
Oito respostas fixas, sem IA, com fontes verificadas no servidor. Revisão das
154 páginas OCR: cinco textos corrigidos e 149 OCR excluídos da recuperação;
não confundir triagem com validação integral de todos os diagramas. Consulte
`INTEGRACAO_PRIVADA_LOCAL.md`. Não publicar ou enviar o acervo ao Git.

Continuidade local de 30/10/2026: o Assistente Tavares permanece sem IA e sem
publicação. Teste isolado F3 disponível em `/teste-assistente.html` no servidor
de desenvolvimento; o proprietário confirmou funcionamento do F3 no Firefox
externo na Home e em Livros, sem recorrência do travamento após Q. Preparação privada
dos quatro livros documentada em `BASE_PRIVADA_ASSISTENTE.md`; acervo e índice
estão em `.private-assistant/`, ignorados pelo Git e bloqueados no Vite.
Não incluir essa pasta em publicação ou arquivos públicos.

## Objetivo e estado conhecido

Em 29/10/2026, DETOX PET foi acrescentado como quarto livro na home e em
`/livros`, preservando os três títulos anteriores. A capa oficial foi obtida
da página Amazon informada pelo cliente (`https://www.amazon.com/dp/B0HNWDSW4V`)
e é servida localmente em `public/assets/capa-detox-pet.jpg`. O componente
`src/components/DetoxPetCard.tsx` reúne capa, título e botão “Ver na Amazon”;
capa e botão abrem o endereço em nova aba. A grade da home tem uma, duas ou
quatro colunas conforme a largura da tela. Publicação pelo fluxo GitHub existente.

Em 29/10/2026, a pedido do cliente, a seção “Galeria de demonstrações” foi
removida da home. Os arquivos de vídeo foram preservados, incluindo os usados
em outras seções. O botão principal agora aponta para `#videos`. Os textos
do site foram padronizados para “DETOX”, inclusive títulos recebidos pela API
das playlists. Publicação autorizada e executada em 29/10/2026 pelo GitHub;
destino, backup e limites da verificação estão em `DESTINOS.md` e `VALIDACAO.md`.

Atualização em 29/10/2026: ambiente Windows preparado; Seroval atualizado
de 1.6.7 para 1.7.2 por override, sem alterar as demais versões do lockfile.
Instalação limpa, TypeScript, build e auditoria passaram (zero vulnerabilidades).
As três playlists, os nove vídeos locais e `/livros` foram testados no navegador;
limites e ocorrência transitória no vídeo 04 estão em `VALIDACAO.md`.
O cliente confirmou o repositório `tavaressaude10-max/sts-detox` e autorizou
commit/push em `main`. O remoto foi consultado e estava vazio; Git local
inicializado. A restrição inicial de não conectar a Hostinger foi superada
pela autorização posterior explícita de publicação e automação.

O site apresenta o STS Detox BioEquilíbrio, equipamento, uso pessoal e
profissional, formação, livros de Severino Tavares da Silva e contato por
WhatsApp. A home contém informação educativa e comunicação responsável sobre
bem-estar, com explicações sobre a interpretação da cor da água.

Há duas rotas: `/` e `/livros`. A página de livros contém Enciclopédia Corpo
Humano, Detox Iônico e Detox BioEquilíbrio, com capas e links de aquisição.
O código desta entrega é a referência do conteúdo; não acrescente produtos
citados apenas em descrições de vídeos sem solicitação do proprietário.

Em 22/10/2026 foi adaptada a ideia da biblioteca de vídeos do projeto SITE_2026
(IRISMACRO): playlists, miniaturas e reprodução dentro do site. Inicialmente
foram usadas três playlists de referência. Elas foram substituídas pelas
playlists enviadas pelo proprietário e listadas em `VIDEOS.md`.

Os nove vídeos locais de sessões reais foram mantidos. A biblioteca fica em
`/#videos`, acessível pelo item Vídeos no menu. Seus grupos atuais são
Apresentação, Aulas e Diversos.

Em 28/10/2026 o proprietário relatou erro de reimplantação na Hostinger. O ZIP
anterior continha somente o site compilado (`index.html` e assets). Foi preparado
outro ZIP com fontes, `package.json`, lockfile e configurações na raiz. Depois,
o proprietário informou: "Pronto, deu certo". O log original da falha não foi
recebido; o motivo exato não foi demonstrado pelo log.

A solicitação atual é transferir o projeto e seu contexto para o computador e
a conta do cliente, com atualização via GitHub e publicação na Hostinger.

Depois da preparação, o proprietário apresentou alertas de segurança do painel.
As dependências foram corrigidas e validadas novamente: Vite 8.1.6,
source-map-js 1.2.2 e remoção de Zod não utilizado. A auditoria npm retornou zero
vulnerabilidades conhecidas em 28/10/2026; consulte `SEGURANCA.md`.

## Arquitetura e arquivos

Correção local de 30/10/2026: a RootShell mantém HeadContent e children, sem
renderizar html/head/body nem Scripts de SSR. A SPA é montada em `#root`;
`index.html` é o único proprietário do documento. Reintroduzir o shell de
documento do TanStack Start nessa montagem causa erro de ancestralidade no
React 19 e travamento de eventos do formulário. Consulte ASSISTENTE_TAVARES.md.

| Arquivo/pasta | Finalidade |
| --- | --- |
| `src/spa-main.tsx` | Entrada React da aplicação cliente |
| `index.html` | Entrada HTML do Vite |
| `vite.hostinger.config.ts` | Build da SPA; saída `build/` |
| `src/router.tsx`, `src/routeTree.gen.ts` | Registro das rotas |
| `src/routes/__root.tsx` | Estrutura raiz; preserve o Outlet |
| `src/routes/index.tsx` | Home e parte dos links/WhatsApp |
| `src/routes/livros.tsx` | Livros, autor, FAQ e aquisição |
| `src/components/SiteHeader.tsx` | Menu desktop/móvel e submenu Livros |
| `src/components/SiteFooter.tsx` | Rodapé e redes sociais |
| `src/components/VideoPlaylists.tsx` | Seleção entre playlists |
| `src/components/VideoPlaylistBrowser.tsx` | Busca, miniaturas, player e fallback |
| `src/components/VideoGaleria.tsx` | Componente antigo dos nove vídeos; não montado na home |
| `src/lib/video-playlists.ts` | IDs e endpoint das playlists |
| `src/lib/whatsapp.ts` | Contatos e links Amazon |
| `src/styles.css` | Tema, tipografia e estilos |
| `src/assets/*.asset.json` | Metadados usados pelos componentes |
| `public/assets/` | Imagens, capas e vídeos efetivamente servidos |
| `public/.htaccess` | Fallback de rotas para hospedagem Apache |

A base veio de um projeto Lovable. A versão entregue é uma SPA Vite; não depende
da conta do Lovable para rodar. A existência de conexão/sincronização antiga do
Lovable com algum GitHub não foi verificada. Não há histórico `.git` na entrega.

## Integrações e dependências externas

- Listagem de vídeos: API pública
  `https://www.irismacro.com/API-youtube-/videos_playlist_dinamico_final.php`.
  O cliente recebe essa dependência, não seu servidor/código/chave. Ela aceitou
  as playlists do STS em 22/10/2026, com um vídeo em cada na ocasião; esse número
  muda conforme o conteúdo do YouTube. Não há paginação implementada no frontend;
  a lista é a resposta fornecida pela API.
- O player é um iframe do YouTube ativado por clique. A troca de playlist
  desmonta o player anterior. Os vídeos locais são pausados ao iniciar o player.
  O início de vídeo local interrompe o player da biblioteca.
- Busca começa perto da área visível. Há timeout de 12 segundos, tentativa
  novamente e fallback para player de playlist/link quando a API falha.
- Não existe chave do YouTube no frontend. Para remover a dependência do
  IRISMACRO, será necessário implementar e hospedar outra API de listagem.
- Fontes são carregadas pelo Google Fonts. WhatsApp, Amazon, Instagram,
  Facebook e YouTube usam links externos já presentes nos arquivos.
- WhatsApp atual no código: `5583989094835`, repetido na home e no módulo de
  contatos. Não é uma credencial.
- A rede social YouTube atualmente aponta para
  `https://www.youtube.com/@severinotavaresdasilva6514`; trocar os IDs das
  playlists não altera esse link. Confirmar com o proprietário antes de mudar.
- Não há backend próprio, banco de dados, painel administrativo ou variáveis
  de ambiente obrigatórias para o build desta cópia.

## Visual e conteúdo

Idioma pt-BR, tema claro em verde-água/verde profundo. Tipografia Montserrat,
Open Sans e JetBrains Mono. Preserve responsividade, menu móvel, navegação de
livros, acessibilidade dos botões e as capas oficiais.

## O que esta entrega contém

Fontes, lockfile, configurações, imagens/capas/vídeos usados pelo site, guias de
instalação e publicação e instruções para o Codex. Não inclui relatórios pessoais,
PDFs clínicos, documentos avulsos da pasta de trabalho, senhas, sessões do chat,
tokens ou histórico Git anterior. Esses materiais não são necessários ao site.

## Verificações e limites

Antes desta entrega, builds de produção e checagem TypeScript passaram. A
conferência visual anterior no navegador local foi bloqueada pelo ambiente;
não houve confirmação de reprodução ponta a ponta por essa via. A publicação
por ZIP foi confirmada pelo proprietário, não por acesso nosso ao painel.

O registro da validação da entrega está em `VALIDACAO.md`. O proprietário
confirmou o domínio `https://stsdetox.com.br`. A conta/repositório/branch do
GitHub e o vínculo automático com a Hostinger ainda precisam ser informados
e verificados em `DESTINOS.md`.

## Seção local Eletrodos e conexões — 31/10/2026

O proprietário aprovou manualmente no Firefox a digitação, resposta e rolagem
F4. Preservar integralmente esse comportamento; componente e base do assistente
não foram alterados nesta etapa.

Nova seção da home em /#eletrodos-conexoes, após “O que é”, implementada em
src/components/EletrodosConexoes.tsx. P10 macho; Mike fêmea com dois furos;
XLR macho e fêmea em espaços separados. Nenhuma imagem de conector foi criada
ou obtida: fotos reais aguardam fornecimento/aprovação. A seção esclarece que
P10 não implica compatibilidade com o eletrodo de 250 sessões.

Destaque exclusivo do modelo de 250 sessões para DETOX BioEquilíbrio:
cabo do aparelho de aproximadamente 1,20 m, conexão P10 e cabo do eletrodo de
aproximadamente 50 cm. Fluxo textual responsivo, sem escala. Três espaços para
vídeos futuros; vídeo atual e biblioteca de vídeos mantidos integralmente.

Proposta antiga em proposta-eletrodos.html é um rascunho histórico separado;
a referência atual para validação é a seção integrada da home. Sem publicação,
push, contratação, dependências novas ou integração externa.

### Identificação por número — revisão local

Componente preservado e reorganizado: Nº 1 XLR com 1-A macho (3 pinos) e
1-B fêmea (3 encaixes/furos); Nº 2 P10; Nº 3 Mike fêmea (2 furos).
Espaços identificados para fotos aprovadas, sem imagens genéricas.
Estrutura informativa em duas etapas: 100/200 sessões e depois conector,
com exemplos de identificação do pedido, sem seleção comercial ou pagamento.
250 sessões separado, exclusivo DETOX BioEquilíbrio, Nº 2 P10, com explicação
do cabo de 50 cm conectado ao cabo de 1,20 m do aparelho. Assistente F4,
fontes, base privada e vídeos existentes não alterados. Sem publicação.

### Apresentação compacta com imagens aprovadas — 31/10/2026

EletrodosConexoes.tsx agora usa os dois PNG originais em public/assets, sem
edição: guia 100/200 com conectores e imagem exclusiva do modelo 250 sessões.
Cartões, diagramas repetidos e placeholders visuais removidos. Textos curtos
solicitados preservados, links para ampliar as imagens em nova aba e textos
alternativos acessíveis. Vídeos existentes intactos; ponto de inserção futuro
mantido como comentário, sem espaços vazios na apresentação.

No celular (até 639px), atalhos de Assistente e WhatsApp ficam no fluxo ao final
do conteúdo, sem sobrepor leitura. Desktop mantém flutuantes. WhatsApp segue
visível e acessível nesse modo móvel mesmo próximo ao contato. Nenhum evento
de digitação, rolagem ou consulta do F4 foi alterado. Sem venda ou publicação.
