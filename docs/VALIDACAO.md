# Validação local

## Correção do Seroval — 29/10/2026

Ambiente: Windows, Node 22.23.4, npm 10.9.9 e Git 2.56.0.windows.3.

| Verificação | Resultado |
| --- | --- |
| `npm.cmd explain seroval` antes | 1.6.7 via `@tanstack/router-core@1.171.15` |
| Comparação completa do lockfile | Somente Seroval mudou: 1.6.7 → 1.7.2 |
| `npm.cmd ci` | Sucesso, 341 pacotes instalados |
| `npm.cmd run verificar` | Sucesso: TypeScript e build, saída 0 |
| `npm.cmd audit` | Zero vulnerabilidades conhecidas, saída 0 |
| `npm.cmd audit --json` | Relatório salvo em `AUDITORIA-NPM.json` |
| `npm.cmd explain seroval` depois | 1.7.2, override aplicado ao core e peer dos plugins |
| JS/CSS do build | `index-CsRTyNx9.js` e `styles-DbjY4oC8.css`, mesmos nomes anteriores |

Testes no navegador local em `http://localhost:5173/`:

- Apresentação (`PLJa8ZRa8ZUeA`): lista com 1 vídeo, miniatura e reprodução
  de `GuCLmhi-Ed8` confirmadas, com imagem em movimento e legendas.
- Aulas (`PLNVnxCmMlvKY`): lista com 1 vídeo e reprodução de `lXHNB1CYZd4`
  confirmadas; player mostrou 3 segundos decorridos e controle de pausa.
- Diversos (`PLDJg_muusPHw`): lista com 1 vídeo e reprodução de `aEmVtrrURT0`
  confirmadas; player mostrou 9 segundos decorridos de 32 segundos.
- Trocar a playlist removeu o player anterior. Iniciar vídeo local removeu
  o iframe YouTube; iniciar YouTube pausou todos os vídeos locais.
- Galeria: os nove arquivos `video-1.mp4` a `video-9.mp4` iniciaram reprodução,
  com `paused=false` e avanço de `currentTime`. O vídeo 04 apresentou
  "Não foi possível abrir a mídia" no primeiro carregamento; após recarregar
  a página, reproduziu e avançou de 0,19 para 4,62 segundos. Causa não determinada.
- `/livros`: acesso direto e renderização conferidos; três capas, textos,
  links de aquisição e abertura do prefácio presentes e funcionais.

Limites: testes de início e avanço de reprodução, sem assistir integralmente
a todos os vídeos; compras e mensagens externas não foram executadas.
O console de desenvolvimento apresentou o aviso preexistente de `<html>`
dentro de `<div>` na estrutura SPA. Não foi alterado nesta correção transitiva.
Avisos de depreciação de tsconfck, Recharts e ESLint e recomendação do Vite
sobre tsconfig paths não impediram as verificações. Nenhum `--force` foi usado.

## Publicação GitHub/Hostinger — 29/10/2026

Cliente autorizou publicação e automação em `main`. Commit de conteúdo:
`01db87f0a2ab79e4130e2595f68347b7643a5f1c`. A Hostinger confirmou o checkout
desse commit no build `01a187ef-c565-716e-8f46-98c82397566a` e a integração
automática ativa. Backup da fonte anterior e SHA256 em `DESTINOS.md`.

Verificação HTTPS pública: home servindo título “STS DETOX BioEquilíbrio”,
JS `index-BNSAfYew.js` e CSS `styles-Bz0x6WdW.css`. O JS publicado contém
“STS DETOX BioEquilíbrio” e conteúdo de livros, sem “Galeria de demonstrações”.
Acesso direto a `/livros` retornou HTTP 200.

Limites: o navegador remoto apresentou timeout de conexão; a conferência
visual desta versão foi feita localmente antes de publicar. Consultas ao
estado final do build via MCP apresentaram HTTP 500 e timeout ao ler logs,
apesar de o domínio já servir os novos arquivos. Não foi repetido o teste
de reprodução nesta publicação. A automação está configurada, mas seu
acionamento por um push posterior ainda precisa de confirmação.

