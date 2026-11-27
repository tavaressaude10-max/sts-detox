import { waGeral } from "@/lib/whatsapp";
import { ArrowRight } from "lucide-react";
import { rememberEquipmentReading, rememberReading, useReadingReturn } from "@/components/VoltarLeitura";

export const itensConjunto = [
  "Aparelho DETOX BIOEQUILÍBRIO",
  "1 eletrodo para aproximadamente 250 sessões",
  "1 cinta BioVibracional",
  "Material de estudo digital, incluindo manual de uso e instruções do aparelho e acessórios",
];

const destinosConjunto = [
  "/nossa-historia#bioequilibrio-atual",
  "#eletrodo-250",
  "#video-cinta-biovibracional",
  "#livros",
] as const;

export function DestaqueBioequilibrio() {
  useReadingReturn();
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
            CONHEÇA O DETOX BIOEQUILÍBRIO
          </h2>
          <p className="mt-6 text-lg leading-8 text-aqua-soft/85">
            Equipamento, acessórios e conhecimento reunidos em uma proposta
            desenvolvida para uma experiência de bem-estar confortável.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <a
              id="leitura-equipamento-destaque" onClick={rememberEquipmentReading}
              href="/nossa-historia#bioequilibrio-atual"
              className="inline-flex min-h-12 items-center rounded-full bg-aqua-soft px-6 py-3 text-sm font-semibold text-deep"
            >
              CONHECER O DETOX BIOEQUILÍBRIO
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
        <div id="conjunto-inclui" className="scroll-mt-24 rounded-3xl border border-aqua-soft/25 bg-white/5 p-6 sm:p-9">
          <h3 className="font-display text-xl font-bold text-white">
            O conjunto inclui
          </h3>
          <ul className="mt-5 space-y-4">
            {itensConjunto.map((item, index) => (
              <li
                key={item}
                className="border-t border-aqua-soft/15 text-sm leading-7"
              >
                {destinosConjunto[index] ? (
                  <a
                    href={destinosConjunto[index]!}
                    id={`conjunto-item-${index}`}
                    onClick={(event) => {
                      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                      rememberReading(destinosConjunto[index]!, index);
                      if (index === 2 && window.location.hash === destinosConjunto[index]) {
                        window.dispatchEvent(new Event("hashchange"));
                      }
                    }}
                    className="relative flex w-full gap-4 pt-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-aqua-soft"
                  >
                    <span className="font-mono text-aqua-soft/60">0{index + 1}</span>
                    <span className="min-w-0 flex-1 pr-5">{item}</span>
                    <ArrowRight aria-hidden="true" className="absolute right-0 top-[1.375rem] size-4 text-aqua-soft/60" />
                  </a>
                ) : (
                  <div className="flex gap-4 pt-4">
                    <span className="font-mono text-aqua-soft/60">0{index + 1}</span>
                    <span>{item}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
