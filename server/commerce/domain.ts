import { shopProducts } from '../../src/lib/shop-catalog.ts';
import type { Customer, OrderLine, ShippingOption } from '../../src/lib/shop-catalog.ts';

export class ShopError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status = 400) { super(message); this.code = code; this.status = status; }
}
export const digits = (value: string) => value.replace(/\D/g, '');
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ShopError('invalid', 'Dados inválidos.');
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, min = 1, max = 180): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\x00-\x1f\x7f]/.test(value)) throw new ShopError('invalid', `Confira ${label}.`);
  return value.trim();
}
export function cep(value: unknown): string {
  const result = digits(text(value, 'o CEP', 8, 10));
  if (!/^\d{8}$/.test(result) || /^(\d)\1{7}$/.test(result)) throw new ShopError('invalid_cep', 'Informe um CEP válido com oito dígitos.');
  return result;
}
export function cart(value: unknown): { lines: OrderLine[]; quantity: number; subtotalCents: number } {
  if (!Array.isArray(value) || value.length < 1 || value.length > 9) throw new ShopError('invalid_cart', 'Confira os produtos escolhidos.');
  const merged = new Map<string, number>();
  for (const raw of value) {
    const item = record(raw);
    const id = text(item['productId'], 'o modelo', 1, 30);
    if (!shopProducts.some(p => p.id === id) || !Number.isInteger(item['quantity']) || Number(item['quantity']) < 1 || Number(item['quantity']) > 99) throw new ShopError('invalid_cart', 'Confira o modelo e a quantidade.');
    merged.set(id, (merged.get(id) ?? 0) + Number(item['quantity']));
  }
  const quantity = [...merged.values()].reduce((a,b) => a + b, 0);
  if (quantity >= 9) throw new ShopError('human_order', 'Para 9 unidades ou mais, fale com o professor Tavares');
  const lines = [...merged].sort(([a],[b]) => a.localeCompare(b)).map(([productId, quantity]) => {
    const p = shopProducts.find(p => p.id === productId)!;
    return { productId, quantity, title: `Eletrodo de aproximadamente ${p.sessions} sessões${p.exclusive ? ' — exclusivo DETOX BIOEQUILÍBRIO' : ''}`, connector: p.connector, unitPriceCents: p.priceCents, subtotalCents: p.priceCents * quantity };
  });
  return { lines, quantity, subtotalCents: lines.reduce((sum,line) => sum + line.subtotalCents, 0) };
}
export function packageFor(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 8) throw new ShopError('human_order', 'Para 9 unidades ou mais, fale com o professor Tavares');
  return quantity === 1 ? { height: 11, width: 11, length: 21, weight: 0.3 } : quantity <= 4 ? { height: 11, width: 11, length: 21, weight: 1 } : { height: 22, width: 22, length: 21, weight: 2 };
}
export function cents(value: unknown): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^\d+(\.\d{1,2})?$/.test(String(value))) throw new ShopError('provider_response', 'Valor inválido recebido do serviço.', 502);
  const result = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(result) || result > 100_000_000) throw new ShopError('provider_response', 'Valor inválido recebido do serviço.', 502);
  return result;
}
export function shippingOptions(value: unknown): ShippingOption[] {
  if (!Array.isArray(value)) throw new ShopError('shipping_unavailable', 'Frete indisponível.', 502);
  const result: ShippingOption[] = [];
  for (const raw of value) {
    const option = record(raw);
    const id = String(option['id']);
    if (!['1','2'].includes(id) || option['has_error'] === true || option['error'] || result.some(o => o.id === id)) continue;
    try {
      const priceCents = cents(option['price']);
      const deliveryDays = Number(option['delivery_time']);
      if (priceCents <= 0 || !Number.isInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 180) continue;
      result.push({ id, name: id === '1' ? 'PAC' : 'SEDEX', priceCents, deliveryDays });
    } catch { /* Serviço inválido não é oferecido como frete grátis. */ }
  }
  if (!result.length) throw new ShopError('shipping_unavailable', 'Frete indisponível.', 502);
  return result.sort((a,b) => a.id.localeCompare(b.id));
}
export function validDocument(value: string): boolean {
  const d = value.toUpperCase().replace(/[.\/\s-]/g, '');
  if (!/^(\d{11}|[A-Z0-9]{12}\d{2})$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const calc = (base: string, weights: number[]) => { const mod = [...base].reduce((sum,n,i) => sum + (n.charCodeAt(0)-48) * weights[i]!, 0) % 11; return mod < 2 ? 0 : 11 - mod; };
  if (d.length === 11) return calc(d.slice(0,9), [10,9,8,7,6,5,4,3,2]) === +d[9]! && calc(d.slice(0,10), [11,10,9,8,7,6,5,4,3,2]) === +d[10]!;
  return calc(d.slice(0,12), [5,4,3,2,9,8,7,6,5,4,3,2]) === +d[12]! && calc(d.slice(0,13), [6,5,4,3,2,9,8,7,6,5,4,3,2]) === +d[13]!;
}
export function customer(value: unknown, quotedCep: string): Customer {
  const c = record(value), a = record(c['address']);
  const document = text(c['document'], 'o CPF ou CNPJ', 11, 20).toUpperCase().replace(/[.\/\s-]/g, '');
  const name = text(c['name'], 'o nome completo', 3, 120);
  const email = text(c['email'], 'o e-mail', 5, 180).toLowerCase();
  const phone = digits(text(c['phone'], 'o telefone', 10, 25));
  const state = text(a['state'], 'a UF', 2, 2).toUpperCase();
  if (!validDocument(document)) throw new ShopError('invalid_document', 'Confira o CPF ou CNPJ.');
  if (!name.includes(' ') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^(?:55)?\d{10,11}$/.test(phone)) throw new ShopError('invalid_customer', 'Confira nome completo, e-mail e telefone.');
  if (!['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].includes(state) || cep(a['cep']) !== quotedCep) throw new ShopError('invalid_address', 'Confira o endereço e calcule novamente se mudar o CEP.');
  return { name, document, email, phone, address: { cep: quotedCep, street: text(a['street'], 'o logradouro', 2), number: text(a['number'], 'o número (ou S/N)', 1, 20), complement: text(a['complement'] ?? '', 'o complemento', 0, 100), district: text(a['district'], 'o bairro', 2, 100), city: text(a['city'], 'a cidade', 2, 100), state } };
}
