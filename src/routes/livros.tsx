import { DetoxPetCard, amazonDetoxPet } from "@/components/DetoxPetCard";
import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  waLivros,
  waLivroDetox,
  amazonLivroDetox,
  amazonLivroBioequilibrio,
  amazonEnciclopedia,
} from "@/lib/whatsapp";
import capaEnciclopedia from "@/assets/capa-enciclopedia.jpeg.asset.json";
import capaDetoxIonico from "@/assets/capa-detox-ionico.jpeg.asset.json";
import capaBioequilibrio from "@/assets/capa-bioequilibrio.jpeg.asset.json";
import fotoAutor from "@/assets/autor-tavares.png.asset.json";

/**
 * Dados dos livros.
 * Campos ainda NÃO informados pelo autor (preço, formato, ISBN, editora,
 * dimensões, disponibilidade e frete) ficam como `null` e não são renderizados.
 */
const livros = {
  enciclopedia: {
    titulo:
      "Enciclopédia - Corpo Humano: O Mais Extraordinário Laboratório do Mundo",
    autor: "Severino Tavares da Silva",
    capa: capaEnciclopedia.url as string | null,
    capaAlt:
      "Capa do livro Enciclopédia Corpo Humano: O Mais Extraordinário Laboratório do Mundo, de Severino Tavares da Silva.",
  },
  detox: {
    titulo: "DETOX Iônico - Entre a Medicina Convencional e as Terapias Integrativas",
    autor: "Severino Tavares da Silva",
    capa: capaDetoxIonico.url as string | null,
    capaAlt:
      "Capa do livro DETOX Iônico: Entre a Medicina Convencional e as Terapias Integrativas, de Severino Tavares da Silva.",
  },
  bioequilibrio: {
    titulo:
      "DETOX BioEquilíbrio - Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo",
    autor: "Severino Tavares da Silva",
    capa: capaBioequilibrio.url as string | null,
    capaAlt:
      "Capa do livro DETOX BioEquilíbrio: Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo, de Severino Tavares da Silva.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Book", name: "DETOX PET", inLanguage: "pt-BR", author: { "@type": "Person", name: "Severino Tavares da Silva" }, image: "/assets/capa-detox-pet.jpg", url: amazonDetoxPet },
    {
      "@type": "Book",
      name: livros.enciclopedia.titulo,
      inLanguage: "pt-BR",
      author: { "@type": "Person", name: "Severino Tavares da Silva" },
      image: capaEnciclopedia.url,
      url: amazonEnciclopedia,
      description:
        "Uma viagem progressiva pelo organismo humano, partindo da célula e avançando pelas grandes redes de comunicação, regulação, defesa, adaptação e equilíbrio que sustentam a vida.",
    },
    {
      "@type": "Book",
      name: livros.detox.titulo,
      inLanguage: "pt-BR",
      author: { "@type": "Person", name: "Severino Tavares da Silva" },
      image: capaDetoxIonico.url,
      url: amazonLivroDetox,
      description:
        "Obra dedicada ao DETOX Iônico e ao diálogo entre a medicina convencional e as terapias integrativas, com interesse investigativo e responsabilidade na comunicação.",
    },
    {
      "@type": "Book",
      name: livros.bioequilibrio.titulo,
      inLanguage: "pt-BR",
      author: { "@type": "Person", name: "Severino Tavares da Silva" },
      image: capaBioequilibrio.url,
      url: amazonLivroBioequilibrio,
      description:
        "Fundamentos, reflexões e observações relacionados ao Método STS BioEquilíbrio, dentro de uma proposta de observação funcional do organismo, percepção sensorial, relaxamento e experiência corporal integrada.",
    },
  ],
};

const tituloSeo = "Livros de Severino Tavares da Silva | STS BioEquilíbrio";
const descricaoSeo =
  "Conheça os livros Enciclopédia Corpo Humano, DETOX Iônico, DETOX BioEquilíbrio e DETOX PET, de Severino Tavares da Silva. Obras educativas sobre o organismo humano e as práticas integrativas.";

export const Route = createFileRoute("/livros")({
  head: () => ({
    meta: [
      { title: tituloSeo },
      { name: "description", content: descricaoSeo },
      { property: "og:title", content: tituloSeo },
      { property: "og:description", content: descricaoSeo },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
    ],
  }),
  component: LivrosPage,
});

