import { useEffect, useState } from "react";
import { ListVideo } from "lucide-react";
import { VideoPlaylistBrowser } from "@/components/VideoPlaylistBrowser";
import { videoPlaylists } from "@/lib/video-playlists";

export function VideoPlaylists() {
  const [activeKey, setActiveKey] = useState<string>(videoPlaylists[0].key);
  const [cintaRequest, setCintaRequest] = useState(0);
  useEffect(() => {
    const openCinta = () => {
      if (window.location.hash !== "#video-cinta-biovibracional") return;
      setActiveKey("apresentacao");
      setCintaRequest((value) => value + 1);
      document.getElementById("video-cinta-biovibracional")?.scrollIntoView({ block: "start" });
    };
    openCinta();
    window.addEventListener("hashchange", openCinta);
    return () => window.removeEventListener("hashchange", openCinta);
  }, []);
  const active =
    videoPlaylists.find((playlist) => playlist.key === activeKey) ??
    videoPlaylists[0];

  return (
    <section
      id="videos"
      aria-labelledby="videos-heading"
      className="scroll-mt-24 bg-surface py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="eyebrow mb-4 flex items-center gap-2 text-aqua">
          <ListVideo className="size-4" aria-hidden="true" /> Biblioteca de
          vídeos
        </p>
        <h2
          id="videos-heading"
          className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl"
        >
          Explore os vídeos
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          Escolha uma playlist e navegue pelas miniaturas para assistir ao
          conteúdo aqui no site.
        </p>
        <div
          role="group"
          aria-label="Escolher playlist"
          className="my-8 flex flex-wrap gap-3"
        >
          {videoPlaylists.map((playlist) => (
            <button
              key={playlist.key}
              type="button"
              aria-pressed={active.key === playlist.key}
              aria-controls="playlist-conteudo"
              onClick={() => setActiveKey(playlist.key)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-aqua ${
                active.key === playlist.key
                  ? "bg-deep text-aqua-soft"
                  : "bg-background text-foreground ring-1 ring-border hover:bg-aqua-soft/60"
              }`}
            >
              {playlist.label}
            </button>
          ))}
        </div>
        <div id="video-cinta-biovibracional" className="scroll-mt-24" />
        <div id="playlist-conteudo">
          <VideoPlaylistBrowser
            key={active.id}
            playlistId={active.id}
            title={active.label}
            directVideoId={active.key === "apresentacao" && cintaRequest > 0 ? "oEDxOYeRHDo" : undefined}
            playRequest={cintaRequest}
          />
        </div>
      </div>
    </section>
  );
}
