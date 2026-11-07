# Preparação institucional parcial — 07/11/2026

Base publicada confirmada pelo proprietário: backup-site-vite-2026-11-03,
674d6fa8b7fb89b576db0b9461158cd89539efb0, Concluído — Atual.
Fonte seletiva: codex/assistente-homologacao, f904a0a0276a1d47c9e5f9a37fd6cf38a807700a.
Branch de trabalho: codex/institucional-parcial, worktree isolado .worktrees/institucional-parcial.
Não houve merge, commit, push ou implantação. As branches anteriores não foram alteradas.

## Escopo
Identidade STS DETOX IÔNICO, equipamento DETOX BIOEQUILÍBRIO, conceito e trajetória,
material de estudo, abordagem responsável, vitrine dos quatro livros e guia de eletrodos.
Os nove links dos modelos abrem atendimento humano pelo WhatsApp, sem coletar dados
nem calcular frete. Preços informativos aprovados preservados; nenhuma venda online.
A montagem SPA foi corrigida sem montar o Assistente; WhatsApp móvel no fluxo da página.

Home e Livros são as únicas rotas. Biblioteca original e nove vídeos preservados.
Novas mídias: dois PNG de eletrodos e Vídeo Tavares.mp4. Nenhuma mídia foi editada.
Não incorporados: VideosDestaque, loja, checkout, frete, pagamentos, webhook,
Assistente Tavares, servidor, cron, base privada, credenciais ou ferramentas de homologação.

## Construção e publicação futura
Node 22 >=22.12 apenas para ferramentas de build; npm ci e npm run verificar.
package.json, lockfile, árvore de rotas e vite.hostinger.config.ts mantidos da base.
Produção serve somente build/ como SPA estática, com fallback de rotas existente.
Não serve a raiz do projeto, não requer npm start, MySQL, variáveis privadas ou API própria.
Não apontar a hospedagem para este worktree nem enviar a branch publicada nesta etapa.
Antes de futura publicação: revisar diff, testes e destino, preservar implantação anterior
e obter autorização. O destino publicado atual usa a branch backup-site-vite-2026-11-03;
os registros antigos sobre main nos guias abaixo são históricos.

## Validação
Resultados finais serão registrados em VALIDACAO.md. Build não comprova reprodução
YouTube, disponibilidade contínua da API externa ou funcionamento em celular físico.

## Inventário final

Alterados em relação à base:

- README.md
- VIDEOS.md
- docs/CONTEXTO.md
- docs/DESTINOS.md
- docs/GITHUB_HOSTINGER.md
- docs/VALIDACAO.md
- index.html
- src/components/SiteFooter.tsx
- src/components/SiteHeader.tsx
- src/components/WhatsAppFab.tsx
- src/lib/whatsapp.ts
- src/routes/__root.tsx
- src/routes/index.tsx
- src/routes/livros.tsx
- src/styles.css

Novos arquivos:

- docs/INSTITUCIONAL_PARCIAL.md
- public/assets/Eletrodo 250 Sessões com Conector P10.png
- public/assets/Guia de Eletrodos e Conectores.png
- public/assets/Vídeo Tavares.mp4
- src/components/AbordagemResponsavel.tsx
- src/components/ConceitoBioequilibrio.tsx
- src/components/ConjuntoBioequilibrio.tsx
- src/components/EletrodosConexoes.tsx
- src/components/VitrineLivros.tsx

Resultados detalhados em VALIDACAO.md. Prévia temporária encerrada após conferência.
