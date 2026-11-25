import { Youtube } from 'lucide-react';

export function NossoCanalYoutube() {
  return (
    <section id="nosso-canal-youtube" aria-label="Nosso Canal no YouTube" className="scroll-mt-24 border-y border-border bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm leading-7 text-muted-foreground">Acompanhe nossos vídeos e músicas.</p>
        <a href="https://www.youtube.com/@DetoxIonicoBioEquilibrio/videos" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-deep px-5 py-3 text-center text-sm font-semibold text-aqua-soft transition-colors hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep">
          <Youtube aria-hidden="true" className="size-5 shrink-0" />
          <span>Nosso Canal no YouTube<span className="sr-only"> (abre em nova aba)</span></span>
        </a>
      </div>
    </section>
  );
}
