import { waGeral } from "@/lib/whatsapp";
import videoAparelho from "@/assets/video-4.mp4.asset.json";

export const itensConjunto = [
  "Aparelho DETOX BIOEQUILÍBRIO",
  "1 eletrodo para aproximadamente 250 sessões",
  "1 cinta BioVibracional",
  "Material de estudo digital, incluindo manual de uso e instruções do aparelho e acessórios",
];

export function DestaqueBioequilibrio() {
  return (
    <section
      id="equipamento"
      aria-labelledby="equipamento-titulo"
      className="scroll-mt-24 bg-deep py-16 text-aqua-soft sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
        <div>
          <p className="eyebrow mb-4 text-aqua-soft/70">
            Equipamento · acessórios · conhecimento
          </p>
          <h2
            id="equipamento-titulo"
            className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl"
          >
            Conheça o DETOX BIOEQUILÍBRIO
          </h2>
          <p className="mt-6 text-lg leading-8 text-aqua-soft/85">
            Equipamento, acessórios e conhecimento reunidos em uma proposta
            desenvolvida para uma experiência de bem-estar confortável.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <a
              href="#conjunto-completo"
              className="inline-flex min-h-12 items-center rounded-full bg-aqua-soft px-6 py-3 text-sm font-semibold text-deep"
            >
              Conhecer o DETOX BIOEQUILÍBRIO
            </a>
            <a
              href={waGeral}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline underline-offset-4"
            >
              Falar com professor Tavares — atendimento humano
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-aqua-soft/25 bg-white/5 p-6 sm:p-9">
          <h3 className="font-display text-xl font-bold text-white">
            O conjunto inclui
          </h3>
          <ul className="mt-5 space-y-4">
            {itensConjunto.map((item, index) => (
              <li
                key={item}
                className="flex gap-4 border-t border-aqua-soft/15 pt-4 text-sm leading-7"
              >
                <span className="font-mono text-aqua-soft/60">
                  0{index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ConjuntoCompleto() {
  return (
    <section
      id="conjunto-completo"
      aria-labelledby="conjunto-titulo"
      className="scroll-mt-24 bg-surface py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="eyebrow mb-4 text-aqua">Aparelho e acessórios</p>
          <h2
            id="conjunto-titulo"
            className="font-display text-3xl font-bold leading-tight sm:text-4xl"
          >
            Conheça o DETOX BIOEQUILÍBRIO completo
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Veja o aparelho e seus acessórios e conheça melhor o funcionamento
            do conjunto.
          </p>
          <h3 className="mt-8 font-display text-lg font-bold">
            Mais informações
          </h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            Para informações sobre o aparelho, acessórios, valores, formas de
            aquisição e envio:
          </p>
          <a
            href={waGeral}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-aqua-soft"
          >
            Falar com professor Tavares — atendimento humano
          </a>
        </div>
        <figure className="mx-auto w-full max-w-[440px]">
          <video
            id="video-conjunto"
            src={videoAparelho.url}
            controls
            playsInline
            preload="metadata"
            aria-label="Apresentação do equipamento DETOX BIOEQUILÍBRIO"
            className="aspect-[4/5] w-full rounded-3xl bg-deep object-contain shadow-xl"
          />
          <button
            type="button"
            onClick={() => {
              const video = document.getElementById(
                "video-conjunto",
              ) as HTMLVideoElement | null;
              if (video) {
                document.querySelectorAll("video").forEach((other) => {
                  if (other !== video) other.pause();
                });
                void video.play().catch(() => video.focus());
              }
            }}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-deep/30 px-5 py-2 text-sm font-semibold text-deep"
          >
            Assistir ao vídeo
          </button>
        </figure>
      </div>
    </section>
  );
}
