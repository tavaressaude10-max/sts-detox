// Playlists do STS Detox. Para trocar o conteúdo, altere apenas os IDs.
export const videoPlaylists = [
  {
    key: "apresentacao",
    label: "Apresentação",
    id: "PLJa8ZRa8ZUeA",
  },
  {
    key: "aulas",
    label: "Aulas",
    id: "PLNVnxCmMlvKY",
  },
  { key: "diversos", label: "Diversos", id: "PLDJg_muusPHw" },
] as const;

export const playlistApiUrl =
  "https://www.irismacro.com/API-youtube-/videos_playlist_dinamico_final.php";
