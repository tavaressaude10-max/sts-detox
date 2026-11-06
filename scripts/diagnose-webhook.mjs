// Diagnóstico temporário: somente teste, sem registrar payloads, IDs, URLs ou headers.
import { pathToFileURL } from 'node:url';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { configFromEnv, realProviders, validPaymentId } from '../server/commerce/providers.ts';
import { createCommerceServer, verifyWebhook } from '../server/commerce/http.ts';
import { PrivateStore } from '../server/commerce/store.ts';
import { CommerceService } from '../server/commerce/service.ts';

export function observeWebhooks(server, config, write = line => console.log(line)) {
  if (config.mode !== 'test') throw Error('Diagnóstico permitido somente em teste.');
  let sequence = 0;
  server.prependListener('request', (req, res) => {
    const url = new URL(req.url || '/', 'http://local.invalid');
    if (!url.pathname.startsWith('/api/loja/webhooks') || sequence >= 200) return;
    const attempt = ++sequence, started = Date.now();
    const id = url.searchParams.get('data.id') || '';
    const signature = String(req.headers['x-signature'] || '');
    const requestId = String(req.headers['x-request-id'] || '');
    const fields = Object.fromEntries(signature.split(',').map(v => v.trim().split('=')));
    const ts = fields.ts || '', hash = fields.v1 || '';
    // Comparação independente com normalização/manifesto do SDK Node oficial.
    // Resultados somente diagnósticos: não mudam a decisão do handler.
    const sdkFields = Object.fromEntries(signature.split(',').flatMap(part => {
      const eq = part.indexOf('=');
      return eq < 0 ? [] : [[part.slice(0, eq).trim().toLowerCase(), part.slice(eq + 1).trim()]];
    }));
    const matches = (candidateId, candidateRequestId = requestId.trim()) => {
      if (!/^[a-f0-9]{64}$/.test(sdkFields.v1 || '')) return false;
      const manifest = `${candidateId ? `id:${candidateId};` : ''}${candidateRequestId ? `request-id:${candidateRequestId};` : ''}ts:${sdkFields.ts || ''};`;
      const computed = createHmac('sha256', config.webhookSecret).update(manifest).digest('hex');
      return timingSafeEqual(Buffer.from(computed), Buffer.from(sdkFields.v1));
    };
    const timestamp = ts.length <= 10 ? Number(ts) * 1000 : Number(ts);
    const signatureCheck = !config.webhookSecret ? 'missing_secret'
      : !id ? 'missing_query_data_id'
      : !validPaymentId(id.toUpperCase(), 'test') ? 'invalid_test_id'
      : !requestId || requestId.length > 200 ? 'invalid_request_id'
      : !/^\d{10,13}$/.test(ts) || !/^[a-f0-9]{64}$/i.test(hash) ? 'invalid_signature_format'
      : Math.abs(started - timestamp) > 600000 ? 'timestamp_outside_window'
      : verifyWebhook(config.webhookSecret, signature, requestId, id, started, 'test') ? 'valid' : 'signature_mismatch';
    const summary = { attempt, routeMatches: url.pathname === '/api/loja/webhooks/mercadopago', method: req.method === 'POST' ? 'POST' : 'OTHER', signatureCheck,
      singleQueryId: url.searchParams.getAll('data.id').length === 1,
      expectedTestId: id === 'ORDTST01M6EZCF3PE10EJ67955A4DYWM',
      requestIdHasOuterWhitespace: requestId !== requestId.trim(),
      singleRequestIdHeader: req.rawHeaders.filter((v, i) => i % 2 === 0 && v.toLowerCase() === 'x-request-id').length === 1,
      singleSignatureHeader: req.rawHeaders.filter((v, i) => i % 2 === 0 && v.toLowerCase() === 'x-signature').length === 1,
      sdkStyleHmacMatches: matches(id.trim()),
      lowercaseIdHmacMatches: matches(id.trim().toLowerCase()),
      uppercaseIdHmacMatches: matches(id.trim().toUpperCase()) };
    // Observação limitada do corpo; nenhum conteúdo bruto é registrado ou persistido.
    let chunks = [], size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size <= 24000) chunks.push(Buffer.from(chunk)); else chunks = [];
    });
    req.once('end', () => {
      let checks = { bodyWithinLimit: size <= 24000, bodyIsJson: false };
      if (size <= 24000) {
        try {
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const bodyId = typeof payload?.data?.id === 'string' ? payload.data.id : '';
          checks = { ...checks, bodyIsJson: true, eventIsOrder: payload.type === 'order', testPayload: payload.live_mode === false,
            bodyIdMatchesQuery: bodyId === id, bodyIdHmacMatches: Boolean(bodyId) && matches(bodyId),
            bodySellerMatches: String(payload.user_id) === config.testSellerId };
        } catch { /* Não imprimir erro nem payload. */ }
      }
      chunks = [];
      write(JSON.stringify({ event: 'webhook_envelope_diagnostic', attempt, ...checks }));
    });
    const emit = phase => write(JSON.stringify({ event: 'webhook_diagnostic', at: new Date().toISOString(), phase, ...summary,
      ...(phase === 'received' ? {} : { httpStatus: res.statusCode, durationMs: Date.now() - started }) }));
    emit('received');
    res.once('finish', () => emit('finished'));
    res.once('close', () => { if (!res.writableFinished) emit('connection_closed'); });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const configured = configFromEnv(process.env);
  const config = { ...configured, checkoutEnabled: configured.checkoutEnabled && process.env.COMMERCE_DIAGNOSTIC_TEST_CHECKOUT === 'true' };
  if (config.mode !== 'test') throw Error('Diagnóstico permitido somente em teste.');
  const server = createCommerceServer(new CommerceService(new PrivateStore(config.directory, config.dataKey), realProviders(config), config));
  observeWebhooks(server, config);
  server.requestTimeout = 20000; server.headersTimeout = 10000;
  const fileEnv = parseEnv(readFileSync('.env.commerce.local', 'utf8'));
  server.listen(8788, '127.0.0.1', () => console.log(JSON.stringify({ event: 'diagnostic_ready', mode: 'test', secretConfigured: Boolean(config.webhookSecret), secretMatchesFile: config.webhookSecret === fileEnv.MERCADOPAGO_TEST_WEBHOOK_SECRET, checkoutEnabled: config.checkoutEnabled })));
  const close = () => server.close(() => process.exit(0));
  process.on('SIGINT', close); process.on('SIGTERM', close);
}
