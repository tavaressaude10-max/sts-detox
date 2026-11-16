// Catálogo compartilhado: o servidor recalcula preços; valores do navegador não são aceitos.
export const connectors = [
  { id: 'xlr-macho', label: 'XLR macho — 3 pinos' },
  { id: 'xlr-femea', label: 'XLR fêmea — 3 furos' },
  { id: 'p10', label: 'P10 macho' },
  { id: 'mike', label: 'Mike fêmea — 2 furos' },
] as const;
export interface ShopProduct { id: string; sessions: number; connector: string; priceCents: number; exclusive: boolean }
export const shopProducts: ShopProduct[] = [
  ...[100, 200].flatMap(sessions => connectors.map(connector => ({ id: `e${sessions}-${connector.id}`, sessions, connector: connector.label, priceCents: sessions === 100 ? 19800 : 29800, exclusive: false }))),
  { id: 'e250-p10', sessions: 250, connector: 'Conector Nº 2 — P10 macho', priceCents: 33900, exclusive: true },
];
export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export interface CartItem { productId: string; quantity: number }
export interface OrderLine extends CartItem { title: string; connector: string; unitPriceCents: number; subtotalCents: number }
export interface ShippingOption { id: string; name: 'PAC' | 'SEDEX'; priceCents: number; deliveryDays: number }
export interface Address { cep: string; street: string; number: string; complement: string; district: string; city: string; state: string }
export interface Customer { name: string; document: string; phone: string; email: string; address: Address }
export interface ShippingQuote { id: string; expiresAt: number; cep: string; lines: OrderLine[]; subtotalCents: number; options: ShippingOption[] }
export type PaymentState = 'created' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
export const shippingFailure = 'Não foi possível calcular o frete neste momento. Fale com o professor Tavares para concluirmos sua compra.';
export const paymentFailure = 'Não foi possível concluir o pagamento. Você pode tentar novamente ou falar conosco para receber ajuda.';
