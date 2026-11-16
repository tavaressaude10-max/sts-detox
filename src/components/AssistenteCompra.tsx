import { MessageCircle } from 'lucide-react';
import { openExistingAssistant } from '@/lib/assistant-open';

export function AssistenteCompra() {
  return <button type="button" onClick={openExistingAssistant} aria-haspopup="dialog"
    className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep">
    <MessageCircle size={20} aria-hidden="true" />
    <span><span className="block text-xs font-semibold">Assistente Tavares</span><span>Posso ajudar em mais alguma coisa?</span></span>
  </button>;
}
