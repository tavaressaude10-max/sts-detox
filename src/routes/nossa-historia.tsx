import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, ArrowDown, Play, X } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { waGeral } from '@/lib/whatsapp';
import { VoltarLeitura, rememberEquipmentReading, useReadingReturn } from '@/components/VoltarLeitura';

export const Route = createFileRoute('/nossa-historia')({
  head: () => ({ meta: [
    { title: 'Nossa História — Evolução dos Aparelhos STS' },
    { name: 'description', content: 'Conheça o acervo de aparelhos históricos STS e o DETOX BioEquilíbrio, apresentado em vídeo.' },
  ] }),
  component: NossaHistoria,
});

// Fotografias originais, na ordem visual do PDF fornecido. Sem datas inferidas.
const acervo = [
  { image: 'Image12.jpg', title: 'Gold Spa', alt: 'Aparelho Gold Spa com fonte e acessórios', width: 562, height: 414 },
  { image: 'Image10.jpg', title: 'STS DETOX IÔNICO', alt: 'Dois aparelhos STS DETOX IÔNICO com gabinetes de tamanhos diferentes', width: 947, height: 631 },
  { image: 'Image11.jpg', title: 'STS em maleta', alt: 'Aparelho STS com painel verde, fonte e cabos em uma maleta aberta', width: 687, height: 515 },
  { image: 'Image9.jpg', title: 'STS DETOX IÔNICO', alt: 'Aparelho STS DETOX IÔNICO com gabinete bege e conectores frontais', width: 428, height: 322 },
  { image: 'Image13.jpg', title: 'STS DETOX IÔNICO', alt: 'Aparelho STS DETOX IÔNICO com gabinete branco e painel rosa', width: 488, height: 366 },
  { image: 'Image16.jpg', title: 'Aparelho e acessórios', alt: 'Conjunto STS DETOX IÔNICO com bolsa, cintas, cabos e eletrodos', width: 711, height: 569 },
  { image: 'Image14.jpg', title: 'Conjunto STS DETOX IÔNICO', alt: 'Aparelho compacto STS DETOX IÔNICO acompanhado de cintas e eletrodo', width: 607, height: 286 },
  { image: 'Image15.jpg', title: 'Electrolysis Spa', alt: 'Aparelho branco com painel escuro identificado como Electrolysis Spa e gerador de íons', width: 514, height: 581 },
];

