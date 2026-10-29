# Correção dos alertas de dependências

## Seroval — 29/10/2026

`npm.cmd explain seroval` identificou a cadeia:
`@tanstack/react-router@1.170.18` → `@tanstack/router-core@1.171.15`
→ `seroval@1.6.7`. O core exige `^1.5.4`; `seroval-plugins@1.6.7`
aceita o peer `seroval@^1.0`.

Foi adicionado o override exato `seroval: 1.7.2`, compatível com ambas as
faixas e com Node 22 (o pacote exige Node >=20). O lockfile foi atualizado
com `npm.cmd install --package-lock-only --ignore-scripts`, sem `--force`.
A comparação de todas as entradas do lockfile confirmou que somente
`node_modules/seroval` mudou, de 1.6.7 para 1.7.2. As demais versões,
inclusive router, plugins, Vite e overrides anteriores, foram preservadas.

A auditoria anterior apontava o pacote com gravidade alta e avisos de
injeção e desserialização/negação de serviço. O relatório atualizado está
em `AUDITORIA-NPM.json`; os testes locais estão em `VALIDACAO.md`.
As verificações foram realizadas localmente, antes do envio ao GitHub.
O envio e o destino são acompanhados em `DESTINOS.md`; nenhuma integração
com a Hostinger foi realizada nesta etapa.

## Histórico — 28/10/2026

O proprietário apresentou uma captura do painel da Hostinger com sete alertas
distribuídos entre Vite 8.1.5, Zod 3.25.76 e source-map-js 1.2.1. A auditoria
inicial do npm confirmou três pacotes afetados, com sete avisos relacionados.
Os contadores diferem porque um mesmo pacote pode ter vários avisos.

## Alterações aplicadas

| Dependência | Antes | Entrega corrigida |
| --- | --- | --- |
| Vite | 8.1.5 | 8.1.6, correção na mesma linha de versão |
| source-map-js (transitiva) | 1.2.1 | 1.2.2, fixada em overrides |
| Zod | 3.25.76 | Removida: não há import/uso no código e era dependência direta isolada |

O diff dos lockfiles foi conferido: apenas as versões de Vite e source-map-js
mudaram, e a entrada de Zod foi removida. As demais versões foram preservadas.
O override anterior de rolldown 1.2.1 foi mantido.

Referências dos avisos:

- [Vite/launch-editor e versões corrigidas](https://github.com/vitejs/launch-editor/security/advisories/GHSA-r825-w8mm-5pxw)
- [source-map-js corrigido em 1.2.2](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
- [Zod: consumo de memória](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)

## Validação

- Instalação limpa do lockfile: sucesso, 341 pacotes instalados.
- `npm run verificar`: TypeScript e build passaram.
- `npm audit --json`: zero vulnerabilidades conhecidas na consulta realizada.
- Resposta da auditoria incluída em `AUDITORIA-NPM.json`.
- JS e CSS gerados mantiveram os mesmos nomes/hash de conteúdo do build
  anterior. Não foram alterados conteúdo, layout, playlists ou contatos.

O resultado da auditoria reflete o banco de avisos do npm na data da consulta;
não é uma garantia de ausência de toda falha possível.

## Aplicar na hospedagem ou no GitHub

Use o pacote corrigido completo para reimplantar por ZIP, mantendo Node 22,
comando de build `npm run build` e saída `build`. Para GitHub, integre os arquivos
atualizados ao repositório do cliente preservando seu histórico e as alterações
posteriores. A correção de dependências está em `package.json` e
`package-lock.json`; ambos devem entrar no commit.

No computador do cliente, após atualizar esses arquivos:

```powershell
npm.cmd ci
npm.cmd run verificar
npm.cmd audit
```

Depois da implantação, solicite/aguarde nova verificação de segurança no painel
da Hostinger e confirme o resultado. Não foi feito acesso autenticado ao painel
para verificar o scanner ou publicar esta correção. A imagem, por si só, não
confirma que houve exploração dessas falhas.

Os ZIPs anteriores foram preservados como versões históricas. Para instalação
e implantação atualizadas, utilize o pacote com a correção de segurança.
