# Revisão consolidada local — 31/10/2026

Revisão solicitada pelo proprietário, somente local. Sem commit, push, deploy ou alteração na hospedagem.

## Preservação

- Backup anterior às edições: `backup-revisao-local-20261031-152330.zip`, ignorado pelo Git. Inclui fontes, documentação, configuração e mídias públicas; não inclui o acervo privado.
- Comparação SHA-256 de 434 arquivos protegidos: nenhuma alteração em `server`, `scripts`, `.private-assistant`, `public`, arquivos do Assistente, CSS do Assistente, raiz React, configuração Vite, package.json e lockfile.
- Nenhuma consulta F4 executada. A lógica, a base e os textos internos do Assistente foram preservados, inclusive eventuais grafias antigas. A padronização editorial abrange o site público fora desse conjunto protegido.
- Preservados os nove vídeos, as capas, os dois PNG de eletrodos, a rota `/livros`, a âncora `#formacao` usada pelo Assistente e a âncora antiga `#uso-profissional`.

## Implementado

- Destaque do DETOX BioEquilíbrio após a abertura; conjunto corrigido para aparelho, eletrodo de aproximadamente 250 sessões, uma cinta BioVibracional e material digital com manual e instruções.
- Uso pessoal, material/equipamento, quatro etapas da sessão, conhecimento e responsabilidade, abordagem responsável e tradição/experiência/ciência conforme o texto enviado.
- Oito perguntas frequentes, contato simplificado e redes sociais apenas no rodapé adjacente.
- Nove opções individuais de eletrodos: quatro de 100 sessões a R$ 198,00; quatro de 200 a R$ 298,00; uma exclusiva de 250 a R$ 339,00. Ampliação das imagens preservada. Botões de compra desabilitados, com explicação de indisponibilidade.
- Vitrine uniforme de quatro livros com acesso direto aos links Amazon existentes. `/livros` preservada por conter conteúdo próprio, prefácios, autor e perguntas frequentes.
- DETOX IÔNICO padronizado nas páginas, menu, mensagens de contato e normalização do componente antigo de playlists.
- Biblioteca antiga preservada em código, mas substituída na home por `VideosDestaque`. Removida a apresentação de “Aulas”. O canal existente continua acessível.
- Nenhuma referência bibliográfica acrescentada sem correspondência verificada. Texto aprovado aplicado, sem introdução de novas promessas terapêuticas.

## Pendências explícitas

1. Identificar o arquivo/link do vídeo curto “Como surgem as doenças?” e do vídeo mais completo com professor Tavares. `VideosDestaque.tsx` tem a estrutura pronta, mas a lista está vazia: esses dois vídeos **ainda não estão exibidos**. Nenhum ID presumido foi inserido. A seção apresenta os textos aprovados e o link do canal.
2. Confirmar a mídia do conjunto completo. Mantido `video-4.mp4`, já usado como apresentação do equipamento, também abaixo dos eletrodos. Não foi possível confirmar visualmente que ele mostra cinta, fonte e todos os acessórios. Não foram inventadas imagens desses itens. O vídeo de uso pessoal (`video-1.mp4`) foi preservado.
3. Definir pagamento, checkout e frete para ativar os nove botões de compra. Nenhum checkout, transportadora ou link comercial novo foi inventado.
4. Conferência visual desktop/mobile e reprodução: pendentes. Navegador interno teve timeout; controle do Firefox foi encerrado pela ferramenta por incompatibilidade de aplicação da política de URLs. Não houve teste visual nem teste de reprodução nesta revisão.

Consulta somente de leitura à API existente retornou:
- Apresentação: `GuCLmhi-Ed8` — Bem-vindos ao DETOX IÔNICO PELOS PÉS – BioEquilíbrio.
- Antiga playlist Aulas: `FyXlge_wskU` e `lXHNB1CYZd4`.
- Diversos: `aEmVtrrURT0`.
Esses títulos não permitiram identificar com segurança o par solicitado.

## Verificação

- `npm.cmd run verificar`: aprovado, TypeScript e Vite 8.1.6; saída `build/`.
- Aviso preexistente do Vite sobre `vite-tsconfig-paths`; não impede o build e não foi alterado nesta revisão.
- `git diff --check`: aprovado. Avisos de conversão LF/CRLF preexistentes.
- 19 referências diretas a assets conferidas: nenhuma ausente.
- Prévia temporária de produção, em loopback: HTTP 200 para `/`, `/livros`, vídeos 1/4/6 e os dois PNG de eletrodos. Isso confirma entrega HTTP, não renderização ou reprodução.
- Dependências não alteradas; não houve instalação nem nova auditoria npm.

## Arquivos desta revisão

Editados: `src/routes/index.tsx`, `src/routes/livros.tsx`, `src/components/SiteHeader.tsx`, `src/components/EletrodosConexoes.tsx`, `src/components/VideoPlaylistBrowser.tsx`, `src/lib/whatsapp.ts` e `VIDEOS.md`.

Criados: `src/components/ConjuntoBioequilibrio.tsx`, `src/components/AbordagemResponsavel.tsx`, `src/components/VitrineLivros.tsx`, `src/components/VideosDestaque.tsx` e este relatório.

O status Git também contém mudanças anteriores a esta revisão. Não tratá-las como novas nem revertê-las.
