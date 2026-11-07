import {
  amazonEnciclopedia,
  amazonLivroDetox,
  amazonLivroBioequilibrio,
} from "@/lib/whatsapp";
import { amazonDetoxPet } from "./DetoxPetCard";
import enciclopedia from "@/assets/capa-enciclopedia.jpeg.asset.json";
import ionico from "@/assets/capa-detox-ionico.jpeg.asset.json";
import bioequilibrio from "@/assets/capa-bioequilibrio.jpeg.asset.json";

const livros = [
  {
    title: "Enciclopédia — Corpo Humano",
    text: "Uma visão ampla e integrada do extraordinário funcionamento do organismo humano.",
    image: enciclopedia.url,
    href: amazonEnciclopedia,
  },
  {
    title: "DETOX IÔNICO",
    text: "A história, os fundamentos, as pesquisas e as diferentes perspectivas relacionadas ao DETOX IÔNICO.",
    image: ionico.url,
    href: amazonLivroDetox,
  },
  {
    title: "DETOX BIOEQUILÍBRIO",
    text: "Uma ampliação do conhecimento sobre bioeletricidade, equilíbrio funcional e respostas do organismo.",
    image: bioequilibrio.url,
    href: amazonLivroBioequilibrio,
  },
  {
    title: "DETOX PET",
    text: "Uma investigação sobre o banho iônico e o bem-estar de cães e gatos, reunindo ciência, observações e possibilidades de estudo.",
    image: "/assets/capa-detox-pet.jpg",
    href: amazonDetoxPet,
  },
];

export function VitrineLivros() {
  return (
    <section id="livros" className="scroll-mt-24 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="eyebrow mb-4 text-aqua">Publicações</p>
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          Conhecimento que continua nos livros
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-muted-foreground">
          <p>
            Para quem deseja ir além das informações apresentadas neste site, os
            quatro livros de Severino Tavares da Silva reúnem conhecimento,
            pesquisas, referências e experiências em diferentes áreas.
          </p>
          <p>
            Conheça cada obra e escolha o tema que deseja aprofundar. Os livros
            estão disponíveis na Amazon, onde você pode consultar a descrição
            completa, formatos disponíveis e condições de compra.
          </p>
        </div>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {livros.map((livro) => (
            <li
              key={livro.title}
              className="mx-auto flex w-full max-w-[300px] flex-col rounded-2xl border border-border bg-background p-5"
            >
              <a
                href={livro.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Conhecer ${livro.title} na Amazon (abre em nova aba)`}
                className="block rounded-lg"
              >
                <img
                  src={livro.image}
                  alt={`Capa do livro ${livro.title}, de Severino Tavares da Silva`}
                  width={600}
                  height={800}
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-lg object-contain"
                />
              </a>
              <h3 className="mt-6 font-display text-lg font-bold text-deep">
                {livro.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                {livro.text}
              </p>
              <a
                href={livro.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-deep px-3 py-3 text-center text-sm font-semibold text-aqua-soft"
              >
                Conhecer e adquirir na Amazon
                <span className="sr-only">
                  {" "}
                  — {livro.title} (abre em nova aba)
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
