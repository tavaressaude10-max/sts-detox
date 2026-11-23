import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { publicAnswers, findPublicAnswer, makeHandoff, unsupportedMessage } from '@/lib/assistant-public';
import { wa } from '@/lib/whatsapp';
import './assistente-tavares.css';

type Exchange = { question: string; text: string; handoff: boolean };

// Interface de diálogo da integração 4d29a5f; consulta exclusivamente no navegador.
export function AssistenteTavares() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Exchange[]>([]);
  const [hasInput, setHasInput] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const latestExchange = useRef<HTMLElement>(null);
  const draftInput = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const body = content.current;
    const latest = latestExchange.current;
    if (!body || !latest || !dialog.current?.open) return;
    body.style.setProperty('--tavares-answer-height', `${Math.max(0, body.clientHeight - 40)}px`);
    body.scrollTo({ top: body.scrollTop + latest.getBoundingClientRect().top - body.getBoundingClientRect().top - 20, behavior: 'instant' });
  }, [history]);
  useEffect(() => {
    if (draft !== null) draftInput.current?.focus();
  }, [draft === null]);

  function openAssistant() {
    if (!dialog.current?.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : launcher.current;
      dialog.current?.showModal();
    }
    setOpen(true);
  }
  function closeAssistant() {
    dialog.current?.close();
    setOpen(false);
    (returnFocus.current?.isConnected ? returnFocus.current : launcher.current)?.focus({ preventScroll: true });
  }
  function clearInput() {
    if (input.current) input.current.value = '';
    setHasInput(false);
  }
  function ask(question: string) {
    if (!question.trim() || question.length > 400) return;
    const answer = findPublicAnswer(question);
    const exchange: Exchange = answer
      ? { question: question.trim(), text: answer.text, handoff: false }
      : { question: question.trim(), text: unsupportedMessage, handoff: true };
    setHistory(previous => [...previous, exchange].slice(-20));
    setDraft(null);
    clearInput();
  }
  function prepare(questions = history.map(item => item.question)) {
    setDraft(makeHandoff(questions));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input.current?.value ?? '');
  }

  return <>
    <button ref={launcher} className="tavares-launcher" aria-haspopup="dialog" aria-expanded={open} onClick={openAssistant}><MessageCircle size={20} aria-hidden="true" /><span>Assistente Tavares</span></button>
    <dialog ref={dialog} className="tavares-panel" aria-labelledby="tavares-title" aria-describedby="tavares-description" onCancel={event => { event.preventDefault(); closeAssistant(); }} onClose={() => { if (!dialog.current?.open) setOpen(false); }}>
      <header className="tavares-header">
        <span className="tavares-badge">RESPOSTAS CADASTRADAS · SEM IA</span>
        <h2 id="tavares-title">Assistente Tavares</h2>
        <p id="tavares-description">21 respostas cadastradas · STS DETOX IÔNICO</p>
        <button onClick={closeAssistant} className="tavares-close" aria-label="Fechar assistente"><X size={22} /></button>
      </header>
      <div className="tavares-body" ref={content}>
        <p>Olá! Escolha uma pergunta ou escreva sua dúvida. Respondo com base nas 21 perguntas cadastradas.</p>
        <p className="tavares-note">Conteúdo educativo; não substitui atendimento de saúde. Evite dados pessoais ou de saúde. A conversa fica neste navegador e é apagada ao recarregar.</p>
        <a href="/livros" onClick={closeAssistant}>Ver os quatro livros no site</a>
        <details className="tavares-catalog"><summary>Ver as 21 perguntas disponíveis</summary><div className="tavares-questions" aria-label="21 perguntas disponíveis">{publicAnswers.map(answer => <button key={answer.id} onClick={() => ask(answer.question)}>{answer.question}</button>)}</div></details>
        <div role="log" aria-label="Conversa" aria-live="polite" aria-relevant="additions">
          {history.map((item, i) => <article className="tavares-exchange" key={i} ref={i === history.length - 1 ? latestExchange : undefined}>
            <p className="tavares-question"><strong>Você</strong><br />{item.question}</p>
            <p className="tavares-answer"><strong>Assistente Tavares</strong><br />{item.text.split(/(\*\*.*?\*\*)/g).map((part, index) => part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</p>
            {item.handoff && <button className="tavares-action" onClick={() => prepare([item.question])}>Falar com o Professor Tavares</button>}
          </article>)}
        </div>
        <button className="tavares-action" onClick={() => prepare()}>Preparar atendimento pelo WhatsApp</button>
        {draft !== null && <section className="tavares-review" aria-label="Revisão da mensagem">
          <h3>Revise antes de continuar</h3>
          <label htmlFor="tavares-draft">Mensagem para o WhatsApp (editável)</label>
          <textarea ref={draftInput} id="tavares-draft" rows={5} maxLength={3000} value={draft} onChange={event => setDraft(event.target.value)} />
          <p className="tavares-note">Remova dados que não queira compartilhar. Nada foi enviado à equipe. No WhatsApp, você ainda precisa tocar em enviar.</p>
          {draft.trim() && <a className="tavares-action" href={wa(draft.trim())} target="_blank" rel="noopener noreferrer">Abrir WhatsApp com esta mensagem ↗</a>}
          <button onClick={() => setDraft(null)}>Voltar à conversa</button>
        </section>}
      </div>
      <form className="tavares-compose" onSubmit={submit}>
        <label htmlFor="tavares-input">Sua pergunta</label>
        <div><input ref={input} id="tavares-input" onInput={() => setHasInput(Boolean(input.current?.value.trim()))} maxLength={400} placeholder="Escreva uma dúvida…" autoComplete="off" /><button type="submit" disabled={!hasInput}>Perguntar</button></div>
        <button type="button" className="tavares-reset" onClick={() => { setHistory([]); setDraft(null); clearInput(); input.current?.focus(); }}>Limpar conversa</button>
      </form>
    </dialog>
  </>;
}
