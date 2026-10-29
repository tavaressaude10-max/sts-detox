import { DetoxPetCard } from "@/components/DetoxPetCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import videoHero from "@/assets/video-4.mp4.asset.json";
import videoPessoal from "@/assets/video-1.mp4.asset.json";
import videoFormacao from "@/assets/video-6.mp4.asset.json";
import capaEnciclopedia from "@/assets/capa-enciclopedia.jpeg.asset.json";
import capaDetoxIonico from "@/assets/capa-detox-ionico.jpeg.asset.json";
import capaBioequilibrio from "@/assets/capa-bioequilibrio.jpeg.asset.json";
import { VideoPlaylists } from "@/components/VideoPlaylists";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  Award,
  Check,
  Facebook,
  Instagram,
  Laptop,
  PackageCheck,
  Youtube,
} from "lucide-react";
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
  "Olá! Conheci o STS DETOX BioEquilíbrio pelo site e gostaria de mais informações.",
);
const waPessoal = wa(
  "Olá! Conheci o STS DETOX BioEquilíbrio pelo site e gostaria de informações para uso pessoal.",
);
const waProfissional = wa(
  "Olá! Sou profissional e gostaria de conhecer o equipamento STS DETOX BioEquilíbrio.",
);
const waFormacao = wa(
  "Olá! Gostaria de informações sobre a formação STS DETOX BioEquilíbrio.",
);

