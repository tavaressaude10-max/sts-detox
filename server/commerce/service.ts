import { createHash, randomUUID } from 'node:crypto';
import { cart, cep, customer, record, text, cents, ShopError } from './domain.ts';
import { enqueueEmail } from './email.ts';
import type { DataStore } from '../storage/types.ts';
import { assertPayment, checkoutAllowed } from './providers.ts';
import type { Providers, CommerceConfig, PaymentSnapshot } from './providers.ts';
import type { Customer, OrderLine, PaymentState, ShippingOption, ShippingQuote } from '../../src/lib/shop-catalog.ts';
import { money } from '../../src/lib/shop-catalog.ts';
import { returnAccess, validReturnAccess } from './return-access.ts';

interface StoredQuote extends ShippingQuote { session: string; quantity: number }
export interface StoredOrder {
  id: string; session: string; fingerprint: string; createdAt: number; customer: Customer;
  lines: OrderLine[]; shipping: ShippingOption; subtotalCents: number; totalCents: number;
  status: PaymentState; paymentId?: string; checkoutUrl?: string; paidCents?: number; verifiedAt?: number;
}
export interface EmailMessage { to: string; subject: string; text: string }
export interface OrderNotifications { event: 'order.approved'; orderId: string; mode: 'test' | 'production'; delivery: 'prepared' | 'sent'; emails: EmailMessage[]; whatsapp: { enabled: false }; createdAt: number }

export function prepareNotifications(order: StoredOrder, mode: CommerceConfig['mode'] = 'test'): OrderNotifications {
  const c = order.customer, a = c.address;
  const detail = [
    mode === 'test' ? 'CONFIRMAÇÃO DE TESTE — nenhum envio físico deve ser realizado.' : 'Pagamento confirmado — pedido em preparação.', `Pedido: ${order.id}`, `Cliente: ${c.name}`,
    `CPF/CNPJ: ${c.document}`, `Telefone/WhatsApp: ${c.phone}`, `E-mail: ${c.email}`,
    `Endereço: ${a.street}, ${a.number}${a.complement ? ', '+a.complement : ''} — ${a.district}, ${a.city}/${a.state}, CEP ${a.cep}`,
    ...order.lines.map(l => `${l.title} | ${l.connector} | ${l.quantity} unidade(s) x ${money(l.unitPriceCents)} = ${money(l.subtotalCents)}`),
    `Envio: ${order.shipping.name} — prazo informado: ${order.shipping.deliveryDays} dia(s) útil(eis) após postagem`,
    `Produtos: ${money(order.subtotalCents)}`, `Frete: ${money(order.shipping.priceCents)}`, `Total do pedido: ${money(order.totalCents)}`,
    `Total pago informado pelo Mercado Pago: ${money(order.paidCents ?? order.totalCents)}`,
    'Eventuais juros do comprador seguem as condições do Mercado Pago. Rastreamento: comunicação manual após postagem, quando houver operação real autorizada.',
  ].join('\n');
  return { event: 'order.approved', orderId: order.id, mode, delivery: 'prepared', emails: [
    { to: c.email, subject: `${mode === 'test' ? '[TESTE] ' : ''}Confirmação do pedido ${order.id}`, text: detail },
    { to: 'saudeq@hotmail.com', subject: `${mode === 'test' ? '[TESTE] ' : ''}Pedido aprovado ${order.id}`, text: detail },
  ], whatsapp: { enabled: false }, createdAt: Date.now() };
}
export function verifiedState(order: StoredOrder, remote: PaymentSnapshot, seller: string, mode: CommerceConfig['mode'] = 'test'): { status: PaymentState; paidCents: number } {
  assertPayment(remote, { mode, sellerId: seller, testSellerId: seller });
  if (remote.external_reference !== order.id || (order.paymentId && remote.id !== order.paymentId) || cents(remote.total_amount) !== order.totalCents) throw new ShopError('payment_mismatch', 'O pagamento recebido não corresponde ao pedido.',502);
  const paidCents = cents(remote.total_paid_amount ?? '0');
  if (remote.status === 'refunded' || remote.status === 'charged_back') return { status: 'refunded', paidCents };
  if (remote.status === 'cancelled' || remote.status === 'canceled' || remote.status === 'expired') return { status: 'cancelled', paidCents };
  if (remote.status === 'failed' || remote.status === 'rejected') return { status: 'rejected', paidCents };
  const payments = remote.transactions?.payments ?? [];
  const accredited = payments.filter(p => p.status === 'processed' && p.status_detail === 'accredited').reduce((sum,p) => sum + cents(p.paid_amount ?? '0'),0);
  if (remote.status === 'processed' && remote.status_detail === 'accredited' && paidCents >= order.totalCents && accredited >= order.totalCents) return { status: 'approved', paidCents };
  return { status: 'pending', paidCents };
}

