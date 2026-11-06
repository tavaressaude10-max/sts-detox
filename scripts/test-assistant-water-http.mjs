import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Carrega por HTTP os módulos que o Vite entrega ao navegador, sem mock do F4.
const origin = 'http://127.0.0.1:5174';
const nativeFetch = globalThis.fetch;
const modules = new Map();
async function servedModule(path) {
  const url = new URL(path, origin).href;
  if (modules.has(url)) return modules.get(url);
  const response = await nativeFetch(url);
  assert.equal(response.status, 200, url);
  let code = await response.text();
  const imports = [...code.matchAll(/from\s*["']([^"']+)["']/g)];
  for (const match of imports) {
    const dependency = await servedModule(new URL(match[1], url).href);
    code = code.replace(match[0], 'from ' + JSON.stringify(dependency));
  }
  const result = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  modules.set(url, result);
  return result;
}
globalThis.fetch = (url, options = {}) => nativeFetch(new URL(url, origin), {
  ...options, headers: { ...options.headers, Origin: origin },
});
const component = await (await nativeFetch(origin + '/src/components/AssistenteTavares.tsx')).text();
assert.match(component, /resolveAssistantAnswer/);
assert.match(component, /\/src\/lib\/assistant-response.ts/);
const { resolveAssistantAnswer } = await import(await servedModule('/src/lib/assistant-response.ts'));
const signal = new AbortController().signal;
const questions = [
  'O que significam as cores e espumas na água do DETOX IÔNICO?',
  'O que significam as cores, os resíduos e as espumas na água durante o DETOX IÔNICO?',
  'O que significa a cor e a espuma na água do detox ionico?',
  'O que representam os resíduos e as espumas na água do DETOX IÔNICO?',
  'A espuma significa toxinas?',
  'As espumas na água indicam eliminação de toxinas?',
  'O que a medicina chinesa diz sobre as cores da água?',
  'O que a Medicina Tradicional Chinesa diz sobre as cores da água?',
];
let count = 0;
for (const previous of [[], ['pet'], ['kidneys'], ['equipment', 'technique']]) {
  for (const question of questions) {
    const answer = await resolveAssistantAnswer(question, 'DETOX PET', signal, true, previous);
    assert.equal(answer.handoff, false, question);
    assert.match(answer.text, /sem comprovação científica suficiente/);
    for (const page of [191, 141, 176]) assert.ok(answer.sourceLabel.includes(`página ${page} do livro`));
    assert.deepEqual(answer.subjects, ['technique']);
    count++;
  }
}
console.log(`OK: ${count} consultas à versão HTTP, incluindo a pergunta exata e quatro contextos.`);
const bundle = JSON.parse(await readFile(new URL('../.private-assistant-node/f4.json', import.meta.url), 'utf8'));
let aliases = 0;
for (const record of bundle.records) {
  for (const question of record.aliases) {
    const answer = await resolveAssistantAnswer(question, undefined, signal);
    assert.equal(answer.text.toLowerCase(), record.text.toLowerCase(), question);
    aliases++;
  }
}
console.log(`OK: ${bundle.records.length} respostas F4 e ${aliases} aliases via /api/assistente-local real.`);
for (const question of ['A espuma indica doença no fígado?', 'Quero comprar eletrodos', 'Quero falar com uma pessoa']) {
  const answer = await resolveAssistantAnswer(question, undefined, signal);
  assert.ok(!answer.sourceLabel?.includes('página 191 do livro'), question);
}
console.log('OK: perguntas específicas de saúde, compra e atendimento não capturadas pela nova regra.');
for (const question of [
  'O DETOX IÔNICO e o DETOX BioEquilíbrio oferecem benefícios?',
  'Quais são os benefícios do DETOX IÔNICO e do DETOX BioEquilíbrio?',
  'Detox BioEquilibrio e Detox Ionico tem beneficios?',
]) {
  const answer = await resolveAssistantAnswer(question, 'DETOX PET', signal, false, ['pet']);
  assert.equal(answer.handoff, false);
  assert.match(answer.text, /experiências individuais/);
  for (const page of [27, 37, 58, 67]) assert.ok(answer.sourceLabel.includes(`página ${page} do livro`));
  assert.deepEqual(answer.subjects, ['technique', 'equipment']);
}
for (const question of ['O DETOX IÔNICO e o DETOX BioEquilíbrio oferecem benefícios para diabetes?', 'Quais os benefícios do DETOX IÔNICO?']) {
  const answer = await resolveAssistantAnswer(question, undefined, signal);
  assert.ok(!answer.sourceLabel?.includes('página 27 do livro'));
}
console.log('OK: resposta conjunta de benefícios, variantes e limites de escopo.');
