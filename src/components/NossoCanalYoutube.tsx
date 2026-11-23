import { ArrowUpRight, Music2, Youtube } from 'lucide-react';

export function NossoCanalYoutube() {
  return (
    <section id="nosso-canal-youtube" aria-labelledby="nosso-canal-heading" className="scroll-mt-24 border-y border-border bg-background py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 id="nosso-canal-heading" className="font-display text-2xl font-bold text-deep sm:text-3xl">Nosso Canal no YouTube</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Acompanhe os vídeos sobre o DETOX BioEquilíbrio. Como conteúdo complementar, conheça também as músicas do Professor Tavares.</p>
        </div>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a href="https://www.youtube.com/@DetoxIonicoBioEquilibrio/videos" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-deep px-5 py-3 text-center text-sm font-semibold text-aqua-soft transition-colors hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep">
            <Youtube aria-hidden="true" className="size-5 shrink-0" />
            <span>Vídeos sobre o DETOX BioEquilíbrio<span className="sr-only"> (abre em nova aba)</span></span>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
          <a href="https://www.youtube.com/playlist?list=PLTVLD5FTEMyE" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-deep/25 px-5 py-3 text-center text-sm font-medium text-deep transition-colors hover:bg-aqua-soft/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep">
            <Music2 aria-hidden="true" className="size-4 shrink-0" />
            <span>Músicas do Professor Tavares<span className="sr-only"> (abre em nova aba)</span></span>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">Os links abrem o YouTube em uma nova aba.</p>
      </div>
    </section>
  );
}
