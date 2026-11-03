let csrf = '';
export class CheckoutError extends Error { code: string; constructor(message: string, code = 'unavailable') { super(message); this.code=code; } }
export async function shopRequest<T>(path: string, body?: unknown): Promise<T> {
  try {
    if (!csrf) {
      const session = await fetch('/api/loja/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!session.ok) throw new CheckoutError('O atendimento de compras está indisponível neste momento.');
      const data = await session.json();
      if (!['test','production'].includes(data.mode) || typeof data.csrf !== 'string') throw new CheckoutError('Ambiente de compras indisponível.');
      csrf = data.csrf;
    }
    const response = await fetch(`/api/loja${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-Shop-Csrf': csrf }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(45000) });
    const data = await response.json();
    if (!response.ok) { if (response.status===401 || response.status===403) csrf=''; throw new CheckoutError(typeof data.message === 'string' ? data.message : 'Não foi possível continuar.', typeof data.code === 'string' ? data.code : 'unavailable'); }
    return data as T;
  } catch(error) { if(error instanceof CheckoutError)throw error; throw new CheckoutError('Não foi possível conectar ao atendimento de compras. Tente novamente ou fale com professor Tavares.'); }
}