const publicoEnciclopedia = [
  "Estudantes de enfermagem",
  "Estudantes de fisioterapia",
  "Estudantes de biomedicina",
  "Estudantes de farmácia",
  "Estudantes de educação física",
  "Estudantes de nutrição",
  "Estudantes de estética",
  "Estudantes de terapias integrativas",
  "Alunos de cursos técnicos de saúde",
  "Profissionais da saúde e do bem-estar",
  "Professores de biologia, ciências e educação em saúde",
  "Escolas, faculdades e centros de formação",
  "Bibliotecas universitárias e públicas",
  "Terapeutas e seus alunos",
  "Academias e clínicas",
  "Pais, famílias e leitores interessados em ciência e no funcionamento do corpo humano",
];

const encontrara = [
  "Uma visão progressiva do corpo humano",
  "Relações entre células, tecidos, órgãos e sistemas",
  "Redes de comunicação e regulação",
  "Mecanismos de defesa e adaptação",
  "Equilíbrio e homeostase",
  "Linguagem visual, integrada e acessível",
  "Material para estudo, consulta e atualização geral",
];

const temasBioequilibrio = [
  "Complexidade e capacidade de adaptação do organismo",
  "Interação entre corpo, mente e ambiente",
  "Diferentes formas de compreender o funcionamento humano",
  "Ciência e abordagens integrativas",
  "Fundamentos do Método STS BioEquilíbrio",
  "Estímulos bioelétricos leves",
  "Percepção sensorial",
  "Relaxamento",
  "Experiência corporal integrada",
  "Observação funcional",
  "Responsabilidade profissional",
  "Consciência científica",
];

const prefacio = [
  "O organismo humano sempre despertou fascínio pela sua complexidade, capacidade de adaptação e interação contínua entre corpo, mente e ambiente.",
  "Ao longo dos anos, diferentes formas de compreender o funcionamento humano foram desenvolvidas pela ciência e pelas abordagens integrativas, cada uma buscando interpretar, à sua maneira, os mecanismos relacionados ao equilíbrio, ao bem-estar e à experiência corporal.",
  "O Método STS BioEquilíbrio surge dentro dessa proposta de observação funcional do organismo, utilizando estímulos bioelétricos leves associados à percepção sensorial, ao relaxamento e à experiência corporal integrada.",
  "Esta obra não pretende apresentar verdades absolutas, mas organizar reflexões, observações práticas e fundamentos relacionados à interação entre estímulos físicos e respostas funcionais do organismo humano.",
  "Mais importante do que defender extremos é reconhecer a complexidade do corpo humano e a necessidade de equilíbrio entre observação, responsabilidade e consciência científica.",
  "Que este material contribua para ampliar a reflexão, a responsabilidade profissional e o respeito pela extraordinária complexidade da experiência humana.",
];

const duvidasLivros = [
  {
    q: "Os quatro livros já estão publicados?",
    a: "Sim. Atualmente estão disponíveis quatro títulos de Severino Tavares da Silva: Enciclopédia - Corpo Humano: O Mais Extraordinário Laboratório do Mundo, DETOX Iônico - Entre a Medicina Convencional e as Terapias Integrativas e DETOX BioEquilíbrio - Estímulo Bioelétrico Aplicado ao Equilíbrio Funcional do Organismo e DETOX PET.",
  },
  {
    q: "Como posso adquirir os livros?",
    a: "Clique no botão de compra do livro desejado. Os títulos disponíveis na Amazon abrem diretamente na página oficial de aquisição.",
  },
  {
    q: "Posso adquirir os quatro títulos?",
    a: "Sim. Utilize o botão de contato sobre as quatro obras para consultar disponibilidade, formatos, valores e condições de envio.",
  },
  {
    q: "O livro DETOX BioEquilíbrio apresenta resultados médicos comprovados?",
    a: "A obra possui finalidade educativa e reflexiva. Organiza fundamentos, observações e reflexões relacionados ao Método STS BioEquilíbrio, sem se apresentar como comprovação de diagnóstico, prevenção, tratamento ou cura de doenças.",
  },
  {
    q: "Qual a diferença entre DETOX Iônico e DETOX BioEquilíbrio?",
    a: "O livro DETOX Iônico aborda o tema e o diálogo entre a medicina convencional e as terapias integrativas. DETOX BioEquilíbrio concentra-se nos fundamentos, reflexões e observações relacionados ao desenvolvimento do Método STS BioEquilíbrio.",
  },
  {
    q: "A Enciclopédia é indicada apenas para profissionais?",
    a: "Não. A obra também foi desenvolvida para estudantes, professores, terapeutas, famílias e leitores interessados em compreender o corpo humano por meio de uma linguagem visual e acessível.",
  },
  {
    q: "O livro DETOX Iônico substitui formação profissional?",
    a: "Não. O livro é uma publicação educativa. Formação, habilitação profissional e orientações específicas de uso devem ser tratadas separadamente.",
  },
  {
    q: "Os livros substituem consulta ou acompanhamento médico?",
    a: "Não. Os livros possuem finalidade educativa e não substituem consulta, diagnóstico, acompanhamento ou tratamento médico.",
  },
];

