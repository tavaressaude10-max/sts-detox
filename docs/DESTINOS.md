# Destinos e acessos a preencher pelo responsável

## Publicação autorizada — 29/10/2026

O cliente autorizou substituir `stsdetox.com.br` pela versão sem galeria e
com DETOX em maiúsculas, usando `tavaressaude10-max/sts-detox`, branch `main`,
e ativar publicações automáticas. A integração foi confirmada ativa via MCP.
Conta de hospedagem: `u897433725`. Configuração: Vite, Node 22, npm,
script `build`, saída `build`, raiz do repositório.

Backup local da fonte anterior: `stsdetox-backup-fonte-anterior-20261029.zip`,
cópia do ZIP que o build anterior identifica como sua origem.
SHA256: `0895C15529B43CBAAED65F57B0198E1F7D8CA7D55FB5F809638C17D0BA75189A`.
Build anterior: `01a1845b-e71e-73ca-9ddb-7926c4822dcc`.
O backup está fora do Git e permite reconstruir a versão anterior; não é
um snapshot integral da conta da hospedagem.

Primeiro build Git iniciado: `01a187ef-c565-716e-8f46-98c82397566a`, commit
`01db87f0a2ab79e4130e2595f68347b7643a5f1c`. Resultado final em `VALIDACAO.md`.
Os registros abaixo descrevem etapas anteriores e não restringem esta autorização.

## Conferência local — 29/10/2026

`git rev-parse --show-toplevel`, `git status --short --branch` e
`git remote -v` confirmaram, antes da configuração, que esta pasta não pertencia a um repositório Git.
O cliente informou `https://github.com/tavaressaude10-max/sts-detox.git` e
autorizou o primeiro commit e push para `main`, sem force push. Consultas
`git ls-remote --symref ... HEAD` e `git ls-remote --heads ...` concluíram
com sucesso e sem referências: remoto vazio na consulta de 29/10/2026.
A conexão com a Hostinger permanece expressamente fora desta etapa.
Git local inicializado em `main`, com `origin` apontando para a URL confirmada.
Autoria configurada localmente com o nome e e-mail informados pelo cliente.
Primeiro commit enviado em 29/10/2026:
`ac2e8b94ced0f5f123519004a9e42d64963d5038`.
O push para `origin/main` foi concluído sem force; `git ls-remote` confirmou
o mesmo hash no GitHub e `main` passou a acompanhar `origin/main`.
Este registro confirma o envio do código, não uma implantação na Hostinger.

O ambiente local dispõe de Node 22.23.4, npm 10.9.9 e Git 2.56.0.windows.3.
`.gitignore` exclui dependências, builds, ZIPs, logs e arquivos `.env`;
`.gitattributes` classifica os vídeos como binários. O maior asset local
tem aproximadamente 18,26 MiB. A preparação segue `GITHUB_HOSTINGER.md`.

## Destinos informados anteriormente

Estado em 28/10/2026: o cliente informou que a reimplantação por ZIP funcionou.
O domínio foi confirmado como `https://stsdetox.com.br`. A URL do GitHub e a
branch ainda não foram informadas. A integração automática não foi configurada
nesta entrega.

| Item | Valor |
| --- | --- |
| Repositório GitHub do cliente | https://github.com/tavaressaude10-max/sts-detox.git |
| Proprietário/organização do GitHub | tavaressaude10-max |
| Branch GitHub autorizada | main |
| Branch de publicação na Hostinger | NÃO CONFIGURADA/VERIFICADA |
| Conta/plano da Hostinger que hospeda o site | A CONFIRMAR pelo cliente |
| Domínio de produção | https://stsdetox.com.br (confirmado pelo proprietário) |
| Integração GitHub autorizada na Hostinger | PENDENTE DE CONFIGURAÇÃO/VERIFICAÇÃO |
| Primeiro commit enviado ao GitHub | ac2e8b94ced0f5f123519004a9e42d64963d5038 — 29/10/2026 |
| Primeiro commit implantado na Hostinger via GitHub | NÃO REALIZADO NESTA ETAPA |
| Data e resultado do teste automático | A REGISTRAR |

Registre URLs públicas e informações operacionais aqui. As senhas, tokens,
códigos de autenticação e chaves privadas devem ficar fora do repositório.
O titular do YouTube pode ser diferente do titular do GitHub e da Hostinger;
as playlists acessíveis e a incorporação dos vídeos são os requisitos da galeria.
