// Identificadores locais. Nunca usar o título da fonte como se fosse o assunto.
const subjects = {
  equipment: { name: 'o DETOX BioEquilíbrio', label: 'o aparelho DETOX BioEquilíbrio', match: /\bbio\s*equil[ií]brio\b/i },
  technique: { name: 'o DETOX Iônico', label: 'a técnica DETOX Iônico', match: /\bdetox\s+i[oô]nico\b/i },
  pet: { name: 'o DETOX PET', label: 'o DETOX PET', match: /\bdetox\s+pet\b/i },
  encyclopedia: { name: 'a Enciclopédia', label: 'a Enciclopédia', match: /\benciclop[eé]dia\b/i },
  kidneys: { name: 'os rins', label: 'os rins', match: /\brins\b/i },
} as const;
export type Subject = keyof typeof subjects;
const reference = /\b(?:(?:[dn]?(?:ele|ela)s?)|(?:[dn]?(?:isso|isto))|[dn]?(?:esse|este|aquele)\s+aparelho|[dn]?(?:essa|esta|aquela)\s+t[eé]cnica)\b/i;

export function resolveBookContext(originalQuestion: string, previous: readonly Subject[] = []) {
  const question = originalQuestion.normalize('NFC');
  const named = (Object.keys(subjects) as Subject[]).filter(id => subjects[id].match.test(question));
  // Uma indicação de obra delimita a fonte. Se houver um órgão nomeado, ele é o tema.
  const current = named.includes('kidneys') ? named.filter(id => id !== 'encyclopedia') : named;
  const ref = reference.exec(question);
  if (!ref) return { query: question, subjects: current };
  // Um nome junto ao demonstrativo já explicita o referente na própria pergunta.
  const tail = question.slice(ref.index + ref[0].length).trimStart();
  if (/^(?:detox\b|bioequil[ií]brio\b)/i.test(tail) && current.length === 1)
    return { query: question.replace(reference, '').trim(), subjects: current };
  let options = [...previous];
  if (/aparelho/i.test(ref[0])) options = options.filter(id => id === 'equipment');
  if (/t[eé]cnica/i.test(ref[0])) options = options.filter(id => id === 'technique');
  if (options.length !== 1 || current.length) {
    const labels = [...new Set([...options, ...current])].map(id => subjects[id].label);
    return { query: question, subjects: [...new Set([...options, ...current])],
      clarification: labels.length > 1 ? 'Você se refere a ' + labels.join(' ou ') + '?' : 'A qual assunto você se refere? Inclua o nome na pergunta.' };
  }
  const name = subjects[options[0]!].name;
  const prefix = /^[dn]/i.test(ref[0]) ? ref[0][0]!.toLowerCase() : '';
  const query = question.replace(reference, prefix + name).replace(/^\s*e\s+/i, '')
    .replace(/^como (.+) funciona(\s*[?!]?)$/i, 'Como funciona $1$2');
  return { query, subjects: options };
}
