const blocos = [
  {
    kind: "paragraph",
    text: "Durante uma sessão, a água pode apresentar mudanças de cor, espumas, partículas e sedimentos. Essas alterações fazem parte das observações que tornaram o DETOX IÔNICO conhecido e despertaram interesse sobre a possível eliminação de toxinas.",
  },
  {
    kind: "heading",
    text: "A interpretação tradicional e a experiência prática",
  },
  {
    kind: "paragraph",
    text: "A Medicina Tradicional Chinesa compreende o organismo por meio de diferentes relações e padrões, envolvendo conceitos como Yin e Yang, Cinco Elementos, órgãos e sistemas, alimentação, estações do ano e estados de equilíbrio e desequilíbrio.",
  },
  {
    kind: "paragraph",
    text: "Dentro dessa tradição, existem correspondências entre elementos, órgãos, cores e estações — como o verde relacionado à Madeira, fígado e vesícula biliar, e o vermelho relacionado ao Fogo e coração.",
  },
  {
    kind: "paragraph",
    text: "A pulsologia faz parte dessa tradição e utiliza características e posições do pulso na avaliação desses padrões. Na prática integrativa, outros recursos, como o Ryodoraku, também podem ser utilizados como avaliações complementares.",
  },
  {
    kind: "paragraph",
    text: "Na experiência acumulada com o DETOX IÔNICO, essas informações são comparadas com características observadas durante e após as sessões, incluindo cores da água, espumas, partículas e sedimentos.",
  },
  {
    kind: "paragraph",
    text: "Ao longo dos anos, foram percebidas correspondências entre alguns padrões observados previamente e determinadas características da água e da espuma. Essas correspondências constituem observações e interpretações da prática e não devem ser utilizadas isoladamente para diagnosticar doenças ou afirmar que determinada cor comprova alteração de um órgão.",
  },
  {
    kind: "paragraph",
    text: "Esses conceitos, observações e suas limitações são aprofundados nos livros do autor.",
  },
  {
    kind: "heading",
    text: "O que as pesquisas mostram",
  },
  {
    kind: "paragraph",
    text: "A ciência também estuda os efeitos da estimulação elétrica sobre o organismo. Diferentes modalidades de estimulação elétrica são utilizadas e pesquisadas em áreas como controle da dor, estimulação neuromuscular e cicatrização de feridas.",
  },
  {
    kind: "paragraph",
    text: "Os resultados dependem do tipo de corrente, intensidade, frequência, duração, posicionamento dos eletrodos e finalidade da aplicação. Por isso, evidências obtidas com uma modalidade de eletroterapia não podem ser automaticamente atribuídas ao DETOX IÔNICO.",
  },
  {
    kind: "paragraph",
    text: "Também existem pesquisas específicas sobre banhos iônicos. Estudos já analisaram elementos presentes na água antes e depois das sessões. Alguns resultados ajudam a distinguir aquilo que já foi demonstrado cientificamente das hipóteses e observações que ainda necessitam de investigação.",
  },
  {
    kind: "heading",
    text: "Conhecimento em evolução",
  },
  {
    kind: "paragraph",
    text: "A existência de questões ainda não comprovadas não significa que elas devam ser ignoradas. Significa que precisam ser investigadas.",
  },
  {
    kind: "paragraph",
    text: "Por isso, apresentamos lado a lado o conhecimento tradicional, a experiência observacional e as evidências científicas disponíveis, permitindo que cada informação seja compreendida dentro dos seus próprios limites.",
  },
  {
    kind: "strong",
    text: "A observação merece ser registrada. A interpretação exige responsabilidade.",
  },
];
const estudos = [
  "Bioeletricidade",
  "Circulação periférica",
  "Líquidos corporais e interstício",
  "Estimulação sensorial",
  "Sistema Nervoso Autônomo",
  "Sistema linfático",
  "Fáscia e tecido conjuntivo",
  "Mecanismos naturais de equilíbrio",
];
export function AbordagemResponsavel() {
  return (
    <section id="abordagem" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <p className="eyebrow mb-4 text-aqua">Abordagem responsável</p>
        <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Cores, espumas e toxinas: o que se observa e como interpretar?
        </h2>
        <div className="mt-8 max-w-4xl space-y-5 text-base leading-8 text-muted-foreground">
          {blocos.map((b, i) =>
            b.kind === "heading" ? (
              <h3
                key={i}
                className="pt-8 font-display text-2xl font-bold text-deep"
              >
                {b.text}
              </h3>
            ) : b.kind === "strong" ? (
              <p
                key={i}
                className="rounded-xl border-l-4 border-aqua bg-aqua-soft/40 p-6 font-semibold text-deep"
              >
                {b.text}
              </p>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
        </div>
        <div className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-5">
          <div className="space-y-5 text-base leading-8 text-muted-foreground lg:col-span-3">
            <h3 className="font-display text-2xl font-bold text-deep">
              Tradição, experiência e ciência
            </h3>
            <p>
              A visão tradicional valoriza a experiência acumulada e a
              observação do indivíduo como um todo. A ciência investiga
              fenômenos mensuráveis, busca mecanismos e procura evidências
              reproduzíveis.
            </p>
            <p>
              Essas perspectivas não precisam ser tratadas como uma disputa.
              Observar, comparar, investigar e estudar são caminhos que podem
              ampliar o conhecimento, desde que cada conclusão respeite os
              limites das evidências disponíveis.
            </p>
            <p>
              O DETOX BIOEQUILÍBRIO nasce da história do DETOX IÔNICO e
              amplia essa compreensão: o olhar deixa de estar concentrado apenas
              nas características da água e passa também para o estudo do
              organismo e de suas respostas.
            </p>
          </div>
          <aside className="rounded-2xl bg-aqua-soft/30 p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-deep">
              Temas de estudo
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Temas relacionados ao estudo do organismo e aos possíveis
              mecanismos envolvidos, apresentados como campos de conhecimento e
              investigação — não como benefícios comprovados do equipamento:
            </p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {estudos.map((e) => (
                <li key={e} className="border-t border-deep/10 pt-3">
                  {e}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
