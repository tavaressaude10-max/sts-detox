import v1 from "@/assets/video-1.mp4.asset.json";
import v2 from "@/assets/video-2.mp4.asset.json";
import v3 from "@/assets/video-3.mp4.asset.json";
import v4 from "@/assets/video-4.mp4.asset.json";
import v5 from "@/assets/video-5.mp4.asset.json";
import v6 from "@/assets/video-6.mp4.asset.json";
import v7 from "@/assets/video-7.mp4.asset.json";
import v8 from "@/assets/video-8.mp4.asset.json";
import v9 from "@/assets/video-9.mp4.asset.json";

const videos = [
  { src: v1.url, legenda: "01 · sessão" },
  { src: v2.url, legenda: "02 · sessão" },
  { src: v3.url, legenda: "03 · sessão" },
  { src: v4.url, legenda: "04 · sessão" },
  { src: v5.url, legenda: "05 · sessão" },
  { src: v6.url, legenda: "06 · sessão" },
  { src: v7.url, legenda: "07 · sessão" },
  { src: v8.url, legenda: "08 · sessão" },
  { src: v9.url, legenda: "09 · sessão" },
];

export function VideoGaleria() {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
      {videos.map((v, i) => (
        <figure
          key={v.src}
          className="group relative overflow-hidden rounded-2xl bg-deep shadow-sm ring-1 ring-border rise transition-transform duration-500 hover:-translate-y-1"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <video
            src={v.src}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] h-full w-full bg-deep-2 object-cover"
          />
          <figcaption className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-aqua-soft drop-shadow">
            {v.legenda}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
