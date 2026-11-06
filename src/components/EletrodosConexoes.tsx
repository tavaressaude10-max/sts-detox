import { shopProducts } from "@/lib/shop-catalog";
const images = {
  guide: "/assets/Guia de Eletrodos e Conectores.png",
  exclusive: "/assets/Eletrodo 250 Sessões com Conector P10.png",
};

const conectores = [
  "XLR macho — 3 pinos",
  "XLR fêmea — 3 furos",
  "P10 macho",
  "Mike fêmea — 2 furos",
];

// Enquadramentos das fotos originais do guia, sem recriar os conectores.
const connectorPhotoX: Record<string, number> = {
  "XLR macho — 3 pinos": 58,
  "XLR fêmea — 3 furos": 419,
  "P10 macho": 782,
  "Mike fêmea — 2 furos": 1145,
  "Conector Nº 2 — P10 macho": 782,
};

function OpcaoEletrodo({
  sessoes,
  preco,
  conector,
}: {
  sessoes: number;
  preco: string;
  conector: string;
}) {
  const product = shopProducts.find(p => p.sessions === sessoes && p.connector === conector);
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-deep/15 bg-surface p-3 sm:p-4">
      <svg
        viewBox={`${connectorPhotoX[conector]} 681 338 205`}
        role="img"
        aria-label={`Encaixe do conector ${conector}`}
        className="mx-auto mb-2 block h-auto w-full max-w-36 rounded-xl bg-white"
      >
        <image href={images.guide} width="1536" height="1024" />
      </svg>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Aproximadamente {sessoes} sessões
      </p>
      <h4 className="mt-1 font-display text-base font-bold leading-snug text-deep">
        {conector}
      </h4>
      <p className="mt-2 flex-1 text-lg font-bold text-deep">
        R$ {preco}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          cada
        </span>
      </p>
      <a
        href={`/compra?produto=${product!.id}`}
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-deep px-2 py-2 text-center text-sm font-semibold text-aqua-soft hover:bg-deep-2"
      >
        Comprar este modelo
      </a>
    </article>
  );
}

export function EletrodosConexoes() {
  return (
    <section
      id="eletrodos-conexoes"
      aria-labelledby="eletrodos-title"
      className="scroll-mt-24 border-y border-border/70 bg-aqua-soft/15 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-deep">
          Eletrodos e conexões
        </p>
        <h2
          id="eletrodos-title"
          className="mt-3 font-display text-2xl font-bold leading-tight text-deep sm:text-4xl"
        >
          Qual conector encaixa no seu aparelho?
        </h2>
        <div className="mt-4 grid items-center gap-3 sm:grid-cols-2 sm:gap-6">
          <figure className="mx-auto w-[94%] max-w-md sm:w-full">
            <a
              href={images.guide}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ampliar guia de eletrodos e conectores (abre em nova aba)"
              className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep"
            >
              <img
                src={images.guide}
                width={1536}
                height={1024}
                loading="lazy"
                className="h-auto w-full rounded-xl"
                alt="Eletrodos de 100 e 200 sessões. Conectores: 1-A XLR macho, 3 pinos; 1-B XLR fêmea, 3 furos; Nº 2 P10 macho; Nº 3 Mike fêmea, 2 furos."
              />
            </a>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              Toque na imagem para ampliar.
            </figcaption>
          </figure>
          <div className="space-y-2 text-sm leading-relaxed sm:text-base">
            <p>
              Escolha o eletrodo de 100 ou 200 sessões e indique o conector que
              encaixa no seu aparelho.
            </p>
            <p>Não sabe o nome? Compare a imagem e informe o número.</p>
            <p className="text-sm text-muted-foreground">
              Exemplos: “Eletrodo 200 sessões + conector Nº 3”
              <br />
              “Eletrodo 100 sessões + conector 1-B”
            </p>
          </div>
        </div>
        <div className="mt-5">
          <p className="font-display text-lg font-bold text-deep">
            Confira o conector do seu aparelho e escolha abaixo o modelo
            correspondente.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Antes da compra, confira atentamente o modelo do conector do seu
            aparelho.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Selecione o modelo para escolher a quantidade e calcular o frete. Compra disponível somente em ambiente de teste nesta etapa.</p>
          {[
            { sessoes: 100, preco: "198,00" },
            { sessoes: 200, preco: "298,00" },
          ].map((grupo) => (
            <div key={grupo.sessoes} className="mt-5">
              <h3 className="font-display text-xl font-bold text-deep">
                Aproximadamente {grupo.sessoes} sessões — R$ {grupo.preco} cada
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                {conectores.map((conector) => (
                  <OpcaoEletrodo
                    key={conector}
                    {...grupo}
                    conector={conector}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-deep/15 pt-5">
          <h3 className="font-display text-2xl font-bold text-deep">
            Aproximadamente 250 sessões — R$ 339,00 cada
          </h3>
          <p className="mt-1 font-semibold text-deep">
            Exclusivo para o DETOX BIOEQUILÍBRIO
          </p>
          <div className="mt-3 grid items-center gap-3 sm:grid-cols-2 sm:gap-x-6">
            <figure className="mx-auto w-[84%] max-w-sm sm:row-span-2 sm:w-full">
              <a
                href={images.exclusive}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ampliar imagem do eletrodo de 250 sessões (abre em nova aba)"
                className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep"
              >
                <img
                  src={images.exclusive}
                  width={1536}
                  height={1024}
                  loading="lazy"
                  className="h-auto w-full rounded-xl"
                  alt="Eletrodo de 250 sessões, exclusivo para DETOX BIOEQUILÍBRIO. Conector Nº 2, P10 macho. Cabo do eletrodo de aproximadamente 50 cm."
                />
              </a>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                Toque na imagem para ampliar.
              </figcaption>
            </figure>
            <p className="text-sm leading-relaxed sm:text-base">
              Exclusivo para o DETOX BIOEQUILÍBRIO: o cabo de aproximadamente 50
              cm conecta-se, por P10, ao cabo de aproximadamente 1,20 m que sai do
              aparelho.
            </p>
            <div className="w-full max-w-sm">
              <OpcaoEletrodo
                sessoes={250}
                preco="339,00"
                conector="Conector Nº 2 — P10 macho"
              />
            </div>
          </div>
        </div>
        {/* Vídeos demonstrativos futuros entram aqui após aprovação, sem placeholders visíveis. */}
      </div>
    </section>
  );
}
