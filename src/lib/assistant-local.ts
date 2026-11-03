import type { Answer } from './assistant';

// Consulta na mesma origem; servidor privado controla acesso. Nenhum PDF é importado.
export async function consultLocalBase(question: string, fallback: Answer, signal: AbortSignal): Promise<Answer> {
  if (fallback.reason === 'commercial' || fallback.reason === 'human') return fallback;
  try {
    const response = await fetch('/api/assistente-local', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tavares-Local': '1' },
      body: JSON.stringify({ question }), signal, cache: 'no-store',
    });
    if (!response.ok) throw new Error('unavailable');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('answer' in result)) throw new Error('invalid');
    if (result.answer === null) return fallback;
    const answer = result.answer;
    if (!answer || typeof answer !== 'object' || !('text' in answer) || typeof answer.text !== 'string' || answer.text.length > 1800 || !('sourceLabel' in answer) || typeof answer.sourceLabel !== 'string' || !('product' in answer) || typeof answer.product !== 'string') throw new Error('invalid');
    return { text: answer.text, sourceLabel: answer.sourceLabel, product: answer.product, handoff: false };
  } catch {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return fallback.reason === 'unsupported'
      ? { ...fallback, text: 'A consulta à base privada está indisponível no momento. Posso preparar uma mensagem para continuar com o atendimento humano. Nada foi enviado.' }
      : fallback;
  }
}