export class CommerceService {
  store: DataStore; providers: Providers; config: CommerceConfig; now: () => number;
  constructor(store: DataStore, providers: Providers, config: CommerceConfig, now = Date.now) { this.store = store; this.providers = providers; this.config = config; this.now = now; }
  async quote(session: string, input: unknown): Promise<ShippingQuote> {
    const body = record(input), destination = cep(body['cep']), basket = cart(body['items']);
    const options = await this.providers.quote(destination,basket.quantity);
    const quote: StoredQuote = { id: randomUUID(), session, cep: destination, ...basket, options, expiresAt: this.now() + 15*60_000 };
    await this.store.put(`quote:${quote.id}`,quote);
    const { session: _, quantity: __, ...publicQuote } = quote;
    return publicQuote;
  }
  async findQuote(session: string, id: unknown) {
    const quote = await this.store.get<StoredQuote>(`quote:${text(id,'a cotação',36,36)}`);
    if (!quote || quote.session !== session || quote.expiresAt < this.now()) throw new ShopError('quote_expired','Calcule novamente o frete para continuar.',409);
    return quote;
  }
  async address(session: string, quoteId: unknown) {
    const quote = await this.findQuote(session,quoteId);
    return this.providers.address(quote.cep);
  }
  async checkout(session: string, input: unknown) {
    if (!checkoutAllowed(this.config)) {
      throw new ShopError('checkout_disabled', 'Compras ainda não liberadas. Fale com o atendimento humano.', 503);
    }
    const body = record(input);
    const key = text(body['checkoutKey'],'a tentativa de compra',36,36);
    if (!/^[0-9a-f-]{36}$/.test(key) || body['acceptedTerms'] !== true) throw new ShopError('invalid','Confira e aceite as condições essenciais da compra.');
    const id = 'STS-' + createHash('sha256').update(session+':'+text(body['quoteId'],'a cotação',36,36)).digest('hex').slice(0,32);
    // Sem PII no identificador público nem na chave de idempotência do provedor.
    const fingerprint = createHash('sha256').update(JSON.stringify({ quoteId: body['quoteId'], serviceId: body['serviceId'], customer: body['customer'] })).digest('hex');
    await this.store.lock(`order:${id}`, async () => {
      let order = await this.store.get<StoredOrder>(`order:${id}`);
      if (order && (order.session !== session || order.fingerprint !== fingerprint)) throw new ShopError('checkout_conflict','A tentativa já foi usada. Confira novamente o pedido.',409);
      if (!order) {
        const quote = await this.findQuote(session,body['quoteId']);
        const buyer = customer(body['customer'],quote.cep);
        const shipping = quote.options.find(option => option.id === body['serviceId']);
        if (!shipping) throw new ShopError('invalid_shipping','Escolha PAC ou SEDEX entre as opções cotadas.');
        // Revalidar preço/prazo antes de iniciar a transação, sem aceitar valores do cliente.
        const refreshed = (await this.providers.quote(quote.cep,quote.quantity)).find(option => option.id === shipping.id);
        if (!refreshed || refreshed.priceCents !== shipping.priceCents || refreshed.deliveryDays !== shipping.deliveryDays) throw new ShopError('quote_changed','O frete foi atualizado. Calcule novamente e confira os valores.',409);
        order = { id, session, fingerprint, createdAt: this.now(), customer: buyer, lines: quote.lines, shipping, subtotalCents: quote.subtotalCents, totalCents: quote.subtotalCents + shipping.priceCents, status: 'created' };
        await this.store.put(`order:${id}`,order);
      }
    });
    // Persistir intenção ANTES do POST externo: rollback/timeout não perde idempotência.
    return this.store.lock(`order:${id}`, async () => {
      const order=await this.store.get<StoredOrder>(`order:${id}`);
      if(!order || order.session!==session || order.fingerprint!==fingerprint) throw new ShopError('checkout_conflict','Confira novamente o pedido.',409);
      if (order.checkoutUrl) return { orderId: id, checkoutUrl: order.checkoutUrl };
      const returnToken = returnAccess(this.config.dataKey, this.config.mode, id, this.now() + 7 * 86400_000);
      const remote = await this.providers.createPayment({ id, email: order.customer.email, lines: order.lines, shipping: order.shipping, totalCents: order.totalCents, returnToken });
      assertPayment(remote,this.config);
      if (remote.external_reference !== id || cents(remote.total_amount) !== order.totalCents || !remote.checkout_url) throw new ShopError('payment_mismatch','Não foi possível verificar o pagamento.',502);
      order.paymentId = remote.id; order.checkoutUrl = remote.checkout_url; order.status = 'pending';
      await this.store.put(`order:${id}`,order);
      await this.store.put(`payment:${remote.id}`, { orderId: id });
      return { orderId: id, checkoutUrl: remote.checkout_url };
    });
  }
  async synchronize(id: string) {
    return this.store.lock(`order:${id}`, async () => {
      const order = await this.store.get<StoredOrder>(`order:${id}`);
      if (!order?.paymentId) throw new ShopError('not_found','Pedido não encontrado.',404);
      const remote = await this.providers.getPayment(order.paymentId);
      const result = verifiedState(order,remote,this.config.sellerId || this.config.testSellerId,this.config.mode);
      // Não rebaixar aprovação por uma resposta transitória atrasada. Estornos continuam sendo registrados.
      if (!(order.status === 'approved' && ['created','pending','rejected'].includes(result.status))) Object.assign(order,result);
      order.verifiedAt = this.now();
      await this.store.put(`order:${id}`,order);
      if (order.status === 'approved' && !await this.store.get(`outbox:${id}`)) await this.store.put(`outbox:${id}`,prepareNotifications(order,this.config.mode));
      if (order.status === 'approved' && this.config.mode === 'production') {
        const outbox=await this.store.get<OrderNotifications>(`outbox:${id}`);
        if(outbox?.delivery !== 'sent') await enqueueEmail(this.store,id);
      }
      return order;
    });
  }
  async status(session: string, id: string, returnToken = '') {
    const existing = await this.store.get<StoredOrder>(`order:${id}`);
    if (!existing || (existing.session !== session && !validReturnAccess(this.config.dataKey, this.config.mode, id, returnToken, this.now()))) throw new ShopError('not_found','Pedido não encontrado nesta sessão. Fale com o atendimento humano.',404);
    const order = await this.synchronize(id);
    const notifications=await this.store.get<OrderNotifications>(`outbox:${id}`);
    return { id: order.id, status: order.status, totalCents: order.totalCents, paidCents: order.paidCents, verifiedAt: order.verifiedAt, test: this.config.mode === 'test', notifications: notifications?.delivery || 'not_prepared' };
  }
  async webhook(paymentId: string) {
    let mapping = await this.store.get<{orderId: string}>(`payment:${paymentId}`);
    // Recuperar corrida: webhook pode chegar antes da resposta do POST de criação.
    if (!mapping) {
      const remote = await this.providers.getPayment(paymentId);
      if (!/^STS-[a-f0-9]{32}$/.test(remote.external_reference)) return;
      const existing = await this.store.get<StoredOrder>(`order:${remote.external_reference}`);
      if (!existing) return;
      await this.store.lock(`order:${existing.id}`,async () => {
        const latest = (await this.store.get<StoredOrder>(`order:${existing.id}`))!;
        verifiedState(latest,remote,this.config.sellerId || this.config.testSellerId,this.config.mode);
        if (!latest.paymentId) { latest.paymentId = paymentId; await this.store.put(`order:${latest.id}`,latest); }
        await this.store.put(`payment:${paymentId}`,{orderId: latest.id});
      });
      mapping = {orderId: existing.id};
    }
    await this.synchronize(mapping.orderId);
  }
}