const redesSociais = [
  {
    href: "https://www.instagram.com/stsdetox?stkn=MTkwMGJleHJvMTZjMA==",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.facebook.com/share/1GJHfrrabB/?mibextid=wwXIfr",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.youtube.com/@severinotavaresdasilva6514",
    label: "YouTube",
    icon: Youtube,
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STS DETOX BioEquilíbrio — Relaxamento e Equilíbrio Funcional" },
      {
        name: "description",
        content:
          "O STS DETOX BioEquilíbrio é a evolução do DETOX Iônico: uma proposta de bem-estar, relaxamento e equilíbrio funcional, com informação responsável e sem promessas de cura.",
      },
      { property: "og:title", content: "STS DETOX BioEquilíbrio" },
      {
        property: "og:description",
        content:
          "Da curiosidade do DETOX Iônico ao estudo do organismo: relaxamento, conforto e bem-estar com comunicação responsável.",
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

const estudos = [
  "Bioeletricidade",
  "Sistema Nervoso Autônomo",
  "Circulação periférica",
  "Sistema linfático",
  "Líquidos corporais e interstício",
  "Fáscia e tecido conjuntivo",
  "Estimulação sensorial",
  "Mecanismos naturais de equilíbrio",
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
      "A água e os materiais são preparados conforme as orientações de utilização, higiene e segurança.",
  },
  {
    n: "02",
    titulo: "Posicionamento",
    texto:
      "A pessoa permanece confortavelmente sentada, com os pés posicionados na cuba.",
  },
  {
    n: "03",
    titulo: "Experiência",
    texto:
      "O equipamento produz estímulos elétricos de baixa intensidade durante o período orientado.",
  },
  {
    n: "04",
    titulo: "Finalização",
    texto:
      "Depois da sessão, são realizados os procedimentos adequados de desligamento, descarte da água, limpeza e conservação.",
  },
];

const duvidas = [
  {
    q: "A cor da água representa toxinas?",
    a: "Não é correto utilizar apenas a cor da água para identificar toxinas, órgãos ou doenças. A alteração visual pode decorrer da interação entre água, sais, corrente elétrica e eletrodos.",
  },
  {
    q: "O STS realiza diagnóstico?",
    a: "Não. O STS é apresentado como uma proposta complementar de relaxamento e bem-estar. Não realiza diagnóstico e não substitui consulta ou acompanhamento médico.",
  },
  {
    q: "O STS trata ou cura doenças?",
    a: "O STS não deve ser anunciado como tratamento, prevenção ou cura de doenças. Seu posicionamento é complementar e voltado ao relaxamento, conforto e bem-estar.",
  },
  {
    q: "Posso utilizar o STS em casa?",
    a: "Existe uma proposta para uso pessoal, desde que sejam seguidas as orientações de utilização, higiene, conservação e segurança.",
  },
  {
    q: "Profissionais podem oferecer sessões?",
    a: "Profissionais e estabelecimentos devem atuar dentro de suas habilitações, respeitando as normas aplicáveis e utilizando comunicação responsável.",
  },
  {
    q: "Existe formação profissional?",
    a: "Sim. A formação STS aborda funcionamento, segurança, condutividade da água, eletrodos, higienização, limites científicos e comunicação responsável.",
  },
  {
    q: "Existem contraindicações?",
    a: "O uso exige atenção às contraindicações e condições individuais. As orientações completas devem ser consultadas antes da utilização. Em caso de dúvida relacionada à saúde, a pessoa deve procurar um profissional habilitado.",
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
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-12 lg:px-10 lg:py-24">
          <div className="rise lg:col-span-6">
            <p className="eyebrow mb-5 text-aqua">
              Equipamento, conhecimento e prática responsável
            </p>
            <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl">
              STS DETOX BioEquilíbrio: equipamento e formação para experiências
              de relaxamento e bem-estar
            </h1>
            <p className="mt-7 max-w-[52ch] text-pretty text-lg leading-8 text-muted-foreground">
              Conheça uma evolução responsável do DETOX Iônico para uso pessoal
              ou profissional, com orientação, segurança, formação e suporte.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={waGeral}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-deep px-7 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
              >
                Quero conhecer pelo WhatsApp
              </a>
              <a
                href="#videos"
                className="rounded-full bg-surface px-7 py-3.5 font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-aqua/40"
              >
                Ver vídeos
              </a>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              Uso pessoal e profissional • Orientação de uso • Formação e
              suporte
            </p>
          </div>
          <div className="rise lg:col-span-6 lg:pl-10">
            <video
              src={videoHero.url}
              controls
              playsInline
              preload="metadata"
              className="aspect-[4/5] max-h-[620px] w-full rounded-3xl bg-deep object-cover shadow-2xl ring-1 ring-border"
            />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Conheça o equipamento, sua utilização e a proposta de formação
              STS.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — O QUE É */}
      <section id="o-que-e" className="bg-surface py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">O que é</p>
            <h2 className="text-balance font-display text-4xl font-bold leading-tight">
              O que é o STS DETOX BioEquilíbrio?
            </h2>
            <p className="mt-6 text-pretty text-base leading-8 text-muted-foreground">
              O STS DETOX BioEquilíbrio é uma proposta complementar voltada ao
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

      {/* USO PESSOAL */}
      <section id="uso-pessoal" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">Uso pessoal</p>
            <h2 className="max-w-[19ch] text-balance font-display text-4xl font-bold leading-tight">
              Um momento de cuidado no conforto da sua casa
            </h2>
            <p className="mt-6 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              Para quem deseja incluir momentos de relaxamento, descanso e
              autocuidado em sua rotina, com comodidade e seguindo corretamente
              as orientações de utilização e segurança.
            </p>
            <p className="mt-4 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              A proposta de uso pessoal foi pensada para proporcionar uma
              experiência tranquila e consciente, respeitando as recomendações
              de higiene, conservação e segurança do equipamento.
            </p>
            <a
              href={waPessoal}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-deep px-6 py-3.5 text-sm font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
            >
              Quero informações para uso pessoal
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

      {/* USO PROFISSIONAL */}
      <section
        id="uso-profissional"
        data-hide-whatsapp-fab
        className="scroll-mt-24 bg-deep py-20 text-aqua-soft lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua-soft/70">Uso profissional</p>
            <h2 className="max-w-[18ch] text-balance font-display text-4xl font-bold leading-tight text-white lg:text-5xl">
              Transforme conhecimento em oportunidade profissional
            </h2>
            <h3 className="mt-7 font-display text-2xl font-bold text-aqua-soft lg:text-3xl">
              Curso DETOX Iônico Prático
            </h3>
            <p className="mt-4 max-w-[62ch] text-pretty text-base leading-7 text-aqua-soft/80 lg:text-lg">
              Formação a distância para quem deseja entrar no mercado de
              trabalho ou ampliar seus conhecimentos e fortalecer o próprio
              negócio com DETOX Iônico.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Award,
                  title: "Certificado",
                  text: "Curso com certificado",
                },
                {
                  icon: Laptop,
                  title: "Modalidade",
                  text: "Ensino a distância",
                },
                {
                  icon: PackageCheck,
                  title: "Equipamento",
                  text: "Opção com aparelho",
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
                Opção com equipamento inclui
              </p>
              <ul className="mt-4 grid gap-3 text-sm text-aqua-soft/80 sm:grid-cols-2">
                {[
                  "Aparelho de DETOX Iônico",
                  "1 eletrodo iônico para 100 sessões",
                  "2 cintas para aplicação de vibropuntura",
                ].map((item) => (
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
                O curso é enviado por e-mail em uma única remessa, de acordo com
                o plano de aulas. Na opção com equipamento, os itens são
                enviados pelos Correios.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waFormacao}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-aqua-soft px-6 py-3.5 text-center text-sm font-semibold text-deep transition-all hover:-translate-y-0.5 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Conhecer a formação
              </a>
              <a
                href={waProfissional}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-center text-sm font-semibold text-aqua-soft ring-1 ring-aqua-soft/40 transition-all hover:-translate-y-0.5 hover:bg-aqua-soft/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Falar com a equipe
              </a>
            </div>
          </div>

          <div className="rise lg:col-span-5">
            <img
              src="/assets/aula-curso.png"
              alt="Professor Tavares ministrando uma aula para uma turma."
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
              sais, corrente elétrica e eletrodos. A cor não deve ser utilizada
              para diagnosticar órgãos ou doenças nem para afirmar a eliminação
              de toxinas específicas.
            </p>
          </div>
        </div>
      </section>

      {/* FORMAÇÃO */}
      <section id="formacao" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="rise mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">Formação profissional</p>
            <h2 className="max-w-[20ch] text-balance font-display text-4xl font-bold leading-tight">
              Conhecimento transforma equipamento em prática responsável
            </h2>
            <p className="mt-6 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              O profissional STS não deve aprender apenas como ligar o aparelho.
              Quanto maior o conhecimento, menor a necessidade de exagerar a
              técnica.
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
              Falar sobre a formação STS
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

      {/* 7 — ABORDAGEM RESPONSÁVEL */}
      <section id="abordagem" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-5 lg:py-8">
            <p className="eyebrow mb-4 text-aqua">Abordagem responsável</p>
            <h2 className="text-balance font-display text-4xl font-bold leading-tight">
              Abordagem responsável e limites científicos
            </h2>
            <p className="mt-6 text-pretty text-base leading-8 text-muted-foreground">
              Água que muda de cor. Espumas. Partículas. Sedimentos. Diferentes
              tonalidades ao longo da sessão. Essas manifestações despertaram
              uma pergunta que atravessou os anos: o que realmente está
              acontecendo?
            </p>
            <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">
              No universo das terapias tradicionais e integrativas surgiram
              interpretações relacionando o que se observa na água ao equilíbrio
              do organismo — uma das características mais conhecidas e também
              mais discutidas da técnica.
            </p>
          </div>
          <div className="rise relative overflow-hidden rounded-3xl bg-deep p-10 text-aqua-soft shadow-xl lg:col-span-7 lg:p-14">
            <p className="eyebrow relative mb-4 text-aqua-soft/70">
              O que a ciência diz
            </p>
            <h3 className="relative max-w-[22ch] text-balance font-display text-3xl font-bold leading-tight">
              A água muda. O fenômeno existe. A interpretação é que precisa de
              cuidado.
            </h3>
            <div className="relative mt-6 max-w-[60ch] space-y-5 text-base leading-8 text-aqua-soft/85">
              <p>
                A ciência trabalha com identificação, medição, comparação e
                análise. Para afirmar que uma substância está sendo eliminada,
                não basta observar a mudança de cor da água: é preciso
                identificar qual substância, em que quantidade e qual sua
                origem.
              </p>
              <p>
                Quando a corrente elétrica atravessa a água com sais e interage
                com eletrodos metálicos, podem ocorrer mudanças de cor,
                partículas e precipitados. A mudança da água existe, mas sua cor
                isoladamente não comprova que substâncias específicas tenham
                saído do fígado, dos rins ou de outros órgãos.
              </p>
              <p>
                O corpo possui mecanismos próprios de processamento e
                eliminação: fígado, rins, intestino, pulmões e pele, cada um
                dentro de suas funções fisiológicas.
              </p>
            </div>
          </div>

          <div className="rise border-t border-border pt-10 lg:col-span-7">
            <h3 className="font-display text-2xl font-bold">
              Tradição e ciência
            </h3>
            <p className="mt-5 max-w-[62ch] text-pretty text-base leading-8 text-muted-foreground">
              A visão tradicional valoriza a experiência acumulada e a
              observação do indivíduo como um todo. A ciência convencional busca
              fenômenos mensuráveis e evidências reproduzíveis. Não precisamos
              transformar essas perspectivas numa disputa: observar sem
              exagerar, investigar sem preconceito, estudar sem parar e evoluir
              sempre.
            </p>
            <p className="mt-4 max-w-[62ch] text-pretty text-base leading-8 text-muted-foreground">
              O STS DETOX BioEquilíbrio nasce da história do DETOX Iônico e
              amplia sua compreensão: o foco deixa de estar exclusivamente na
              água e passa a incluir o estudo do organismo.
            </p>
          </div>
          <div className="rise border-t border-border pt-10 lg:col-span-5">
            <p className="mb-3 font-mono text-xs text-aqua">Temas de estudo</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Temas relacionados ao estudo do organismo, citados apenas como
              campos de estudo — não como benefícios comprovados do equipamento:
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {estudos.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aqua" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LIVROS */}
      <section id="livros" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:px-10">
          <div className="rise">
            <p className="eyebrow mb-4 text-aqua">Publicações</p>
            <h2 className="text-balance font-display text-4xl font-bold leading-tight">
              Conhecimento que continua nos livros
            </h2>
            <p className="mt-6 max-w-[60ch] text-pretty text-base leading-8 text-muted-foreground">
              Conheça as quatro obras de Severino Tavares da Silva sobre o
              funcionamento integrado do corpo humano, o DETOX Iônico e o
              desenvolvimento do Método STS BioEquilíbrio, incluindo o livro DETOX PET.
            </p>
            <Link
              to="/livros"
              className="mt-8 inline-block rounded-full bg-deep px-6 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
            >
              Conhecer os livros
            </Link>
          </div>
          <ul className="rise grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <li className="mx-auto w-full max-w-[280px]">
              <img
                src={capaEnciclopedia.url}
                alt="Capa do livro Enciclopédia Corpo Humano: O Mais Extraordinário Laboratório do Mundo, de Severino Tavares da Silva."
                width={600}
                height={800}
                loading="lazy"
                className="w-full rounded-2xl object-contain shadow-lg"
              />
              <p className="mt-3 text-center font-display text-sm font-bold text-deep">
                Enciclopédia — Corpo Humano
              </p>
            </li>
            <li className="mx-auto w-full max-w-[280px]">
              <img
                src={capaDetoxIonico.url}
                alt="Capa do livro DETOX Iônico: Entre a Medicina Convencional e as Terapias Integrativas, de Severino Tavares da Silva."
                width={600}
                height={800}
                loading="lazy"
                className="w-full rounded-2xl object-contain shadow-lg"
              />
              <p className="mt-3 text-center font-display text-sm font-bold text-deep">
                DETOX Iônico
              </p>
            </li>
            <li className="mx-auto w-full max-w-[280px]">
              <img
                src={capaBioequilibrio.url}
                alt="Capa do livro DETOX BioEquilíbrio: Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo, de Severino Tavares da Silva."
                width={600}
                height={800}
                loading="lazy"
                className="w-full rounded-2xl object-contain shadow-lg ring-1 ring-[#c9a227]/40"
              />
              <p className="mt-3 text-center font-display text-sm font-bold text-deep">
                DETOX BioEquilíbrio
              </p>
            </li>
            <li><DetoxPetCard /></li>
          </ul>
        </div>
      </section>

      <VideoPlaylists />

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
              Fale com o STS DETOX BioEquilíbrio
            </h2>
            <p className="mt-4 max-w-[50ch] text-base leading-8 text-muted-foreground">
              Atendimento para uso pessoal, parcerias profissionais e formação.
            </p>
            <div className="mt-8 flex max-w-xl flex-wrap gap-4">
              <a
                href={waPessoal}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-deep px-6 py-4 text-sm font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
              >
                Atendimento para uso pessoal
              </a>
              <a
                href={waProfissional}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-surface px-6 py-4 text-sm font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-aqua/40"
              >
                Atendimento profissional e formação
              </a>
            </div>
            <div className="mt-8">
              <p className="font-display text-sm font-bold text-foreground">
                Redes sociais
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {redesSociais.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Acessar ${label} do STS`}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-aqua/40"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="rise self-start border-l border-aqua/40 bg-aqua-soft/40 p-8 lg:col-span-5 lg:p-10">
            <p className="eyebrow mb-3 text-deep/60">Informação importante</p>
            <p className="text-pretty text-base leading-8 text-deep/80">
              O STS DETOX BioEquilíbrio é apresentado como uma prática
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
