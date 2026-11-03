import { EletrodosConexoes } from "@/components/EletrodosConexoes";
import { ConceitoBioequilibrio, TrajetoriaTavares } from "@/components/ConceitoBioequilibrio";
import {
  DestaqueBioequilibrio,
  ConjuntoCompleto,
  itensConjunto,
} from "@/components/ConjuntoBioequilibrio";
import { VitrineLivros } from "@/components/VitrineLivros";
import { AbordagemResponsavel } from "@/components/AbordagemResponsavel";
import { createFileRoute } from "@tanstack/react-router";
import videoHero from "@/assets/video-4.mp4.asset.json";
import videoPessoal from "@/assets/video-1.mp4.asset.json";
import videoFormacao from "@/assets/video-6.mp4.asset.json";
import { VideosDestaque } from "@/components/VideosDestaque";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Award, Check, Laptop, PackageCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WHATSAPP_PHONE = "5583989094835";
const wa = (mensagem: string) =>
  `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    mensagem,
  )}&type=phone_number&app_absent=0`;

const waGeral = wa(
  "Olá! Conheci a STS DETOX IÔNICO pelo site e gostaria de mais informações.",
);
const waPessoal = wa(
  "Olá! Conheci o aparelho DETOX BIOEQUILÍBRIO pelo site e gostaria de informações para uso pessoal.",
);
const waProfissional = wa(
  "Olá! Gostaria de falar com professor Tavares sobre o equipamento DETOX BIOEQUILÍBRIO.",
);
const waFormacao = wa(
  "Olá! Gostaria de informações sobre o material de estudo do aparelho DETOX BIOEQUILÍBRIO.",
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STS DETOX IÔNICO — DETOX BIOEQUILÍBRIO" },
      {
        name: "description",
        content:
          "O DETOX BIOEQUILÍBRIO é a evolução do DETOX IÔNICO: uma proposta de bem-estar, relaxamento e equilíbrio funcional, com informação responsável e sem promessas de cura.",
      },
      { property: "og:title", content: "STS DETOX IÔNICO — DETOX BIOEQUILÍBRIO" },
      {
        property: "og:description",
        content:
          "Da curiosidade do DETOX IÔNICO ao estudo do organismo: relaxamento, conforto e bem-estar com comunicação responsável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const beneficios = [
  "Momento de relaxamento",
  "Sensação de conforto",
  "Pausa na rotina",
  "Experiência de autocuidado",
  "Percepções individuais de descanso e bem-estar",
];

const conhecimentos = [
  "Funcionamento do equipamento",
  "Água e condutividade",
  "Função dos sais",
  "Eletrodos e reações eletroquímicas",
  "Princípios de bioeletricidade",
  "Respostas individuais",
  "Segurança e contraindicações",
  "Higienização e conservação",
  "Limites científicos",
  "Comunicação responsável",
];

const etapas = [
  {
    n: "01",
    titulo: "Preparação",
    texto:
      "A água e os materiais são preparados seguindo as orientações de uso, higiene e segurança.",
  },
  {
    n: "02",
    titulo: "Posicionamento",
    texto:
      "A pessoa permanece confortavelmente sentada, com os pés posicionados na cuba.",
  },
  {
    n: "03",
    titulo: "Durante a sessão",
    texto:
      "O equipamento produz estímulos elétricos de baixa intensidade durante o tempo selecionado.",
  },
  {
    n: "04",
    titulo: "Finalização",
    texto:
      "Ao final, o equipamento é desligado e são realizados o descarte da água, a limpeza e a conservação dos materiais.",
  },
];

const duvidas = [
  {
    q: "A cor da água e da espuma representa toxinas ou órgãos?",
    a: "A alteração visual pode decorrer da interação entre água, sais, corrente elétrica e eletrodos. Correspondências da prática e interpretações tradicionais não são comprovação científica e não devem ser utilizadas isoladamente para identificar toxinas, órgãos ou doenças.",
  },
  {
    q: "O STS realiza diagnóstico?",
    a: "Não. O STS é apresentado como uma proposta de bem-estar. Não realiza diagnóstico e não substitui consulta ou acompanhamento médico.",
  },
  {
    q: "O STS trata ou cura doenças?",
    a: "O STS não deve ser anunciado como tratamento, prevenção ou cura de doenças. Seu posicionamento é voltado ao relaxamento, conforto e bem-estar.",
  },
  {
    q: "Posso utilizar o DETOX BIOEQUILÍBRIO em casa?",
    a: "Existe uma proposta para uso pessoal, desde que sejam seguidas as orientações de utilização, higiene, conservação e segurança do aparelho e dos acessórios.",
  },
  {
    q: "Como posso aprender a utilizar o equipamento?",
    a: "Consulte o manual de uso e as instruções do aparelho e acessórios antes da utilização. O material de estudo e as informações disponíveis no site ajudam a ampliar esse conhecimento. Para esclarecimentos, fale com professor Tavares — atendimento humano.",
  },
  {
    q: "Existe material de estudo para acompanhar o equipamento?",
    a: "Sim. A opção com equipamento inclui material de estudo digital, manual de uso e instruções do aparelho e acessórios. Os temas incluem funcionamento, segurança, água e condutividade, eletrodos, higiene e limites científicos.",
  },
  {
    q: "Existem contraindicações e cuidados de segurança?",
    a: "O uso exige atenção às contraindicações e condições individuais. Consulte as orientações completas antes da utilização. Em caso de dúvida relacionada à saúde, procure um profissional habilitado.",
  },
  {
    q: "Onde posso encontrar mais informações sobre o DETOX IÔNICO e o BIOEQUILÍBRIO?",
    a: "Explore o material de estudo, os vídeos e as informações deste site. Os livros de Severino Tavares da Silva aprofundam fundamentos, observações, pesquisas e seus limites; a vitrine apresenta os links para conhecer cada obra na Amazon.",
  },
];

function Index() {
  return (
    <div
      id="topo"
      className="min-h-screen overflow-x-hidden bg-background text-foreground"
    >
      <SiteHeader />

      {/* 1 — ABERTURA */}
      <section
        aria-labelledby="titulo-entrada"
        className="relative border-b border-border/70 bg-gradient-to-br from-surface via-background to-aqua-soft/45"
      >
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-20">
          <div className="rise min-w-0 lg:col-span-7">
            <h1
              id="titulo-entrada"
              className="font-display text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.12] tracking-tight text-deep"
            >
              STS DETOX <span className="block text-deep-2">IÔNICO</span>
            </h1>
            <p className="mt-6 max-w-[32ch] font-display text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              Equipamento e conhecimento para compreender a técnica
            </p>
            <p className="mt-5 max-w-[52ch] text-lg leading-8 text-muted-foreground">
              Conheça o aparelho, explore os materiais de estudo e descubra os
              livros de Severino Tavares da Silva.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#equipamento"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-deep px-6 py-4 text-center text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep"
              >
                Conhecer o DETOX BIOEQUILÍBRIO
              </a>
              <a
                href={waGeral}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-deep/35 bg-surface px-6 py-4 text-center text-base font-semibold text-deep transition-colors hover:bg-aqua-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep"
              >
                Falar com professor Tavares — atendimento humano
              </a>
            </div>
          </div>
          <div className="rise mx-auto w-full min-w-0 max-w-[440px] lg:col-span-5">
            <video
              src={videoHero.url}
              aria-label="Apresentação do equipamento DETOX BIOEQUILÍBRIO"
              controls
              playsInline
              preload="metadata"
              className="block aspect-video h-auto w-full rounded-3xl bg-deep object-contain shadow-xl ring-1 ring-deep/15"
            />
          </div>
        </div>
      </section>

      <ConceitoBioequilibrio />
      <DestaqueBioequilibrio />

      {/* 2 — O QUE É */}
      <section id="o-que-e" className="bg-surface py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">O que é</p>
            <h2 className="text-balance font-display text-4xl font-bold leading-tight">
              O que é o DETOX BIOEQUILÍBRIO?
            </h2>
            <p className="mt-6 text-pretty text-base leading-8 text-muted-foreground">
              O DETOX BIOEQUILÍBRIO é uma proposta complementar voltada ao
              relaxamento, ao conforto e ao bem-estar. Durante a sessão, os pés
              permanecem em água preparada para condução elétrica, enquanto o
              equipamento produz estímulos elétricos de baixa intensidade.
            </p>
            <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">
              A experiência envolve água, temperatura, minerais dissolvidos,
              eletrodos e estímulos sensoriais e bioelétricos leves. O objetivo
              não é realizar diagnóstico nem prometer prevenção, tratamento ou
              cura de doenças.
            </p>
          </div>
          <div className="rise border-l border-border pl-8 lg:col-span-5 lg:pl-12">
            <p className="eyebrow mb-4 text-aqua">O que pode ser buscado</p>
            <ul className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
              {beneficios.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aqua" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              As experiências e percepções podem variar de uma pessoa para
              outra.
            </p>
          </div>
        </div>
      </section>

      <TrajetoriaTavares />

      {/* USO PESSOAL */}
      <EletrodosConexoes />
      <ConjuntoCompleto />

      <section id="uso-pessoal" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">Uso pessoal</p>
            <h2 className="max-w-[19ch] text-balance font-display text-4xl font-bold leading-tight">
              Um momento especial no conforto da sua casa
            </h2>
            <p className="mt-6 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              Em meio à correria do dia a dia, permita-se uma pausa.
            </p>
            <p className="mt-4 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              Um momento só seu, de tranquilidade, conforto e bem-estar — sem
              sair de casa.
            </p>
            <p className="mt-4 max-w-[60ch] text-base leading-8 text-muted-foreground">
              Conheça o DETOX BIOEQUILÍBRIO e descubra uma nova experiência para
              a sua rotina.
            </p>
            <a
              href={waPessoal}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-deep px-6 py-3.5 text-sm font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
            >
              Quero conhecer para uso pessoal
            </a>
          </div>
          <div className="rise flex justify-center lg:col-span-5">
            <video
              src={videoPessoal.url}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full max-w-[310px] rounded-lg bg-deep object-cover shadow-xl ring-1 ring-border"
            />
          </div>
        </div>
      </section>

      {/* Âncora antiga preservada para links existentes. */}
      <div id="uso-profissional" className="scroll-mt-24" />
      {/* MATERIAL E EQUIPAMENTO */}
      <section
        id="material-equipamento"
        data-hide-whatsapp-fab
        className="scroll-mt-24 bg-deep py-20 text-aqua-soft lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua-soft/70">
              Material e equipamento
            </p>
            <h2 className="max-w-[18ch] text-balance font-display text-4xl font-bold leading-tight text-white lg:text-5xl">
              Conhecimento para utilizar a técnica com mais segurança e
              confiança
            </h2>
            <p className="mt-4 max-w-[62ch] text-pretty text-base leading-7 text-aqua-soft/80 lg:text-lg">
              Para quem deseja conhecer melhor o DETOX BIOEQUILÍBRIO e
              compreender sua utilização com responsabilidade.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Award,
                  title: "Material de estudo",
                  text: "Conteúdo para compreender a técnica.",
                },
                {
                  icon: Laptop,
                  title: "Acesso a distância",
                  text: "Estude de onde estiver.",
                },
                {
                  icon: PackageCheck,
                  title: "Equipamento",
                  text: "Opção com aparelho DETOX BIOEQUILÍBRIO",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-lg border border-aqua-soft/15 bg-white/[0.04] p-4"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-5 text-aqua-soft/75"
                  />
                  <p className="mt-3 text-sm font-semibold text-white">
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-aqua-soft/65">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-lg border border-aqua-soft/20 bg-white/[0.04] p-5 sm:p-6">
              <p className="font-display text-lg font-bold text-white">
                Opção com equipamento
              </p>
              <ul className="mt-4 grid gap-3 text-sm text-aqua-soft/80 sm:grid-cols-2">
                {itensConjunto.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-aqua-soft/70"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-l-2 border-aqua-soft/25 pl-4 text-sm leading-6 text-aqua-soft/65">
              <p>
                O material de estudo é enviado por meio digital. Os itens
                físicos são enviados para o endereço informado.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waFormacao}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-aqua-soft px-6 py-3.5 text-center text-sm font-semibold text-deep transition-all hover:-translate-y-0.5 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Quero conhecer o material e o equipamento
              </a>
              <a
                href={waProfissional}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-center text-sm font-semibold text-aqua-soft ring-1 ring-aqua-soft/40 transition-all hover:-translate-y-0.5 hover:bg-aqua-soft/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Falar com professor Tavares
              </a>
            </div>
          </div>

          <div className="rise lg:col-span-5">
            <img
              src="/assets/aula-curso.png"
              alt="Professor Tavares compartilhando conhecimento com um grupo."
              width={1448}
              height={1085}
              loading="lazy"
              className="aspect-[5/4] w-full rounded-lg object-cover object-center shadow-2xl ring-1 ring-aqua-soft/20 lg:aspect-[4/5]"
            />
          </div>
        </div>
      </section>

      {/* 4 — COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="scroll-mt-24 bg-surface py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-4 text-aqua">Passo a passo</p>
          <h2 className="max-w-[20ch] text-balance font-display text-4xl font-bold leading-tight">
            Como funciona uma sessão
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {etapas.map((e) => (
              <li
                key={e.n}
                className="rise rounded-2xl bg-background p-7 ring-1 ring-border transition-transform duration-500 hover:-translate-y-1"
              >
                <span className="font-mono text-xs text-aqua">{e.n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">
                  {e.titulo}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {e.texto}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl border-l-4 border-aqua bg-aqua-soft/40 p-7">
            <p className="text-pretty text-base leading-8 text-deep/85">
              A alteração visual da água pode decorrer da interação entre água,
              sais, corrente elétrica e eletrodos. A cor da água não deve ser
              utilizada para diagnóstico nem para afirmar a eliminação de
              toxinas específicas.
            </p>
          </div>
        </div>
      </section>

      {/* CONHECIMENTO E RESPONSABILIDADE */}
      <section id="formacao" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="rise mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">
              Conhecimento e responsabilidade
            </p>
            <h2 className="max-w-[20ch] text-balance font-display text-4xl font-bold leading-tight">
              Conhecimento para uma utilização responsável
            </h2>
            <p className="mt-6 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              Mais do que conhecer o funcionamento do equipamento, é importante
              compreender os princípios envolvidos em sua utilização.
            </p>
            <p className="mt-4 max-w-[60ch] text-base leading-8 text-muted-foreground">
              O material de estudo reúne informações para ampliar esse
              conhecimento de forma clara e responsável.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-4 text-sm text-muted-foreground sm:grid-cols-2">
              {conhecimentos.map((c) => (
                <li key={c} className="flex gap-3 border-t border-border pt-4">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aqua" />
                  {c}
                </li>
              ))}
            </ul>
            <a
              href={waFormacao}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block rounded-full bg-deep px-6 py-3 text-sm font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
            >
              Conhecer o material de estudo
            </a>
          </div>
          <video
            src={videoFormacao.url}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full max-w-[360px] justify-self-center rounded-3xl bg-deep object-cover shadow-xl lg:col-span-5"
          />
        </div>
      </section>

      <AbordagemResponsavel />
      <VitrineLivros />

      <VideosDestaque />

      {/* 9 — DÚVIDAS */}
      <section id="duvidas" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <p className="eyebrow mb-4 text-aqua">Dúvidas</p>
          <h2 className="text-balance font-display text-4xl font-bold leading-tight">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {duvidas.map((d, i) => (
              <AccordionItem key={d.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-bold">
                  {d.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-8 text-muted-foreground">
                  {d.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 10 — CONTATO */}
      <section
        id="contato"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">Contato</p>
            <h2 className="text-balance font-display text-4xl font-bold">
              Quero conhecer o DETOX BIOEQUILÍBRIO
            </h2>
            <div className="mt-8 flex max-w-xl flex-wrap gap-4">
              <a
                href={waPessoal}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-deep px-6 py-4 text-sm font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
              >
                Conhecer o DETOX BIOEQUILÍBRIO
              </a>
              <a
                href={waProfissional}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-surface px-6 py-4 text-sm font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-aqua/40"
              >
                Falar com professor Tavares
              </a>
            </div>
          </div>
          <div className="rise self-start border-l border-aqua/40 bg-aqua-soft/40 p-8 lg:col-span-5 lg:p-10">
            <p className="eyebrow mb-3 text-deep/60">Informação importante</p>
            <p className="text-pretty text-base leading-8 text-deep/80">
              O DETOX BIOEQUILÍBRIO é apresentado como uma prática
              complementar de bem-estar e relaxamento.{" "}
              <strong className="font-semibold text-deep">
                Não substitui consulta, diagnóstico, acompanhamento ou
                tratamento médico
              </strong>{" "}
              e não deve ser utilizado para prometer diagnóstico, prevenção,
              tratamento ou cura de doenças. As experiências e percepções podem
              variar individualmente.
            </p>
          </div>
        </div>

        <SiteFooter />
      </section>

      <WhatsAppFab href={waGeral} />
    </div>
  );
}
