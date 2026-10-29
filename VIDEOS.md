# Biblioteca de vídeos

A seção `#videos` da home usa as playlists do STS Detox:

- Apresentação: `PLJa8ZRa8ZUeA`
- Aulas: `PLNVnxCmMlvKY`
- Diversos: `PLDJg_muusPHw`

Para substituir o conteúdo, altere os campos `id` em `src/lib/video-playlists.ts`.
Use somente o valor depois de `list=` no link da playlist do YouTube.
Os rótulos da navegação também podem ser editados nesse arquivo.

As miniaturas e os títulos são carregados pela mesma API pública do SITE_2026,
declarada como `playlistApiUrl` nesse arquivo. Essa API é uma dependência externa
em `www.irismacro.com`; não há chave do YouTube no frontend. As playlists devem
estar acessíveis publicamente e os vídeos devem permitir incorporação.

O player só é carregado ao clicar. A troca de playlist encerra o vídeo anterior.
Se a API falhar ou não retornar vídeos públicos, a seção oferece o player nativo
da playlist, um link para o YouTube e a opção de tentar carregar novamente.
A galeria de sessões reais foi removida da home em 29/10/2026 a pedido do
cliente. Os nove arquivos locais foram preservados; alguns continuam usados
em outras seções. A biblioteca de playlists permanece em `#videos`.
Títulos e descrições exibidos pela biblioteca padronizam a palavra “DETOX”.

Execute `npm run build` para gerar a pasta `build` para a hospedagem.
Esta entrega é independente das pastas antigas do computador de origem.
Consulte `docs/CONTEXTO.md` para o histórico e `docs/GITHUB_HOSTINGER.md` para publicar.
