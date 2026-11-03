import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { bookTitles, makeHandoff, questionsFor, topics, type Topic, type Answer } from '@/lib/assistant';
import { wa } from '@/lib/whatsapp';
import './assistente-tavares.css';
import { resolveAssistantAnswer } from '@/lib/assistant-response';
import { OPEN_ASSISTANT_EVENT } from '@/lib/assistant-open';

type Exchange = Answer & { question: string };
export function AssistenteTavares() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<Topic>('Equipamento');
  const [history, setHistory] = useState<Exchange[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const [hasInput, setHasInput] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [product, setProduct] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    window.addEventListener(OPEN_ASSISTANT_EVENT, openAssistant);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, openAssistant);
  }, []);
  const latestExchange = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const body = content.current;
    const latest = latestExchange.current;
    if (!body || !latest || !dialog.current?.open) return;
    body.style.setProperty('--tavares-answer-height', `${Math.max(0, body.clientHeight - 40)}px`);
    body.scrollTo({ top: body.scrollTop + latest.getBoundingClientRect().top - body.getBoundingClientRect().top - 20, behavior: 'instant' });
  }, [history]);
  // O diálogo nativo controla modalidade e foco. Não espelhar open em um
  // efeito: o evento close é assíncrono e pode chegar depois de uma reabertura.
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
  function scrollToEnd() { requestAnimationFrame(() => content.current?.scrollTo({ top: content.current.scrollHeight, behavior: 'smooth' })); }
  // O navegador mantém texto, seleção e composição; não reescrever value
  // nem renderizar todo o diálogo a cada caractere digitado.
  function updateInputAvailability() {
    const next = Boolean(input.current?.value.trim());
    if (next !== hasInput) setHasInput(next);
  }
  function clearInput() {
    if (input.current) input.current.value = '';
    setHasInput(false);
  }
  async function ask(question: string) {
    if (!question.trim() || request.current) return;
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    setPending(true); clearInput(); setDraft(null);
    try {
      const answer = await resolveAssistantAnswer(question, product, controller.signal, history.at(-1)?.clarification === 'price-product');
      if (request.current !== controller) return;
      if (answer.product) setProduct(answer.product);
      setHistory(previous => [...previous, { question: question.trim(), ...answer }].slice(-20));
    } catch {
      if (request.current === controller) setHistory(previous => [...previous, { question: question.trim(), text: 'A consulta demorou mais que o esperado. Posso preparar sua mensagem para atendimento humano.', handoff: true, reason: 'unsupported' as const }].slice(-20));
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setPending(false); }
    }
  }
  function prepare(subject: string = topic, interests = history.map(item => item.question), selectedProduct = product) {
    setDraft(makeHandoff(subject, interests, selectedProduct)); scrollToEnd();
  }
  function submit(event: FormEvent) { event.preventDefault(); ask(input.current?.value ?? ''); }
  return <>
    <button ref={launcher} className="tavares-launcher" aria-haspopup="dialog" aria-expanded={open} onClick={openAssistant}><MessageCircle size={20} aria-hidden="true" /><span>Assistente Tavares</span></button>
      <dialog ref={dialog} className="tavares-panel" aria-labelledby="tavares-title" aria-describedby="tavares-description" onCancel={event => { event.preventDefault(); closeAssistant(); }} onClose={() => { if (!dialog.current?.open) setOpen(false); }}>
        <header className="tavares-header">
          <span className="tavares-badge">INFORMAÇÕES COM FONTES · SEM IA</span>
          {import.meta.env.DEV && <span className="tavares-badge" style={{ display: 'block' }}>Teste local F4 · Base privada · 31/10/2026</span>}
          <h2 id="tavares-title">Assistente Tavares</h2>
          <p id="tavares-description">Atendimento automático · STS DETOX IÔNICO</p>
          <button onClick={closeAssistant} className="tavares-close" aria-label="Fechar assistente"><X size={22} /></button>
        </header>
        <div className="tavares-body" ref={content}>
          <p>Olá! Consulte informações aprovadas, com fontes. Respostas fixas, sem IA.</p>
          {import.meta.env.DEV && <p className="tavares-note">No teste local, consulto também os quatro livros. Só a pergunta vai ao servidor local, sem registro da conversa.</p>}
          <p className="tavares-note">Conteúdo educativo; não substitui atendimento de saúde. Evite dados pessoais ou de saúde. A conversa é apagada ao recarregar.</p>
          <nav aria-label="Assuntos do assistente" className="tavares-topics">
            {topics.map(item => <button key={item} aria-pressed={topic === item} onClick={() => { setTopic(item); setDraft(null); setProduct(item === 'Equipamento' ? 'Equipamento DETOX BIOEQUILÍBRIO' : item === 'Materiais de estudo' ? 'Material de estudo STS' : undefined); }}>{item}</button>)}
          </nav>
          <h3>{topic}</h3>
          {topic === 'Quatro livros' && <><p>Escolha uma obra para conhecer sua apresentação aqui na conversa:</p><div className="tavares-questions">{bookTitles.map(title => <button key={title} onClick={() => ask(`Fale sobre o livro ${title}`)}>{title}</button>)}</div><a href="/livros" onClick={closeAssistant}>Ver apresentações e capas no site</a></>}
          {topic === 'Equipamento' && <button className="tavares-action" onClick={() => ask('O que é o equipamento')}>Conhecer o equipamento aqui</button>}
          {topic === 'Materiais de estudo' && <a href="/#formacao" onClick={closeAssistant}>Ver material de estudo no site</a>}
          {topic === 'Atendimento' && <p>Você pode esclarecer dúvidas aqui. Se preferir uma pessoa, solicitar condições comerciais ou não encontrar uma resposta fundamentada, prepare uma mensagem para o WhatsApp oficial.</p>}
          <div className="tavares-questions">{questionsFor(topic).map(faq => <button key={faq.q} onClick={() => ask(faq.q)}>{faq.q}</button>)}</div>
          {import.meta.env.DEV && topic === 'Quatro livros' && <div className="tavares-questions" aria-label="Avaliar consulta aos livros"><p>Experimente as referências dos livros:</p>{['A cor da água indica toxinas?', 'O DETOX IÔNICO substitui tratamento médico?', 'O DETOX PET é um protocolo veterinário?', 'O que a Enciclopédia explica sobre mitocôndrias e ATP?', 'Como estudar a Enciclopédia?'].map(question => <button key={question} disabled={pending} onClick={() => ask(question)}>{question}</button>)}</div>}
          <div role="log" aria-label="Conversa" aria-live="polite" aria-relevant="additions">
            {history.map((item, i) => <article className="tavares-exchange" key={i} ref={i === history.length - 1 ? latestExchange : undefined}><p className="tavares-question"><strong>Você</strong><br />{item.question}</p><p><strong>Assistente Tavares</strong><br />{item.text}</p>{item.source && <a href={item.source} target="_blank" rel="noopener noreferrer">Fonte: {item.sourceLabel} (abre em nova aba)</a>}{!item.source && item.sourceLabel && <p className="tavares-note">Fonte: {item.sourceLabel}</p>}{item.action && <a className="tavares-action" href={item.action.href} target={item.action.external ? "_blank" : undefined} rel={item.action.external ? "noopener noreferrer" : undefined} onClick={closeAssistant}>{item.action.label}</a>}{item.handoff && !item.action && <button className="tavares-action" onClick={() => prepare(item.reason === 'commercial' ? 'Consulta comercial' : 'Atendimento humano', [item.question], item.product)}>{item.reason === 'commercial' ? 'Falar com o professor Tavares' : 'Quero falar com uma pessoa'}</button>}</article>)}
          </div>
          {topic === 'Atendimento' && !history.at(-1)?.handoff && <button className="tavares-action" onClick={() => prepare('Atendimento humano')}>Quero falar com uma pessoa</button>}
          {draft !== null && <section className="tavares-review" aria-label="Revisão da mensagem">
            <h3>Revise antes de continuar</h3>
            <label htmlFor="tavares-draft">Mensagem para o WhatsApp (editável)</label>
            <textarea id="tavares-draft" rows={7} maxLength={3000} value={draft} onChange={event => setDraft(event.target.value)} />
            <p className="tavares-note">Confira o produto e sua solicitação. Remova dados que não queira compartilhar. Nada foi enviado à equipe. No WhatsApp, você ainda precisa tocar em enviar.</p>
            {draft.trim() && <a className="tavares-action" href={wa(draft.trim())} target="_blank" rel="noopener noreferrer">Abrir WhatsApp com esta mensagem ↗</a>}
            <button onClick={() => setDraft(null)}>Voltar à conversa</button>
          </section>}
        </div>
        <form className="tavares-compose" onSubmit={submit}>
          <label htmlFor="tavares-input">Sua pergunta</label>
          <div><input ref={input} id="tavares-input" onInput={updateInputAvailability} maxLength={400} placeholder="Escreva uma dúvida…" autoComplete="off" /><button type="submit" disabled={pending || !hasInput}>Perguntar</button></div>
          {pending && <p role="status">Consultando as fontes locais…</p>}
          <button type="button" className="tavares-reset" onClick={() => { request.current?.abort(); request.current = null; setPending(false); setHistory([]); setDraft(null); clearInput(); setProduct(undefined); }}>Limpar conversa</button>
        </form>
      </dialog>
  </>;
}

