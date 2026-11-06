import { createHmac, timingSafeEqual } from 'node:crypto';

// Capability limitada ao resumo do pagamento, nunca aos dados pessoais do pedido.
export function returnAccess(key: string, mode: string, orderId: string, expires: number) {
  const signature = createHmac('sha256', key).update(`payment-return:${mode}:${orderId}:${expires}`).digest('hex');
  return `${expires}.${signature}`;
}
export function validReturnAccess(key: string, mode: string, orderId: string, token: string, now: number) {
  if (!/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const expires = Number(token.split('.')[0]);
  if (expires < now || expires > now + 7 * 86400_000) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(returnAccess(key, mode, orderId, expires)));
}
