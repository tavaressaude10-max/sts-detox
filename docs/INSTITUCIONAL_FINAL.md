# Versão institucional final — 23/11/2026

Branch: `codex/institucional-final`. Worktree: `.worktrees/institucional-final`.
Preparação exclusivamente local; sem push, merge em main, deploy ou acesso à Hostinger.

## Composição

- Base estática `5df02e1` de `codex/institucional-integrado`, incluindo as três alterações locais em Home e biblioteca de vídeos.
- Assistente público de `.worktrees/assistente-vite-publico`: dados, mecanismo, componente, CSS, documento aprovado e teste preservados. 22 entradas numeradas: 21 respostas fixas e entrada 19 de encaminhamento humano. Sem IA, API ou banco; conversa em memória até recarregar.
- Seção Nosso Canal no YouTube de `.worktrees/loja-finalizacao-local`, com seus dois links originais.
- Nossa História da mesma worktree: oito fotografias, apresentação clicável e vídeo local atualizado. Rota registrada manualmente e link no rodapé de todas as páginas.
- Home, Livros, cores, textos, capas e nove vídeos originais preservados. Aquisição de livros continua por links externos; consultas de eletrodos continuam por WhatsApp humano.
- Nenhum servidor, checkout, cadastro comercial, painel administrativo, API privada ou adaptador de pagamentos incorporado. Loja e seus testes permanecem nas worktrees originais.

## Preservação anterior

Reutilizada, sem refazer: `.worktrees/preservacao-institucional-2026-11-23T14-51-54-863Z`.
Contém manifesto, cópias verificadas de 135 arquivos das sete worktrees, diffs e bundle Git validado. Não inclui dependências/builds nem duplica credenciais e bancos ignorados; estes permanecem nos locais originais. Nenhuma worktree de origem foi editada nesta integração.

## Execução

Node 22 >=22.12; `npm ci`; `npm run verificar`; `npm run test:assistant`; `npm run test:institutional`.
Saída exclusiva: `build/`. Prévia: `npm run preview -- --host 127.0.0.1 --port 4186 --strictPort`.
Não executar `npm start`, migrações ou scripts comerciais; eles não pertencem à entrega.

## Publicação futura e reversão — somente após aprovação

1. Confirmar no painel o domínio, branch, commit/artefato ativo, automação e configuração. Não presumir `main`: os registros antigos divergem e não foram revalidados nesta etapa.
2. Registrar a versão ativa e guardar seu artefato/configuração para reversão, antes de qualquer mudança. A preservação local não é backup da hospedagem.
3. Conferir remoto `https://github.com/tavaressaude10-max/sts-detox.git`, branch e diff. Autorizar explicitamente o push e a eventual implantação automática. Não fazer merge em main ou force push.
4. Hospedagem estática Vite: Node 22 para build, instalação `npm ci`, comando `npm run build`, saída `build`, raiz do repositório. Sem backend, MySQL ou segredos obrigatórios. Nunca servir a raiz dos fontes.
5. Confirmar fallback SPA para `/livros` e `/nossa-historia`. O `.htaccess` cobre Apache; seu efeito depende do servidor real. Em outro servidor, configurar o equivalente antes de liberar.
6. Conferir HTTPS, rotas diretas, mídias, Assistente, links e ausência de comércio no destino. `/compra`, `/admin` e `/api` não possuem implementação nesta SPA; Apache os recusa explicitamente. A prévia Vite pode responder index.html com HTTP 200 e exibir a página 404 para caminhos desconhecidos.
7. Se houver regressão, restaurar o artefato/commit e a configuração registrados no passo 2 pelo mecanismo existente de implantação. Não restaurar bancos nem publicar o backend da loja. Não inventar procedimento FTP paralelo.

## Limites

Nenhuma consulta ao painel ou alteração de produção. Testes locais não comprovam configuração remota, celular físico, disponibilidade futura da API IRISMACRO, YouTube ou páginas externas. O build não certifica reprodução dos embeds.

## Validação e conferência final — 23/11/2026

- Testes executados na retomada anterior e aprovados: `npm run verificar`
  (TypeScript e build), `npm run test:assistant` e `npm run test:institutional`.
  Não repetidos na conferência final; nenhum código foi alterado depois deles.
- Assistente: 21 textos exatos, 376 variantes, 15 casos desconhecidos/ambíguos
  e encaminhamento WhatsApp aprovados.
- Entrega: três rotas públicas, nove vídeos originais, oito fotografias,
  24 referências locais e 38 arquivos de build verificados, sem comércio
  ou arquivos privados. Dependências e lockfile não foram alterados.
- Revisão final do diff sem erros de whitespace. Loja, checkout, backend,
  painel e APIs comerciais ausentes desta versão. Apenas `/`, `/livros` e
  `/nossa-historia` estão registradas; caminhos desconhecidos exibem 404.
  O `.htaccess` também recusa `/compra`, `/admin` e `/api` em Apache com
  mod_rewrite. Isso confirma a ausência da loja nesta entrega, não o estado
  do site remoto, que não foi acessado.
- Conferência visual ainda pendente: navegador interno apresentou timeout;
  a ferramenta de controle do Windows interrompeu a verificação por não
  conseguir identificar a URL com segurança. Reprodução de vídeos/YouTube
  e interações visuais não foram confirmadas nesta integração.
- Avisos não impeditivos do build: bundle acima de 500 kB e recomendação
  de resolução nativa de caminhos em lugar de vite-tsconfig-paths.
- Integração registrada em commit local na branch `codex/institucional-final`.
  Sem push, merge, publicação ou acesso à Hostinger. Antes de publicar,
  permanecem a revisão visual e as verificações de destino, reversão e
  configuração estática descritas acima, mediante autorização específica.
