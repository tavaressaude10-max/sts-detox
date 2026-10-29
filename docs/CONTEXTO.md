# Contexto do site e da transferência

## Objetivo e estado conhecido

Atualização em 29/10/2026: ambiente Windows preparado; Seroval atualizado
de 1.6.7 para 1.7.2 por override, sem alterar as demais versões do lockfile.
Instalação limpa, TypeScript, build e auditoria passaram (zero vulnerabilidades).
As três playlists, os nove vídeos locais e `/livros` foram testados no navegador;
limites e ocorrência transitória no vídeo 04 estão em `VALIDACAO.md`.
O cliente confirmou o repositório `tavaressaude10-max/sts-detox` e autorizou
commit/push em `main`. O remoto foi consultado e estava vazio; Git local
inicializado. A Hostinger não deve ser conectada nesta etapa.

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
| `src/components/VideoGaleria.tsx` | Nove vídeos locais |
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
