import { ShopError, record, text, cents, packageFor, shippingOptions } from './domain.ts';
import { requiredSecret } from './store.ts';
import type { Address, OrderLine, ShippingOption } from '../../src/lib/shop-catalog.ts';

export interface CommerceConfig {
  mode: 'test' | 'production'; origin: string; returnOrigin: string; accessToken: string; testSellerId: string;
  sellerId?: string; checkoutEnabled?: boolean;
  webhookSecret: string; superfreteToken: string; dataKey: string; directory: string;
}
export function configFromEnv(env: NodeJS.ProcessEnv): CommerceConfig {
  const mode = env['COMMERCE_MODE'];
  if (mode !== 'test' && mode !== 'production') throw new Error('Configure COMMERCE_MODE=test ou production.');
  const production = mode === 'production';
  if (production && !env['COMMERCE_SITE_ORIGIN']) throw new Error('Configure a origem HTTPS pública.');
  const origin = new URL(env['COMMERCE_SITE_ORIGIN'] || 'http://127.0.0.1:5174').origin;
  if (!['localhost','127.0.0.1'].includes(new URL(origin).hostname) && new URL(origin).protocol !== 'https:') throw new Error('Origem não local exige HTTPS.');
  if (production && (new URL(origin).protocol !== 'https:' || ['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname))) throw new Error('Produção exige origem HTTPS pública.');
  const directory = env['COMMERCE_TEST_DATA_DIR'] || '.private-commerce'; // Somente adaptador local de teste.
  const returnOrigin = production ? origin : (env['MERCADOPAGO_TEST_RETURN_ORIGIN'] || '');
  if (returnOrigin && new URL(returnOrigin).origin !== origin) throw new Error('A origem de retorno deve ser a mesma da sessão de compra.');
  // Nomes legados são aceitos SOMENTE em teste, sem fallback de produção.
  return { mode, origin, returnOrigin,
    accessToken: production ? (env['MERCADOPAGO_PRODUCTION_ACCESS_TOKEN'] || '') : (env['MERCADOPAGO_TEST_ACCESS_TOKEN'] || env['MERCADOPAGO_ACCESS_TOKEN'] || ''),
    testSellerId: env['MERCADOPAGO_TEST_SELLER_ID'] || '', sellerId: production ? (env['MERCADOPAGO_PRODUCTION_SELLER_ID'] || '') : (env['MERCADOPAGO_TEST_SELLER_ID'] || ''),
    webhookSecret: production ? (env['MERCADOPAGO_PRODUCTION_WEBHOOK_SECRET'] || '') : (env['MERCADOPAGO_TEST_WEBHOOK_SECRET'] || env['MERCADOPAGO_WEBHOOK_SECRET'] || ''),
    superfreteToken: production ? (env['SUPERFRETE_PRODUCTION_TOKEN'] || '') : (env['SUPERFRETE_TEST_TOKEN'] || env['SUPERFRETE_TOKEN'] || ''),
    dataKey: production ? (env['COMMERCE_PRODUCTION_DATA_KEY'] || '') : (env['COMMERCE_DATA_KEY'] || ''), directory,
    checkoutEnabled: env['COMMERCE_CHECKOUT_DISABLED'] !== 'true' && (!production || env['COMMERCE_PRODUCTION_CHECKOUT_ENABLED'] === 'true') };
}
export function checkoutAllowed(config: CommerceConfig){
  return config.checkoutEnabled ?? (config.mode === 'test');
}
export type Fetcher = typeof fetch;
export interface CreatePaymentInput { id: string; email: string; lines: OrderLine[]; shipping: ShippingOption; totalCents: number }
export interface PaymentSnapshot { id: string; external_reference: string; user_id: string; currency: string; total_amount: string; total_paid_amount: string; status: string; status_detail?: string; live_mode?: boolean; checkout_url?: string; transactions?: { payments?: { status: string; status_detail?: string; paid_amount?: string }[] } }
export interface Providers {
  quote(cep: string, quantity: number): Promise<ShippingOption[]>;
  address(cep: string): Promise<Partial<Address>>;
  createPayment(input: CreatePaymentInput): Promise<PaymentSnapshot>;
  getPayment(id: string): Promise<PaymentSnapshot>;
}

export function paymentBody(input: CreatePaymentInput, returnOrigin: string) {
  const base = new URL(returnOrigin);
  if (base.protocol !== 'https:' || ['localhost','127.0.0.1'].includes(base.hostname) || base.username || base.password || base.pathname !== '/') throw new ShopError('return_not_configured', 'O retorno seguro do pagamento de teste ainda não foi configurado.', 503);
  const url = (state: string) => `${base.origin}/compra?pedido=${encodeURIComponent(input.id)}&retorno=${state}`;
  return {
    type: 'online', processing_mode: 'manual', capture_mode: 'automatic_async', expiration_time: 'PT30M',
    total_amount: (input.totalCents / 100).toFixed(2), external_reference: input.id,
    payer: { email: input.email },
    items: [...input.lines.map(line => ({ external_code: line.productId, title: `${line.title} / ${line.connector}`, quantity: line.quantity, unit_price: (line.unitPriceCents / 100).toFixed(2) })), { external_code: 'frete', title: `Frete ${input.shipping.name}`, quantity: 1, unit_price: (input.shipping.priceCents / 100).toFixed(2) }],
    config: {
      online: { success_url: url('aprovado'), pending_url: url('pendente'), failure_url: url('recusado'), auto_return: 'all', retries: { allowed: true } },
      payment_method: { not_allowed_types: ['ticket','atm','account_money','digital_currency'], max_installments: 12 },
    },
  };
}
export function assertTestPayment(value: PaymentSnapshot, seller: string) {
  // Não confiar no prefixo do Access Token: credenciais de teste também usam APP_USR.
  if (!/^ORDTST[A-Z0-9]+$/.test(value.id) || value.live_mode === true || String(value.user_id) !== seller || value.currency !== 'BRL') throw new ShopError('test_guard', 'Pagamento bloqueado: não foi possível confirmar o ambiente de teste.', 502);
}
export function validPaymentId(id: string, mode: CommerceConfig['mode']) {
  return mode === 'test' ? /^ORDTST[A-Z0-9]+$/.test(id) : /^ORD(?!TST)[A-Z0-9]{10,64}$/.test(id);
}
export function assertPayment(value: PaymentSnapshot, config: Pick<CommerceConfig,'mode'|'testSellerId'|'sellerId'>) {
  if (config.mode === 'test') return assertTestPayment(value, config.testSellerId);
  if (!config.sellerId || !validPaymentId(value.id, 'production') || value.live_mode === false || String(value.user_id) !== config.sellerId || value.currency !== 'BRL') throw new ShopError('production_guard','Pagamento de outro ambiente ou vendedor.',502);
}
export function realProviders(config: CommerceConfig, fetcher: Fetcher = fetch): Providers {
  async function request(url: string, init: RequestInit = {}): Promise<unknown> {
    const response = await fetcher(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new ShopError('provider_unavailable', 'Serviço externo indisponível. Tente novamente.', 502);
    return response.json();
  }
  function mpHeaders() { return { Authorization: `Bearer ${requiredSecret(config.accessToken,'Mercado Pago')}`, 'Content-Type': 'application/json' }; }
  async function verifySeller() {
    const seller = requiredSecret(config.mode === 'test' ? config.testSellerId : config.sellerId, 'vendedor');
    const user = record(await request('https://api.mercadopago.com/users/me', { headers: mpHeaders() }));
    if (String(user['id']) !== seller || !Array.isArray(user['tags']) || user['tags'].includes('test_user') !== (config.mode === 'test')) throw new ShopError('test_guard', config.mode === 'test' ? 'A credencial deve pertencer ao vendedor de teste.' : 'A credencial deve pertencer ao vendedor de produção.', 503);
  }
  return {
    async quote(destination, quantity) {
      const result = await request(config.mode === 'production' ? 'https://api.superfrete.com/api/v0/calculator' : 'https://sandbox.superfrete.com/api/v0/calculator', {
        method: 'POST', headers: { Authorization: `Bearer ${requiredSecret(config.superfreteToken, 'SuperFrete')}`, 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'STS-DETOX-BioEquilibrio/1.0 (saudeq@hotmail.com)' },
        body: JSON.stringify({ from: { postal_code: '58315000' }, to: { postal_code: destination }, services: '1,2', options: { own_hand: false, receipt: false, insurance_value: 0, use_insurance_value: false }, package: packageFor(quantity) }),
      });
      return shippingOptions(result);
    },
    async address(destination) {
      const a = record(await request(`https://viacep.com.br/ws/${destination}/json/`));
      if (a['erro']) throw new ShopError('invalid_cep', 'CEP não encontrado. Confira o CEP informado.');
      return { cep: destination, street: typeof a['logradouro'] === 'string' ? a['logradouro'] : '', district: typeof a['bairro'] === 'string' ? a['bairro'] : '', city: text(a['localidade'],'a cidade'), state: text(a['uf'],'a UF',2,2) };
    },
    async createPayment(input) {
      if (!checkoutAllowed(config)) throw new ShopError('checkout_disabled','Compras ainda não liberadas. Fale com o atendimento humano.',503);
      if (config.mode === 'production') requiredSecret(config.webhookSecret, 'webhook');
      const body = paymentBody(input, config.returnOrigin); // Validar antes de qualquer POST externo.
      await verifySeller();
      const value = await request('https://api.mercadopago.com/v1/orders', { method: 'POST', headers: { ...mpHeaders(), 'X-Idempotency-Key': input.id }, body: JSON.stringify(body) }) as PaymentSnapshot;
      assertPayment(value, config);
      const url = new URL(value.checkout_url || '');
      if (url.protocol !== 'https:' || url.hostname !== 'www.mercadopago.com.br' || !url.pathname.startsWith('/checkout/') || url.username || url.password) throw new ShopError('invalid_checkout', 'Endereço de pagamento inválido.', 502);
      return value;
    },
    async getPayment(id) {
      if (!validPaymentId(id, config.mode)) throw new ShopError('test_guard', 'Identificador de outro ambiente.');
      await verifySeller();
      const value = await request(`https://api.mercadopago.com/v1/orders/${id}`, { headers: mpHeaders() }) as PaymentSnapshot;
      assertPayment(value, config);
      if (value.id !== id) throw new ShopError('invalid_payment', 'Pagamento não corresponde ao pedido.',502);
      return value;
    },
  };
}
