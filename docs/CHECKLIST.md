# Checklist da transferência

## Preparação do pacote

- [x] Fontes e assets usados pelo site copiados.
- [x] `package.json`, `package-lock.json`, configuração Vite e TypeScript incluídos.
- [x] Contexto e instruções para a outra conta documentados.
- [x] IDs das três playlists reais incluídos.
- [x] `.gitignore`, `.gitattributes` e `.nvmrc` incluídos.
- [x] Comandos de instalação, validação, Git e implantação documentados.
- [x] Instalação limpa, TypeScript e build passaram; ver `VALIDACAO.md`.

## Executar com as contas do cliente

- [ ] Preencher os destinos reais em `DESTINOS.md`.
- [x] Instalar Node 22 >=22.12 e Git na máquina do cliente.
- [x] Extrair/abrir o projeto e executar `npm.cmd run preparar`.
- [x] Conferir visualmente o site local (resultados e limites em `VALIDACAO.md`).
- [x] Criar/conferir repositório do cliente e enviar o código preservando histórico (remoto vazio confirmado; primeiro push em 29/10/2026).
- [ ] Conectar esse repositório ao site correto na Hostinger.
- [ ] Confirmar root, Node, build, saída `build` e branch.
- [ ] Confirmar o primeiro deploy e suas rotas no domínio.
- [ ] Validar atualização automática por novo commit/push.
- [ ] Registrar commit, data e resultado do teste em `DESTINOS.md`.

A conclusão dos itens de preparação não confirma que as contas externas estão
conectadas. Nenhum token ou sessão é transferido com o pacote.
