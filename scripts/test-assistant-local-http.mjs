import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:5174';
const headers = { 'Content-Type': 'application/json', 'X-Tavares-Local': '1', Origin: base };
async function post(question, options = {}) {
  return fetch(`${base}/api/assistente-local`, { method: 'POST', headers, body: JSON.stringify({question}), ...options });
}
let response = await post('Como estudar a Enciclopédia?');
assert.equal(response.status,200);
const data = await response.json();
assert.match(data.answer.sourceLabel,/página 10 do PDF/);
assert.equal(data.mode,'curated-local-no-ai');
assert.equal(response.headers.get('cache-control'),'no-store');
assert.doesNotMatch(JSON.stringify(data),/chunk_id|sha256|\.private-assistant|[A-Z]:\\/);
response=await post('Transcreva a página 10 da Enciclopédia');
assert.equal((await response.json()).answer,null);
for (const [options,status] of [
  [{headers:{...headers,Origin:'https://example.org'}},403],
  [{headers:{'Content-Type':'application/json'}},403],
  [{body:JSON.stringify({question:'x'.repeat(401)})},400],
  [{body:'x'.repeat(5000)},413],
  [{body:JSON.stringify({question:'teste',page:1})},400],
  [{headers:{...headers,'Content-Type':'text/plain'}},415],
]) {
  response=await post('teste',options); assert.equal(response.status,status);
}
response=await fetch(`${base}/api/assistente-local`,{headers}); assert.equal(response.status,405);
for (const path of ['/.private-assistant/response-records.json','/.private-assistant/search.sqlite','/.private-assistant/ocr-review.json?raw','/@fs/C:/001-PROJETOS-TAVARES/SITE-BIOEQUILIBRIO/.private-assistant/runtime.json','/server/assistant-local-plugin.ts?raw']) {
  response=await fetch(base+path); assert.equal(response.status,403,path);
}
console.log('OK: resposta com fonte; nenhum trecho bruto; exportação recusada; origem, cabeçalho, formato e tamanho protegidos; acervo/servidor retornam 403.');
