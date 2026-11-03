import { useEffect, useState } from "react";

type VideoDestaque = { titulo: string; youtubeId: string };
// Preencher somente após identificar os dois vídeos aprovados pelo proprietário.
// As playlists anteriores ficam preservadas, sem apresentar uma oferta de aulas.
const videos: VideoDestaque[] = [];
const canal = "https://www.youtube.com/@severinotavaresdasilva6514";

export function VideosDestaque() {
  const [ativo, setAtivo] = useState<string | null>(null);
  useEffect(() => {
    const parar = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) setAtivo(null);
    };
    document.addEventListener("play", parar, true);
    return () => document.removeEventListener("play", parar, true);
  }, []);
  return (
    <section
      id="videos"
      aria-labelledby="videos-heading"
      className="scroll-mt-24 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <p className="eyebrow mb-4 text-aqua">Vídeos e experiências</p>
        <h2
          id="videos-heading"
          className="font-display text-3xl font-bold leading-tight sm:text-4xl"
        >
          Conheça também nossos vídeos
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
          Além dos conteúdos apresentados neste site, compartilhamos vídeos
          sobre DETOX IÔNICO, DETOX BIOEQUILÍBRIO, conhecimento, experiências,
          eventos e outros momentos da nossa trajetória.
        </p>
        {videos.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-3xl gap-10">
            {videos.map((video) => (
              <article key={video.youtubeId}>
                <h3 className="mb-4 font-display text-xl font-bold">
                  {video.titulo}
                </h3>
                {ativo === video.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                    title={video.titulo}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full rounded-2xl border-0 bg-deep"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .querySelectorAll("video")
                        .forEach((item) => item.pause());
                      setAtivo(video.youtubeId);
                    }}
                    className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-deep text-white"
                    aria-label={`Assistir: ${video.titulo}`}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-65"
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-semibold">
                      Assistir ao vídeo
                    </span>
                  </button>
                )}
                <a
                  className="mt-3 inline-block text-sm text-deep underline underline-offset-4"
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir este vídeo no YouTube
                </a>
              </article>
            ))}
          </div>
        )}
        <p className="mt-8 max-w-3xl text-base leading-8 text-muted-foreground">
          No YouTube você encontra outros vídeos, conteúdos de divulgação,
          momentos especiais e também músicas.
        </p>
        <a
          href={canal}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-aqua-soft"
        >
          Mais vídeos no YouTube
        </a>
      </div>
    </section>
  );
}
