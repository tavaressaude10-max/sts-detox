# STS Detox BioEquilíbrio — entrega ao cliente

Projeto completo para continuar o desenvolvimento em outro computador e conta
do Codex e conectar o GitHub do cliente à Hostinger. Preparado em 28/10/2026.

Comece por este arquivo. O contexto técnico está em `docs/CONTEXTO.md`, as
instruções para o agente em `AGENTS.md` e a publicação em `docs/GITHUB_HOSTINGER.md`.

Esta entrega recebeu a correção de dependências descrita em `docs/SEGURANCA.md`:
Vite 8.1.6, source-map-js 1.2.2 e remoção do Zod não utilizado. A auditoria do npm
retornou zero vulnerabilidades conhecidas em 28/10/2026. Em 29/10/2026,
foi aplicada também a correção transitiva do Seroval para 1.7.2,
preservando as demais versões. Consulte os resultados atuais em
`docs/VALIDACAO.md` e `docs/AUDITORIA-NPM.json`.

## 1. Instalar no computador do cliente

Instale Node.js **22, versão 22.12 ou superior da linha 22**, e Git:

- https://nodejs.org/en/download
- https://git-scm.com/downloads

Extraia o pacote em uma pasta própria, por exemplo `C:\Projetos\sts-detox`.
Abra um terminal PowerShell nessa pasta, que deve conter `package.json`.

```powershell
node --version
npm.cmd --version
git --version
npm.cmd run preparar
npm.cmd run dev
```

`preparar` instala as dependências com `npm ci`, verifica TypeScript e gera o
build. `dev` inicia o site local; abra o endereço mostrado no terminal.
Para encerrar o servidor, pressione Ctrl+C. No macOS/Linux, use `npm` no lugar
de `npm.cmd`.

## 2. Abrir na outra conta do Codex

Abra a pasta extraída como projeto local e inicie um chat com:

> Este é o projeto STS Detox BioEquilíbrio. Leia AGENTS.md, README.md,
> docs/CONTEXTO.md e docs/GITHUB_HOSTINGER.md antes de alterar arquivos.
> Continue a partir deste código. A reimplantação por ZIP foi confirmada pelo
> proprietário em 28/10/2026. O objetivo é atualizar pela máquina do cliente,
> enviar ao GitHub dele e publicar automaticamente na Hostinger.
> Verifique os destinos registrados em docs/DESTINOS.md antes de qualquer push.

O pacote transporta os arquivos e um resumo das decisões. Não inclui as
conversas, sessões, permissões ou autenticações da conta anterior.

## 3. Conectar GitHub e Hostinger

Siga `docs/GITHUB_HOSTINGER.md`. A configuração é feita uma vez, com acesso às
contas do cliente. Os endereços ainda não informados estão em `docs/DESTINOS.md`.
Não há conexão remota já ativada neste pacote.

## 4. Atualizações depois da configuração inicial

Com o repositório clonado, na branch de publicação, e sem alterações locais:

```powershell
git status
git pull --ff-only
```

Edite os arquivos e confira localmente com `npm.cmd run dev`. Depois:

```powershell
npm.cmd run verificar
git diff
git status
git add .
git diff --cached --stat
git commit -m "Atualiza conteúdo do site"
git push
git rev-parse HEAD
```

Confira na Hostinger se o commit foi implantado com sucesso. Salvar um arquivo
localmente não publica o site; a publicação depende do push na branch conectada.
Se `git status` mostrar alterações antes do pull, revise e salve-as em commit
antes de atualizar. Não descarte trabalho para conseguir executar o pull.

## Comandos disponíveis

| Comando | Uso |
| --- | --- |
| `npm.cmd ci` | Instalar exatamente o lockfile após extrair/clonar |
| `npm.cmd run dev` | Desenvolver e visualizar localmente |
| `npm.cmd run typecheck` | Verificar TypeScript |
| `npm.cmd run build` | Gerar `build/` para produção |
| `npm.cmd run verificar` | TypeScript e build |
| `npm.cmd run preparar` | Instalação, TypeScript e build |
| `npm.cmd run preview` | Conferir o build gerado localmente |

Não há banco de dados ou backend próprio neste projeto. A instalação não exige
chave da OpenAI. As dependências externas do site estão em `docs/CONTEXTO.md`.
