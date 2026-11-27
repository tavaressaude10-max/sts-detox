import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink, ListVideo, Play, RotateCcw } from "lucide-react";
import { playlistApiUrl } from "@/lib/video-playlists";

const VIDEO_PLAY_EVENT = "sts:video-play";

interface PlaylistVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface PlaylistResponse {
  playlistTitle?: string;
  items?: {
    snippet?: {
      title?: string;
      description?: string;
      resourceId?: { videoId?: string };
      thumbnails?: Record<string, { url?: string }>;
    };
  }[];
}

function toPlaylistVideos(items: PlaylistResponse["items"]): PlaylistVideo[] {
  const seen = new Set<string>();
  return (items ?? []).flatMap(({ snippet }) => {
    const id = snippet?.resourceId?.videoId;
    if (
      !id ||
      !/^[\w-]{11}$/.test(id) ||
      seen.has(id) ||
      snippet?.title === "Private video" ||
      snippet?.title === "Deleted video"
    )
      return [];
    seen.add(id);
    return [
      {
        id,
        title: (snippet?.title || "Vídeo da playlist").replace(/\bdetox\b/gi, "DETOX"),
        description: (snippet?.description ?? "")
          .replace(/\bdetox\b/gi, "DETOX")
          .replace(/\s+/g, " ")
          .trim(),
        thumbnail:
          snippet?.thumbnails?.["medium"]?.url ||
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      },
    ];
  });
}

