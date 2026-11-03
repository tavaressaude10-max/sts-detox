// Executar com: node --env-file=.env.commerce.local --experimental-strip-types scripts/diagnose-shipping.mjs
// Sem mocks, sem pagamentos, sem imprimir credenciais ou respostas brutas.
import { configFromEnv, realProviders } from '../server/commerce/providers.ts';
import { cep, packageFor } from '../server/commerce/domain.ts';

const config = configFromEnv(process.env);
console.log(JSON.stringify({ environment: 'SuperFrete sandbox', tokenConfigured: Boolean(config.superfreteToken.trim()), origin: '58315000', quantity: 1, package: packageFor(1) }));
for (const input of ['58417-065', '15375-126']) {
  let called = false;
  let httpStatus = null;
  const providers = realProviders(config, async (url, init) => {
    called = true;
    const response = await fetch(url, init);
    httpStatus = response.status;
    return response;
  });
  try {
    const options = await providers.quote(cep(input), 1);
    console.log(JSON.stringify({ cep: input, normalized: cep(input), called, httpStatus, simulated: false, options }));
  } catch (error) {
    console.log(JSON.stringify({ cep: input, normalized: cep(input), called, httpStatus, simulated: false, code: error.code || 'network_or_response_error' }));
    process.exitCode = 1;
  }
}
