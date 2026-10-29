# Publicar pelo GitHub do cliente

Atualização de 29/10/2026: o cliente autorizou a publicação e a integração
automática. O MCP confirmou `tavaressaude10-max/sts-detox`, branch `main`,
ativa para `stsdetox.com.br`. Push em `main` agora pode publicar imediatamente.
Os avisos de não conectar nas seções históricas abaixo foram superados por
essa autorização. Consulte `DESTINOS.md` para destino e backup anterior.

Fluxo desejado: computador → commit/push no GitHub → build/publicação na
Hostinger. A integração nativa da Hostinger executa o deploy; não foi incluído
um segundo publicador por FTP ou GitHub Actions.

## 1. Criar o repositório do cliente

### Preparação local sem publicação — 29/10/2026

Na conferência inicial, a pasta não era um repositório Git. O cliente depois
informou `https://github.com/tavaressaude10-max/sts-detox.git`; o remoto foi
consultado, estava vazio e o Git local foi inicializado em `main` com esse
`origin`. Em futuras integrações, antes de inicializar um histórico,
obtenha a URL HTTPS do cliente e confira o remoto com
`git ls-remote --symref URL_DO_CLIENTE HEAD` e `git ls-remote --heads URL_DO_CLIENTE`.
Falha de autenticação/acesso não comprova que o remoto esteja vazio.
Se existir histórico, siga a seção de clone e integração abaixo; preserve
os commits e as alterações do cliente. Só use a inicialização de repositório
novo quando o destino vazio estiver confirmado. Confirme nome e e-mail de
commits com o cliente antes de configurá-los.

O cliente autorizou o primeiro commit e push em `main`, sem force push,
mas não autorizou conectar a Hostinger. Não configure essa integração.
Em repositórios já conectados, push pode resultar em publicação automática.
A correção do Seroval e os
resultados locais estão em `SEGURANCA.md` e `VALIDACAO.md`.

Se ainda não houver repositório, crie um repositório vazio no GitHub do cliente
(por exemplo, `sts-detox`), sem README, licença ou `.gitignore` inicial. A entrega
já contém esses arquivos necessários, exceto licença de uso que cabe ao titular.
Copie a URL HTTPS indicada pelo GitHub. O repositório pode ser privado, com
acesso concedido à integração da hospedagem.

Na pasta extraída, execute estes comandos apenas para **repositório novo e
vazio**, substituindo os dados quando o PowerShell perguntar:

```powershell
git init -b main
git config user.name (Read-Host 'Nome do cliente para os commits')
git config user.email (Read-Host 'Email de commits do GitHub do cliente')
npm.cmd run preparar
git status
git add .
git diff --cached --stat
git commit -m "Importa site STS Detox e documentação de manutenção"
$repositorioCliente = Read-Host 'Cole a URL HTTPS do repositório do cliente'
git remote add origin $repositorioCliente
git remote -v
git push -u origin main
```

Confirme proprietário e repositório antes do push. A autenticação pode abrir o
navegador; use a conta do cliente. Esses comandos não inserem token no projeto.
Se o Git pedir autenticação, conclua pelo método disponibilizado pelo GitHub.

### Se o repositório já existir

Não inicialize outro histórico nem force o push. Clone o repositório primeiro,
confira sua branch, copie os arquivos desta entrega para o clone e revise o
diff. Preserve `.git` e alterações mais recentes do cliente. Faça a integração
em branch de trabalho e revisão quando houver conteúdo que precise conciliar.

Para clonar no computador, em uma pasta pai sem `sts-detox` existente:

```powershell
$repositorioCliente = Read-Host 'Cole a URL HTTPS do repositório do cliente'
git clone $repositorioCliente sts-detox
Set-Location sts-detox
git remote -v
git branch --show-current
npm.cmd run preparar
```

Registre a URL e a branch reais em `docs/DESTINOS.md`. Se o repositório usa outra
branch, use-a na integração em vez de assumir `main`.

## 2. Vincular na Hostinger

No painel do site existente, use a conexão com GitHub, autorize a conta do
cliente e selecione repositório/branch. A documentação atual indica a opção
**Connect to GitHub** no menu do dashboard. Revise o destino antes de confirmar:
a escolha do repositório pode iniciar uma implantação.

Configure para este projeto:

| Campo | Valor da entrega |
| --- | --- |
| Framework | Vite / frontend React |
| Node.js | 22 (>=22.12) |
| Gerenciador | npm |
| Diretório raiz | Raiz do repositório, onde está `package.json` |
| Build | `npm run build` |
| Diretório de saída | `build` |
| Variáveis obrigatórias | Nenhuma nesta cópia |
| Branch | A mesma escolhida no GitHub e registrada em `DESTINOS.md` |

O frontend não exige processo servidor próprio ou `server.js`. Preserve as
dependências de desenvolvimento durante a instalação, pois o Vite é usado no
build. Os arquivos precisam ficar na raiz do repositório, não dentro de outra
pasta `hostinger-app-clean`.

Ative a implantação automática para a branch escolhida e acompanhe o resultado.
A fonte deve ser GitHub; enviar um ZIP por si só não cria o vínculo automático.

Fonte: [Hostinger — aplicações e integração GitHub](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

## 3. Confirmar o primeiro deploy

Compare o commit mostrado no GitHub com o da implantação. Abra o domínio e
verifique a home, `/livros`, acesso direto/atualização de `/livros`, o menu móvel,
as três playlists, reprodução por clique, vídeos locais e links de contato.
O `.htaccess` cobre Apache; em outro servidor confirme o fallback de SPA se a
rota direta `/livros` retornar 404.

Com a implantação inicial funcionando, faça uma alteração pequena e aprovada,
valide e envie um novo commit pela rotina do README. Confirme que a Hostinger
publicou esse commit sem envio manual de ZIP. Registre o resultado em DESTINOS.
Não considere a automação testada antes dessa confirmação.

## 4. Reimplantar e recuperar uma versão

Quando a origem é GitHub, a reimplantação usa o código da branch selecionada.
Na rotina normal, acompanhe a implantação disparada pelo push. Para reenviar o
mesmo código, use a reimplantação no painel e confira as configurações.

Se precisar desfazer um commit já publicado, identifique o commit problemático
com `git log --oneline -10`, confirme que o trabalho local está salvo e use
`git revert ID_DO_COMMIT` (substitua pelo ID correto), valide e faça push.
Isso gera um novo commit sem reescrever o histórico. Commits de merge exigem
análise específica; não aplique o exemplo de revert cegamente a um merge.

Fonte: [Hostinger — reimplantação](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/).

## Problemas frequentes

| Sintoma | O que conferir neste projeto |
| --- | --- |
| `package.json` não encontrado | Arquivos fonte na raiz; ZIP compilado não é fonte |
| Pasta de saída não encontrada | Configuração real é `build`, não `dist` |
| Vite/comando não encontrado | Instalação completa, incluindo devDependencies |
| `npm ci` falha | Copiar a mensagem inteira e conferir lockfile, Node e rede |
| Push não publica | Branch/destino e automação no painel; examine o log |
| Publicou conteúdo antigo | Commit implantado, domínio acessado e cache |
| Playlist sem miniaturas | API externa de listagem; tentar novamente/fallback |
| YouTube indisponível | Visibilidade/incorporação do vídeo no YouTube |

Se um push for recusado porque o remoto tem commits novos, pare e integre o
histórico com revisão. Não use `git push --force` para contornar a mensagem.