export function VideoPlaylistBrowser({
  playlistId,
  title,
  directVideoId,
  playRequest = 0,
}: {
  playlistId: string;
  title: string;
  directVideoId?: string | undefined;
  playRequest?: number;
}) {
  const instanceId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState(title);
  const [playing, setPlaying] = useState(false);
  // Substituição local do quinto vídeo da home; Aulas e Diversos permanecem na API.
  const presentationVideoId = playlistId === "PLJa8ZRa8ZUeA" ? "oEDxOYeRHDo" : null;
  const selected = videos.find((video) => video.id === selectedId) ?? videos[0];
  const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;

  useEffect(() => {
    if (!("IntersectionObserver" in window) || !containerRef.current) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    if (!directVideoId) setPlaying(false);
    async function load() {
      try {
        const response = await fetch(
          `${playlistApiUrl}?playlist=${encodeURIComponent(playlistId)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Playlist indisponível");
        const data = (await response.json()) as PlaylistResponse;
        const nextVideos = toPlaylistVideos(data.items).map((video) =>
          presentationVideoId && video.id === "GuCLmhi-Ed8"
            ? {
                ...video,
                id: presentationVideoId,
                thumbnail: `https://i.ytimg.com/vi/${presentationVideoId}/hqdefault.jpg`,
              }
            : video,
        );
        if (!nextVideos.length) throw new Error("Playlist sem vídeos públicos");
        if (!cancelled) {
          setVideos(nextVideos);
          setSelectedId((current) => current || directVideoId || nextVideos[0]!.id);
          setPlaylistTitle((data.playlistTitle || title).replace(/\bdetox\b/gi, "DETOX"));
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [playlistId, title, shouldLoad, attempt, presentationVideoId, directVideoId]);

  useEffect(() => {
    if (!directVideoId) return;
    setShouldLoad(true);
    startVideo(directVideoId);
  }, [directVideoId, playRequest]);

  useEffect(() => {
    const stop = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instanceId)
        setPlaying(false);
    };
    const stopForLocalVideo = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) setPlaying(false);
    };
    window.addEventListener(VIDEO_PLAY_EVENT, stop);
    document.addEventListener("play", stopForLocalVideo, true);
    return () => {
      window.removeEventListener(VIDEO_PLAY_EVENT, stop);
      document.removeEventListener("play", stopForLocalVideo, true);
    };
  }, [instanceId]);

  function startVideo(id?: string) {
    document.querySelectorAll("video").forEach((video) => video.pause());
    window.dispatchEvent(
      new CustomEvent(VIDEO_PLAY_EVENT, { detail: instanceId }),
    );
    if (id) setSelectedId(id);
    setPlaying(true);
    if (id && window.matchMedia("(max-width: 1023px)").matches) {
      playerRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
  }

  const embedUrl = directVideoId && selectedId === directVideoId
    ? `https://www.youtube.com/embed/${directVideoId}?autoplay=1&rel=0`
    : failed && presentationVideoId
    ? `https://www.youtube.com/embed/${presentationVideoId}?autoplay=1&rel=0`
    : failed
    ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&rel=0`
    : `https://www.youtube.com/embed/${selected?.id}?autoplay=1&rel=0`;

  return (
    <div ref={containerRef} aria-busy={loading} className="min-w-0">
      {loading && !directVideoId ? (
        <div role="status" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <span className="sr-only">Carregando vídeos da playlist…</span>
          <div className="aspect-video animate-pulse rounded-2xl bg-aqua-soft motion-reduce:animate-none" />
          <div
            className="space-y-4 rounded-2xl border border-border p-5"
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-aqua-soft motion-reduce:animate-none"
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`grid min-w-0 items-start gap-6 ${presentationVideoId ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]" : failed ? "" : "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"}`}
        >
          <div
            ref={playerRef}
            className="min-w-0 scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
          >
            <div className="relative aspect-video bg-deep">
              {playing ? (
                <iframe
                  key={failed ? playlistId : selected?.id}
                  src={embedUrl}
                  title={presentationVideoId ? title : selected?.title || title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startVideo()}
                  aria-label={`Reproduzir ${failed ? "playlist" : "vídeo"}: ${presentationVideoId ? title : selected?.title || title}`}
                  className="group absolute inset-0 h-full w-full overflow-hidden focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-aqua"
                >
                  {!failed && selected && (
                    <img
                      src={selected.thumbnail}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  )}
                  <span className="absolute inset-0 bg-deep/25 group-hover:bg-deep/40" />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-aqua-soft">
                    <span className="grid size-20 place-items-center rounded-full bg-aqua-soft text-deep shadow-lg transition-transform group-hover:scale-110 motion-reduce:transform-none">
                      <Play
                        className="size-9 translate-x-0.5"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                    </span>
                    {failed && (
                      <span className="text-sm font-semibold">
                        Assistir à playlist
                      </span>
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className={`min-w-0 space-y-5 ${presentationVideoId ? "lg:col-start-2" : ""}`}>
            <div className="space-y-3 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
              {!presentationVideoId && (
                <>
              <p className="eyebrow flex items-center gap-2 text-deep">
                <ListVideo className="size-4 shrink-0" aria-hidden="true" />
                {failed
                  ? "Playlist no YouTube"
                  : `${videos.length} ${videos.length === 1 ? "vídeo disponível" : "vídeos disponíveis"}`}
              </p>
              <h3 className="break-words font-display text-xl font-bold leading-snug sm:text-2xl">
                {failed ? title : selected?.title}
              </h3>
                </>
              )}
              {failed && (
                <p
                  role="status"
                  className="text-sm leading-7 text-muted-foreground"
                >
                  Não foi possível carregar as miniaturas. Você ainda pode
                  assistir à playlist no player acima ou abrir no YouTube.
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-deep underline-offset-4 hover:underline"
                >
                  Abrir playlist no YouTube{" "}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                {failed && (
                  <button
                    type="button"
                    onClick={() => setAttempt((value) => value + 1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-deep underline-offset-4 hover:underline"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" /> Tentar
                    novamente
                  </button>
                )}
              </div>
            </div>
          {!failed && (!presentationVideoId || videos.some((video) => video.id !== presentationVideoId)) && (
            <aside
              aria-label="Vídeos da playlist"
              className="min-w-0 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6"
            >
              <p className="eyebrow text-deep">Escolha um vídeo</p>
              <h3 className="mb-5 mt-2 break-words font-display text-xl font-bold leading-snug">
                {playlistTitle}
              </h3>
              <div className="grid max-h-[440px] grid-cols-1 gap-3 overflow-y-auto overscroll-contain p-1 sm:grid-cols-2 lg:max-h-[520px] lg:grid-cols-1">
                {videos.filter((video) => !presentationVideoId || video.id !== presentationVideoId).map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    aria-pressed={selected?.id === video.id}
                    onClick={() => startVideo(video.id)}
                    className={`group grid w-full min-w-0 grid-cols-[minmax(80px,0.85fr)_minmax(0,1.15fr)] items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-aqua ${selected?.id === video.id ? "border-aqua bg-aqua-soft/60" : "border-border hover:border-aqua hover:bg-aqua-soft/30"}`}
                  >
                    <span className="relative aspect-video overflow-hidden rounded-lg bg-deep">
                      <img
                        src={video.thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-1 top-1 rounded bg-deep/90 px-1.5 py-0.5 font-mono text-[10px] text-aqua-soft">
                        {index + 1}
                      </span>
                      {selected?.id === video.id && (
                        <span className="absolute inset-0 grid place-items-center bg-deep/25">
                          <Play
                            className="size-7 text-white drop-shadow"
                            fill="currentColor"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 space-y-2">
                      <span className="line-clamp-3 break-words text-sm font-semibold leading-snug">
                        {video.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