function NossaHistoria() {
  useReadingReturn();
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!videoOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [videoOpen]);

  function openVideo() {
    setVideoError(false);
    setVideoOpen(true);
    dialog.current?.showModal();
  }

  function closeVideo() {
    video.current?.pause();
    dialog.current?.close();
  }

  function afterClose() {
    video.current?.pause();
    setVideoOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader ancorasHome={false} />
      <main>
        <section className="border-b border-border bg-surface py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-deep underline-offset-4 hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao início</a>
            <p className="eyebrow mt-8 text-aqua">Memória STS</p>
            <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight text-deep sm:text-5xl">Nossa História <span className="mt-3 block text-xl font-medium sm:text-3xl">Evolução dos Aparelhos STS</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">Uma história contada pelos aparelhos. Reunimos fotografias do nosso acervo para recordar os modelos já lançados e apresentar o DETOX BioEquilíbrio.</p>
            <a id="leitura-equipamento-historia" onClick={rememberEquipmentReading} href="#bioequilibrio-atual" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-deep/25 px-5 py-3 text-sm font-semibold text-deep hover:bg-aqua-soft/40">Conheça o modelo atual <ArrowDown className="size-4" aria-hidden="true" /></a>
          </div>
        </section>

        <section aria-labelledby="acervo-titulo" className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-10">
          <p className="eyebrow text-aqua">Nosso acervo</p>
          <h2 id="acervo-titulo" className="mt-3 font-display text-2xl font-bold text-deep sm:text-3xl">Aparelhos que fazem parte da nossa história</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {acervo.map(item => (
              <figure key={item.image} className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="flex aspect-[4/3] items-center justify-center p-5 sm:p-6">
                  <img src={`/assets/historia/${item.image}`} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
                <figcaption className="border-t border-border bg-surface px-5 py-4 text-sm font-semibold text-deep">{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="bioequilibrio-atual" aria-labelledby="bioequilibrio-titulo" className="scroll-mt-24 bg-deep py-12 text-aqua-soft sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-2 lg:gap-12 lg:px-10">
            <div>
              <VoltarLeitura destination="/nossa-historia#bioequilibrio-atual" dark />
              <p className="eyebrow text-aqua-soft/70">O modelo atual</p>
              <h2 id="bioequilibrio-titulo" className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">DETOX BioEquilíbrio</h2>
              <p className="mt-5 max-w-xl leading-8 text-aqua-soft/85">Encerrando esta apresentação, conheça o aparelho e método desenvolvido pela STS. Selecione a imagem para assistir ao vídeo “DETOX BioEquilíbrio — a Evolução”.</p>
              <p className="mt-4 text-sm leading-7 text-aqua-soft/70">O vídeo abre aqui mesmo, em uma janela com controles de reprodução.</p>
            </div>
            <button ref={trigger} type="button" onClick={openVideo} aria-haspopup="dialog" aria-controls="historia-video-dialog" aria-label="Assistir ao vídeo DETOX BioEquilíbrio — a Evolução" className="group overflow-hidden rounded-2xl border border-white/20 bg-black text-left shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <img src="/assets/historia/bioequilibrio-video-atual.jpg" alt="DETOX BioEquilíbrio — imagem do vídeo de apresentação" width={1280} height={720} loading="lazy" className="w-full" />
              <span className="flex min-h-16 items-center gap-3 bg-white px-5 py-4 text-sm font-semibold text-deep group-hover:bg-aqua-soft"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-deep text-white"><Play className="size-4" aria-hidden="true" /></span>Assistir à evolução do DETOX BioEquilíbrio</span>
            </button>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
          <p className="text-sm leading-7 text-muted-foreground">Para conhecer melhor os aparelhos e falar com nossa equipe, <a href={waGeral} target="_blank" rel="noopener noreferrer" className="font-semibold text-deep underline underline-offset-4">acesse o atendimento humano pelo WhatsApp</a>.</p>
          <SiteFooter />
        </div>
      </main>

      <dialog ref={dialog} id="historia-video-dialog" aria-labelledby="historia-video-titulo" onClose={afterClose} onClick={event => { if (event.target === event.currentTarget) closeVideo(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/75">
        <div>
          <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-6">
            <h2 id="historia-video-titulo" className="py-2 font-display text-base font-bold text-deep sm:text-xl">DETOX BioEquilíbrio — a Evolução</h2>
            <button type="button" autoFocus onClick={closeVideo} aria-label="Fechar vídeo" className="grid size-11 shrink-0 place-items-center rounded-full border border-border hover:bg-surface"><X className="size-5" aria-hidden="true" /></button>
          </div>
          {videoOpen && <video ref={video} src="/assets/historia/detox-bioequilibrio-evolucao.mp4?v=12s-20261118" poster="/assets/historia/bioequilibrio-video-atual.jpg" controls playsInline preload="metadata" onError={() => setVideoError(true)} aria-label="Vídeo DETOX BioEquilíbrio — a Evolução" className="max-h-[65dvh] w-full bg-black object-contain" />}
          {videoError && <p role="alert" className="px-5 py-4 text-sm">Não foi possível carregar o vídeo. <a href="/assets/historia/detox-bioequilibrio-evolucao.mp4?v=12s-20261118" className="underline">Abrir o arquivo de vídeo</a>.</p>}
          <p className="px-5 py-3 text-xs leading-6 text-muted-foreground">Use os controles para reproduzir ou pausar. Para voltar à página, selecione Fechar ou pressione Esc.</p>
        </div>
      </dialog>
    </div>
  );
}