## Ajustes visuais — 29/10/2026

- Removida a seção “Galeria de demonstrações”; arquivos de mídia preservados.
- Textos do site padronizados para “DETOX”, inclusive metadados, mensagens
  pré-preenchidas e títulos/descrições da biblioteca externa.
- `npm.cmd run verificar`: TypeScript e build passaram. `git diff --check`
  sem erros. Dependências não alteradas nesta etapa.
- Home e `/livros` conferidas no navegador local; nenhuma ocorrência de
  “Detox” nos textos renderizados. Elemento `#galeria` ausente na home.
- Conteúdo gravado dentro de imagens/vídeos e do player externo não foi editado.
  Reprodução não foi testada novamente nesta alteração de apresentação.
- Sem push ou publicação nesta etapa.

## Histórico da entrega — 28/10/2026

## Estado atual após correção de segurança

Instalação limpa concluída com 341 pacotes. TypeScript e build passaram com
Vite 8.1.6. Auditoria npm: zero vulnerabilidades conhecidas. Detalhes em
`SEGURANCA.md` e resposta em `AUDITORIA-NPM.json`. Os nomes/hash dos arquivos
JS/CSS gerados permaneceram iguais aos registrados abaixo.

## Registro da validação inicial, anterior à correção

Executada na pasta independente `entrega-cliente-sts-detox`:

| Verificação | Resultado |
| --- | --- |
| Instalação limpa: `npm.cmd ci --no-audit --no-fund` | Sucesso, 342 pacotes instalados |
| `npm.cmd run verificar` | Sucesso, código de saída 0 |
| `npm run typecheck` (incluído em verificar) | Sucesso |
| `npm run build` (incluído em verificar) | Sucesso, saída `build/` |
| JS gerado | `build/assets/index-CsRTyNx9.js` |
| CSS gerado | `build/assets/styles-DbjY4oC8.css` |

A instalação inicial no ambiente restrito foi interrompida sem concluir. A
instalação limpa com acesso à rede foi concluída. Isso não indica falha do
projeto na máquina do cliente. A auditoria npm não foi executada nesse teste.

O npm informou avisos de depreciação em algumas dependências e o Vite informou
que a resolução de caminhos já pode ser nativa. Esses avisos não impediram a
instalação ou o build. As versões existentes foram preservadas para a entrega;
atualizações de dependências devem ser tratadas e testadas separadamente.

O ZIP contém fontes e documentação, sem `node_modules` e sem `build`. A máquina
do cliente e a Hostinger recriam essas pastas usando os comandos documentados.

Não foram executados push para o GitHub, autorização da integração Hostinger,
teste de implantação automática ou teste visual ponta a ponta nesta entrega.
Esses passos dependem das contas do cliente e constam em CHECKLIST/DESTINOS.
O proprietário confirmou que a reimplantação anterior por ZIP funcionou e
confirmou o domínio `https://stsdetox.com.br`.

## DETOX PET — 29/10/2026

- Quarto livro incluído na home e em `/livros`, com capa oficial local.
- Capa e botão “Ver na Amazon” apontam para `https://www.amazon.com/dp/B0HNWDSW4V`, com `_blank` e `noopener noreferrer`.
- Produto e autor confirmados na página Amazon em navegador.
- `npm ci` concluído; auditoria da instalação: zero vulnerabilidades.
- `npm run verificar` passou (TypeScript e build).
- Navegador local: quatro capas carregadas em 1440 px; grade de uma coluna em 390 px sem overflow horizontal; cartão DETOX PET conferido em `/livros` no celular.
- Alterações locais anteriores sobre material de estudo foram preservadas e excluídas deste commit.
- Publicação usa integração Hostinger existente: `tavaressaude10-max/sts-detox`, `main`, Node 22, saída `build`.
