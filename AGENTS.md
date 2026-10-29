# Instruções para continuidade do STS Detox

Leia `README.md`, `docs/CONTEXTO.md`, `docs/GITHUB_HOSTINGER.md` e
`docs/DESTINOS.md` antes de trabalhar.

- Este diretório é a raiz do projeto a manter. Não recrie o site do zero.
- Stack de produção: React 19, TypeScript, Vite, Tailwind 4 e TanStack Router.
  A origem foi Lovable/TanStack Start; a entrega usa SPA com `src/spa-main.tsx`.
- Use `vite.hostinger.config.ts`. A saída de produção é `build`, não `dist`.
- Use Node 22 >=22.12 e `npm ci`; mantenha `package-lock.json` no Git.
- Preserve os textos, as cores, os nove vídeos locais, as capas e as duas
  páginas existentes (`/` e `/livros`). Faça mudanças conforme o pedido.
- A apresentação é de bem-estar e conteúdo educativo. Preserve a distinção
  entre observações, evidência científica e alegações médicas presente no site.
- Playlists: `src/lib/video-playlists.ts`. API de listagem é externa ao cliente;
  não há backend PHP dessa API no pacote. Leia `VIDEOS.md`.
- WhatsApp está em `src/lib/whatsapp.ts` E também em `src/routes/index.tsx`.
  Ao trocar número, atualize as duas definições. Redes sociais também aparecem
  na home e em `src/components/SiteFooter.tsx`.
- `src/routeTree.gen.ts` está versionado; o Vite desta entrega não configura
  geração automática da árvore. Leia `src/routes/README.md` ao criar rotas.
- Antes de entregar uma alteração de código, execute `npm run verificar` e
  faça a verificação visual pertinente quando houver navegador disponível.
  Informe os limites de verificação; build não confirma reprodução do YouTube.
- Antes de enviar ao GitHub, confira `git remote -v`, branch e diff. Respeite
  o histórico existente e as alterações do cliente. Não use force push.
- Nunca trate a branch `main` ou um domínio presumido como destino verificado;
  confira os dados reais em `docs/DESTINOS.md` e na Hostinger.
- Push na branch conectada à Hostinger pode publicar imediatamente. Não
  instale outro fluxo de upload/FTP concorrente sem necessidade.
- Não versionar `node_modules`, builds, ZIPs, credenciais ou sessões locais.
  Não recrie autenticações do GitHub/Hostinger a partir de conversas antigas.
- Atualize a documentação quando mudar build, publicação ou integração.
- Ao alterar dependências, execute também `npm audit`. Leia `docs/SEGURANCA.md`
  e preserve as correções registradas no package.json e no lockfile.

Esta entrega não inclui `.git`: é uma cópia do código, não uma transferência do
histórico Git de um repositório anterior. Se já houver repositório do cliente,
clone-o e integre esta entrega preservando o histórico.