function CapaPlaceholder({
  titulo,
  nota,
  tom = "aqua",
}: {
  titulo: string;
  nota: string;
  tom?: "aqua" | "dourado";
}) {
  return (
    <div
      className={`flex aspect-[3/4] w-full flex-col justify-end rounded-2xl border border-dashed p-6 shadow-sm ${
        tom === "dourado"
          ? "border-[#c9a227]/60 bg-[#0d1b3a]/[0.04]"
          : "border-aqua/50 bg-surface"
      }`}
    >
      <span className="font-display text-base font-bold text-deep">{titulo}</span>
      <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{nota}</span>
    </div>
  );
}

function LivrosPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader ancorasHome={false} />

      {/* ABERTURA */}
      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-12 lg:px-10 lg:py-24">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-5 text-aqua">Publicações STS</p>
            <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl">
              Livros para compreender o corpo humano e ampliar o conhecimento
            </h1>
            <p className="mt-7 max-w-[58ch] text-pretty text-lg leading-8 text-muted-foreground">
              Quatro obras de Severino Tavares da Silva desenvolvidas para leitores que buscam
              conhecimento organizado, linguagem acessível e uma compreensão responsável do
              funcionamento humano, do DETOX Iônico e do Método STS BioEquilíbrio. Conheça também o DETOX PET.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#enciclopedia"
                className="rounded-full bg-deep px-6 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
              >
                Ver Enciclopédia
              </a>
              <a
                href="#detox-ionico"
                className="rounded-full bg-surface px-6 py-3.5 font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-aqua/40"
              >
                Ver DETOX Iônico
              </a>
              <a
                href="#bioequilibrio"
                className="rounded-full bg-surface px-6 py-3.5 font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-[#c9a227]/60"
              >
                Ver DETOX BioEquilíbrio
              </a>
              <a href="#detox-pet" className="rounded-full bg-surface px-6 py-3.5 font-semibold text-foreground ring-1 ring-border hover:ring-aqua/40">Ver DETOX PET</a>
            </div>
          </div>
          <div className="rise grid grid-cols-2 items-start gap-4 lg:col-span-5">
            {livros.enciclopedia.capa ? (
              <img
                src={livros.enciclopedia.capa}
                alt={livros.enciclopedia.capaAlt}
                width={600}
                height={800}
                className="w-full self-center rounded-2xl object-contain shadow-xl"
              />
            ) : (
              <CapaPlaceholder
                titulo="Enciclopédia Corpo Humano"
                nota="Imagem oficial da capa será inserida aqui."
              />
            )}
            <img
              src={capaDetoxIonico.url}
              alt={livros.detox.capaAlt}
              width={600}
              height={800}
              className="w-full self-center rounded-2xl object-contain shadow-xl"
            />
            <img
              src={capaBioequilibrio.url}
              alt={livros.bioequilibrio.capaAlt}
              width={600}
              height={800}
              className="w-full self-center rounded-2xl object-contain shadow-xl ring-1 ring-[#c9a227]/40"
            />
            <DetoxPetCard />
          </div>
        </div>
      </section>

      {/* LIVRO 1 */}
      <section id="enciclopedia" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-5">
            {livros.enciclopedia.capa ? (
              <img
                src={livros.enciclopedia.capa}
                alt={livros.enciclopedia.capaAlt}
                width={900}
                height={1200}
                loading="lazy"
                className="w-full rounded-3xl object-contain shadow-2xl"
              />
            ) : (
              <CapaPlaceholder
                titulo="Enciclopédia Corpo Humano"
                nota="Imagem oficial da capa será inserida aqui."
              />
            )}
          </div>
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">Enciclopédia visual</p>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight lg:text-4xl">
              {livros.enciclopedia.titulo}
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              {livros.enciclopedia.autor}
            </p>
            <p className="mt-4 inline-flex rounded-full bg-aqua-soft px-4 py-2 text-sm font-semibold text-deep ring-1 ring-aqua/25">
              Mais de 500 páginas
            </p>
            <p className="mt-6 text-pretty text-base leading-8 text-muted-foreground">
              Uma viagem progressiva pelo organismo humano, partindo da célula e avançando pelas
              grandes redes de comunicação, regulação, defesa, adaptação e equilíbrio que sustentam
              a vida.
            </p>
            <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">
              A obra foi desenvolvida para aproximar temas complexos da fisiologia humana de uma
              linguagem clara, organizada, visual e acessível. Mais do que apresentar a localização
              dos órgãos, a Enciclopédia procura mostrar como células, tecidos, órgãos e sistemas
              se relacionam e como o corpo conversa consigo mesmo.
            </p>
            <blockquote className="mt-8 rounded-2xl border-l-4 border-[#c9a227] bg-background p-6 text-pretty font-display text-lg leading-8 text-deep">
              Uma viagem da célula à homeostase para descobrir não apenas onde estão os órgãos, mas
              como o corpo conversa consigo mesmo.
            </blockquote>

            <h3 className="mt-10 font-display text-xl font-bold">O que o leitor encontrará</h3>
            <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {encontrara.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aqua" />
                  {i}
                </li>
              ))}
            </ul>

            <h3 className="mt-10 font-display text-xl font-bold">Para quem é esta obra</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {publicoEnciclopedia.map((p) => (
                <li
                  key={p}
                  className="rounded-full bg-background px-4 py-2 text-sm text-muted-foreground ring-1 ring-border"
                >
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[64ch] text-pretty text-base leading-8 text-muted-foreground">
              Indicada especialmente para estudantes e profissionais que precisam compreender o
              funcionamento do corpo humano, mas procuram uma explicação mais visual, integrada e
              acessível do que os grandes tratados acadêmicos.
            </p>

            <a
              href={amazonEnciclopedia}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-block rounded-full bg-deep px-6 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
            >
              Comprar Enciclopédia na Amazon
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              A compra é realizada na página oficial da obra na Amazon.
            </p>
          </div>
        </div>
      </section>

      {/* LIVRO 2 */}
      <section
        id="detox-ionico"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-aqua">DETOX Iônico e práticas integrativas</p>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight lg:text-4xl">
              {livros.detox.titulo}
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground">{livros.detox.autor}</p>
            <p className="mt-4 inline-flex rounded-full bg-aqua-soft px-4 py-2 text-sm font-semibold text-deep ring-1 ring-aqua/25">
              336 páginas
            </p>
            <p className="mt-6 text-pretty text-base leading-8 text-muted-foreground">
              Uma obra dedicada ao DETOX Iônico e ao diálogo entre a medicina convencional e as
              terapias integrativas, abordando o tema com interesse investigativo, visão
              integrativa e responsabilidade na comunicação.
            </p>
            <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">
              O livro acompanha a trajetória de estudo que deu origem à evolução do DETOX Iônico
              para uma compreensão mais cuidadosa, na qual a observação do fenômeno não deve ser
              confundida com diagnóstico ou comprovação automática da eliminação de toxinas
              específicas.
            </p>
            <p className="mt-6 rounded-2xl border-l-4 border-aqua bg-aqua-soft/40 p-6 text-pretty text-base leading-8 text-deep/85">
              Esta publicação é apresentada como conteúdo educativo e não substitui consulta,
              diagnóstico, acompanhamento ou tratamento médico.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={amazonLivroDetox}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-deep px-6 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
              >
                Quero adquirir o livro DETOX Iônico
              </a>
              <a
                href={waLivroDetox}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-surface px-6 py-3.5 font-semibold text-foreground ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-aqua/40"
              >
                Falar pelo WhatsApp
              </a>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Consulte disponibilidade, formato, valor e condições de envio pelo WhatsApp.
            </p>
          </div>
          <div className="rise lg:col-span-5">
            <img
              src={capaDetoxIonico.url}
              alt={livros.detox.capaAlt}
              width={900}
              height={1200}
              loading="lazy"
              className="w-full rounded-3xl object-contain shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* LIVRO 3 */}
      <section
        id="bioequilibrio"
        className="scroll-mt-24 border-y border-[#c9a227]/25 bg-[#0d1b3a]/[0.03] py-24 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <div className="rise lg:col-span-5">
            {livros.bioequilibrio.capa ? (
              <img
                src={livros.bioequilibrio.capa}
                alt={livros.bioequilibrio.capaAlt}
                width={900}
                height={1200}
                loading="lazy"
                className="w-full rounded-3xl object-contain shadow-2xl ring-1 ring-[#c9a227]/40"
              />
            ) : (
              <CapaPlaceholder
                titulo="DETOX BioEquilíbrio"
                nota="Imagem oficial da capa será inserida aqui."
                tom="dourado"
              />
            )}
          </div>
          <div className="rise lg:col-span-7">
            <p className="eyebrow mb-4 text-[#a8861a]">
              Fundamentos, reflexões e observações relacionados ao Método STS BioEquilíbrio
            </p>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight lg:text-4xl">
              {livros.bioequilibrio.titulo}
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              {livros.bioequilibrio.autor}
            </p>
            <p className="mt-4 inline-flex rounded-full bg-background px-4 py-2 text-sm font-semibold text-deep ring-1 ring-[#c9a227]/40">
              130 páginas
            </p>
            <span className="mt-6 block h-px w-24 bg-[#c9a227]" />

            <div className="mt-6 max-w-[66ch] space-y-4 text-pretty text-base leading-8 text-muted-foreground">
              <p>
                O organismo humano desperta fascínio pela sua complexidade, capacidade de adaptação
                e interação contínua entre corpo, mente e ambiente.
              </p>
              <p>
                A obra DETOX BioEquilíbrio apresenta fundamentos, reflexões e observações práticas
                relacionados ao Método STS BioEquilíbrio, dentro de uma proposta de observação
                funcional do organismo, percepção sensorial, relaxamento e experiência corporal
                integrada.
              </p>
              <p>
                O livro procura ampliar a reflexão, a responsabilidade profissional e o respeito
                pela extraordinária complexidade da experiência humana, mantendo o equilíbrio entre
                observação, prudência e consciência científica.
              </p>
            </div>

            <h3 className="mt-10 font-display text-xl font-bold">Sobre esta obra</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Temas abordados pelo livro, apresentados como assuntos de estudo e reflexão.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {temasBioequilibrio.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-background px-4 py-2 text-sm text-muted-foreground ring-1 ring-[#c9a227]/30"
                >
                  {t}
                </li>
              ))}
            </ul>
            <blockquote className="mt-8 rounded-2xl border-l-4 border-[#c9a227] bg-background p-6 text-pretty font-display text-lg leading-8 text-[#0d1b3a]">
              Uma obra que organiza reflexões, observações práticas e fundamentos relacionados à
              interação entre estímulos físicos e respostas funcionais do organismo humano.
            </blockquote>
            <p className="mt-4 max-w-[66ch] text-pretty text-sm leading-7 text-muted-foreground">
              O conteúdo possui finalidade educativa e reflexiva. A obra não apresenta verdades
              absolutas nem deve ser interpretada como comprovação de diagnóstico, prevenção,
              tratamento ou cura de doenças.
            </p>

            <Accordion type="single" collapsible className="mt-8 w-full">
              <AccordionItem value="prefacio" className="border-[#c9a227]/30">
                <AccordionTrigger className="text-left font-display text-base font-bold">
                  Leia o prefácio
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-w-[66ch] space-y-4 text-base leading-8 text-muted-foreground">
                    {prefacio.map((p) => (
                      <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <a
              href={amazonLivroBioequilibrio}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-block rounded-full bg-[#0d1b3a] px-6 py-3.5 font-semibold text-[#e8cf8a] transition-all hover:-translate-y-0.5 hover:bg-[#132552]"
            >
              Comprar DETOX BioEquilíbrio na Amazon
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              A compra é realizada na página oficial da obra na Amazon.
            </p>
          </div>
        </div>
      </section>

      {/* LIVRO 4 */}
      <section id="detox-pet" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="eyebrow mb-8 text-center text-aqua">Publicações STS</p>
          <DetoxPetCard />
        </div>
      </section>

      {/* AQUISIÇÃO DAS QUATRO OBRAS */}
      <section className="bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="text-balance font-display text-4xl font-bold">
            Deseja conhecer as quatro obras?
          </h2>
          <p className="mx-auto mt-6 max-w-[62ch] text-pretty text-base leading-8 text-muted-foreground">
            Entre em contato para consultar a disponibilidade dos quatro títulos e receber
            informações sobre formatos, valores e condições de envio.
          </p>
          <a
            href={waLivros}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-block rounded-full bg-deep px-7 py-3.5 font-semibold text-aqua-soft transition-all hover:-translate-y-0.5 hover:bg-deep-2"
          >
            Quero informações sobre os quatro livros
          </a>
        </div>
      </section>

      {/* AUTOR */}
      <section id="autor" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="rise lg:col-span-4">
            <img
              src={fotoAutor.url}
              alt="Fotografia de Severino Tavares da Silva, autor dos livros."
              width={400}
              height={500}
              loading="lazy"
              className="aspect-[4/5] w-full max-w-[320px] rounded-3xl object-cover shadow-xl"
            />
          </div>
          <div className="rise lg:col-span-8">
            <p className="eyebrow mb-4 text-aqua">Sobre o autor</p>
            <h2 className="font-display text-4xl font-bold">Severino Tavares da Silva</h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Autor e pesquisador independente
            </p>
            <div className="mt-6 max-w-[66ch] space-y-4 text-pretty text-base leading-8 text-muted-foreground">
              <p>
                Severino Tavares da Silva dedica parte de sua trajetória ao estudo do corpo humano,
                de seus mecanismos de funcionamento e das extraordinárias relações existentes entre
                células, tecidos, órgãos e sistemas.
              </p>
              <p>
                Sua busca pelo conhecimento e pelo desenvolvimento de materiais educativos deu
                origem a obras construídas com o propósito de aproximar temas complexos de uma
                linguagem clara, organizada e acessível.
              </p>
              <p>
                Em seus livros, o autor procura despertar a curiosidade e estimular uma compreensão
                integrada do ser humano, valorizando o conhecimento como ferramenta para uma vida
                mais saudável e consciente.
              </p>
              <p>
                Suas publicações percorrem três campos complementares de estudo: a compreensão
                integrada do corpo humano, a análise responsável do DETOX Iônico e os fundamentos
                do Método STS BioEquilíbrio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DÚVIDAS */}
      <section id="duvidas-livros" className="scroll-mt-24 bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <p className="eyebrow mb-4 text-aqua">Dúvidas</p>
          <h2 className="text-balance font-display text-4xl font-bold">Dúvidas sobre os livros</h2>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {duvidasLivros.map((d, i) => (
              <AccordionItem key={d.q} value={`livro-${i}`}>
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

      {/* CHAMADA FINAL */}
      <section id="contato" className="scroll-mt-24 bg-deep py-24 text-aqua-soft lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="max-w-[22ch] text-balance font-display text-4xl font-bold leading-tight lg:text-5xl">
            Leve o conhecimento para seus estudos e sua prática
          </h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-lg leading-8 text-aqua-soft/85">
            Escolha uma das obras ou consulte as condições para adquirir os quatro livros de Severino
            Tavares da Silva.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={amazonEnciclopedia}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-aqua-soft px-6 py-3.5 font-semibold text-deep transition-all hover:-translate-y-0.5 hover:bg-surface"
            >
              Enciclopédia na Amazon
            </a>
            <a
              href={amazonLivroDetox}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3.5 font-semibold text-aqua-soft ring-1 ring-aqua-soft/40 transition-all hover:-translate-y-0.5 hover:bg-aqua-soft/10"
            >
              Quero o livro DETOX Iônico
            </a>
            <a
              href={amazonLivroBioequilibrio}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3.5 font-semibold text-[#e8cf8a] ring-1 ring-[#c9a227]/70 transition-all hover:-translate-y-0.5 hover:bg-[#c9a227]/15"
            >
              DETOX BioEquilíbrio na Amazon
            </a>
            <a href={amazonDetoxPet} target="_blank" rel="noopener noreferrer" className="rounded-full bg-aqua-soft px-6 py-3.5 font-semibold text-deep">DETOX PET na Amazon</a>
            <a
              href={waLivros}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3.5 font-semibold text-aqua-soft ring-1 ring-aqua-soft/40 transition-all hover:-translate-y-0.5 hover:bg-aqua-soft/10"
            >
              Quero informações sobre os quatro livros
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SiteFooter />
      </div>

      <WhatsAppFab href={waLivros} />
    </div>
  );
}
