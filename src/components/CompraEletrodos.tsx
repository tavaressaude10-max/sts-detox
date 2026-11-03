import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { shopProducts, money, shippingFailure, paymentFailure } from '@/lib/shop-catalog';
import type { Address, CartItem, Customer, PaymentState, ShippingQuote } from '@/lib/shop-catalog';
import { CheckoutError, shopRequest } from '@/lib/shop-api';
import { waGeral } from '@/lib/whatsapp';

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-deep/25 bg-white px-3 py-2 text-base text-deep focus:outline-2 focus:outline-offset-2 focus:outline-deep';
const primary = 'inline-flex min-h-12 items-center justify-center rounded-full bg-deep px-6 py-3 text-center text-sm font-semibold text-aqua-soft disabled:cursor-wait disabled:opacity-50';
const secondary = 'inline-flex min-h-11 items-center justify-center rounded-full border border-deep/30 px-5 py-2 text-center text-sm font-semibold text-deep disabled:opacity-50';
const emptyCustomer: Customer = { name:'', document:'', phone:'', email:'', address:{cep:'',street:'',number:'',complement:'',district:'',city:'',state:''} };

export function CompraConditions() {
  return <details id="condicoes-compra" className="mt-8 border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
    <summary className="cursor-pointer font-semibold">Privacidade e condições essenciais da compra</summary>
    <div className="mt-3 space-y-2">
      <p>Os dados informados são usados para processar o pedido, conferir o pagamento, organizar a entrega e entrar em contato. O pagamento é realizado no Mercado Pago; o site não solicita nem armazena dados de cartão. A SuperFrete recebe CEP e características da encomenda para cotação; a consulta de endereço utiliza o CEP no ViaCEP.</p>
      <p>Confira modelo, conector, quantidade e endereço antes de continuar. O eletrodo de aproximadamente 250 sessões é exclusivo para DETOX BIOEQUILÍBRIO. O prazo PAC/SEDEX é o informado na cotação, em dias úteis após a postagem; o código de rastreamento poderá ser comunicado manualmente.</p>
      <p>Pix à vista. A STS não oferece parcelamento sem juros; eventuais juros ou acréscimos do cartão ficam por conta do comprador, conforme as condições exibidas pelo Mercado Pago antes da confirmação.</p>
      <p>Para dúvidas, correção de dados, privacidade, cancelamento ou troca, fale com professor Tavares pelo atendimento humano ou pelo e-mail <a className="underline" href="mailto:saudeq@hotmail.com">saudeq@hotmail.com</a>.</p>
    </div>
  </details>;
}
function Help() { return <a href={waGeral} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-deep underline underline-offset-4">Falar com professor Tavares — atendimento humano</a>; }

interface Result { id: string; status: PaymentState; totalCents: number; paidCents?: number; test: boolean }
export function PaymentReturn({ orderId }: { orderId: string }) {
  const [result,setResult]=useState<Result | null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const mounted=useRef(true);
  async function refresh() {
    setBusy(true);setError('');
    try { const data=await shopRequest<Result>(`/orders/${encodeURIComponent(orderId)}`);if(mounted.current)setResult(data); }
    catch { if(mounted.current)setError('Não foi possível confirmar o pagamento agora. Atualize o status ou fale com professor Tavares.'); }
    finally { if(mounted.current)setBusy(false); }
  }
  useEffect(()=>{ mounted.current=true;void refresh();return()=>{mounted.current=false;}; },[orderId]);
  const labels: Record<PaymentState,string>={created:'Aguardando pagamento',pending:'Pagamento pendente',approved:result?.test?'Pagamento aprovado — teste':'Pagamento aprovado',rejected:'Pagamento recusado',cancelled:'Pagamento cancelado ou expirado',refunded:'Pagamento devolvido ou contestado'};
  return <section aria-live="polite" className="rounded-3xl border border-border bg-surface p-6 sm:p-10">
    <h1 className="font-display text-3xl font-bold text-deep">{result ? labels[result.status] : 'Conferindo o pagamento'}</h1>
    <p className="mt-4 break-all text-sm text-muted-foreground">Pedido {orderId}</p>
    {result?.status==='approved' ? <><p className="mt-6 leading-7">{result.test ? 'Seu pagamento de teste foi confirmado pelo Mercado Pago. Nenhum produto será enviado nesta etapa de testes.' : 'Seu pagamento foi confirmado pelo Mercado Pago. Seu pedido seguirá para preparação e envio.'}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.test ? 'As confirmações de teste foram preparadas, sem envio de e-mail.' : 'Guarde o número do pedido. Para acompanhar a entrega, fale com professor Tavares.'}</p></> : result?.status==='pending' || result?.status==='created' ? <p className="mt-6 leading-7">A confirmação ainda está pendente. Se escolheu Pix, siga as instruções do Mercado Pago. Evite iniciar outro pagamento enquanto aguarda.</p> : result ? <p className="mt-6 leading-7">{paymentFailure}</p> : null}
    {result && <p className="mt-5 font-semibold">Total do pedido: {money(result.totalCents)}{result.status==='approved' && result.paidCents!==undefined && <span className="block">Total pago: {money(result.paidCents)}</span>}</p>}
    {error && <p role="alert" className="mt-5 text-sm leading-7">{error}</p>}
    <div className="mt-7 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={()=>void refresh()} className={primary}>{busy?'Consultando…':'Atualizar status'}</button><a href="/compra" className={secondary}>Voltar à compra</a></div>
    <Help /><CompraConditions />
  </section>;
}

export function CompraEletrodos({ initialProduct }: { initialProduct: string }) {
  const [items,setItems]=useState<CartItem[]>([{productId: shopProducts.some(p=>p.id===initialProduct)?initialProduct:'e100-xlr-macho',quantity:1}]);
  const [postal,setPostal]=useState(''),[quote,setQuote]=useState<ShippingQuote | null>(null),[shipping,setShipping]=useState('');
  const [step,setStep]=useState<'shipping'|'details'|'review'>('shipping'),[buyer,setBuyer]=useState<Customer>(structuredClone(emptyCustomer));
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[addressNotice,setAddressNotice]=useState(''),[accepted,setAccepted]=useState(false);
  const checkoutKey=useRef(crypto.randomUUID());
  const totalQty=items.reduce((sum,i)=>sum+i.quantity,0);
  const shippingOption=quote?.options.find(o=>o.id===shipping);
  const subtotal=items.reduce((sum,i)=>sum+(shopProducts.find(p=>p.id===i.productId)?.priceCents ?? 0)*i.quantity,0);
  const stageRef=useRef<HTMLDivElement>(null);
  function focusStage(){requestAnimationFrame(()=>{stageRef.current?.focus();stageRef.current?.scrollIntoView({block:'start',behavior:'smooth'});});}
  function resetQuote(){setQuote(null);setShipping('');setStep('shipping');setError('');setAccepted(false);checkoutKey.current=crypto.randomUUID();}
  function changeItems(next:CartItem[]){setItems(next);resetQuote();}
  async function calculate(event: FormEvent) {
    event.preventDefault();setBusy(true);setError('');setQuote(null);setShipping('');
    try{setQuote(await shopRequest<ShippingQuote>('/quotes',{items,cep:postal}));}
    catch(e){setError(e instanceof CheckoutError && ['invalid_cep','human_order','invalid_cart','not_configured'].includes(e.code)?e.message:shippingFailure);}
    finally{setBusy(false);}
  }
  async function continuePurchase(){
    if(!quote || !shippingOption)return;
    setBusy(true);setError('');setAddressNotice('');
    let found:Partial<Address>={};
    try{found=await shopRequest<Partial<Address>>('/address',{quoteId:quote.id});}
    catch(e){if(e instanceof CheckoutError && ['quote_expired','invalid_cep'].includes(e.code)){setError(e.message);setBusy(false);return;}setAddressNotice('Não foi possível preencher o endereço automaticamente. Confira o CEP e preencha o endereço abaixo.');}
    // Um CEP novo não pode herdar logradouro/número do endereço anterior.
    setBuyer(prev=>({...prev,address:{...(prev.address.cep===quote.cep?prev.address:emptyCustomer.address),...found,cep:quote.cep}}));setStep('details');setBusy(false);focusStage();
  }
  function review(event:FormEvent){event.preventDefault();setError('');setStep('review');checkoutKey.current=crypto.randomUUID();focusStage();}
  async function pay(){
    if(!quote || !shippingOption || !accepted)return;
    setBusy(true);setError('');
    try{
      const result=await shopRequest<{orderId:string;checkoutUrl:string}>('/checkout',{quoteId:quote.id,serviceId:shipping,customer:buyer,acceptedTerms:accepted,checkoutKey:checkoutKey.current});
      const target=new URL(result.checkoutUrl);
      if(target.protocol!=='https:' || target.hostname!=='www.mercadopago.com.br')throw new Error('Checkout inválido');
      window.location.assign(target.href);
    }catch(e){
      if(e instanceof CheckoutError && ['quote_expired','quote_changed','checkout_conflict'].includes(e.code)){resetQuote();setError(e.message);}
      else setError(e instanceof CheckoutError && e.code.startsWith('invalid')?e.message:paymentFailure);
      setBusy(false);
    }
  }
  function field(key: keyof Omit<Customer,'address'>, label:string, type='text', autoComplete?:string){return <label className="block text-sm font-semibold">{label}<input required type={type} autoComplete={autoComplete} maxLength={key==='name'?120:key==='email'?180:25} className={inputClass} value={buyer[key]} onChange={e=>setBuyer({...buyer,[key]:e.target.value})} /></label>;}
  function addressField(key:keyof Address,label:string,autoComplete?:string){return <label className="block text-sm font-semibold">{label}<input required={key!=='complement'} autoComplete={autoComplete} readOnly={key==='cep'} maxLength={key==='state'?2:key==='number'?20:180} className={inputClass} value={buyer.address[key]} onChange={e=>setBuyer({...buyer,address:{...buyer.address,[key]:e.target.value}})} /></label>;}
  return <div>
    <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Escolha seus eletrodos</h1>
    <p className="mt-4 text-base leading-7 text-muted-foreground">Confira o conector do aparelho antes de continuar.</p>
    <fieldset disabled={busy || step!=='shipping'} className="mt-8 space-y-4">
      <legend className="sr-only">Produtos e quantidades</legend>
      {items.map((item,index)=><div key={index} className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_100px_auto]">
        <label className="text-sm font-semibold">Modelo e conector<select aria-label={`Modelo e conector ${index+1}`} className={inputClass} value={item.productId} onChange={e=>changeItems(items.map((line,i)=>i===index?{...line,productId:e.target.value}:line))}>{shopProducts.map(p=><option key={p.id} value={p.id}>{p.sessions} sessões · {p.connector} · {money(p.priceCents)}{p.exclusive?' · exclusivo BIOEQUILÍBRIO':''}</option>)}</select></label>
        <label className="text-sm font-semibold">Quantidade<input type="number" inputMode="numeric" min={1} max={99} step={1} className={inputClass} value={item.quantity} onChange={e=>changeItems(items.map((line,i)=>i===index?{...line,quantity:Math.max(1,Math.min(99,Math.floor(Number(e.target.value)||1)))}:line))} /></label>
        {items.length>1 && <button type="button" onClick={()=>changeItems(items.filter((_,i)=>i!==index))} className="self-end py-3 text-sm underline">Remover<span className="sr-only"> modelo {index+1}</span></button>}
      </div>)}
      {items.length<9 && <button type="button" onClick={()=>changeItems([...items,{productId:'e100-p10',quantity:1}])} className={secondary}>Adicionar outro modelo</button>}
    </fieldset>
    <p className="mt-5 text-right font-semibold">Produtos ({totalQty}): {money(subtotal)}</p>
    <div ref={stageRef} tabIndex={-1} className="mt-10 scroll-mt-24 rounded-3xl border border-border bg-surface p-5 outline-none sm:p-8">
      {totalQty>=9 ? <><h2 className="font-display text-xl font-bold">Para 9 unidades ou mais, fale com o professor Tavares</h2><Help /></> : step==='shipping' ? <>
        <h2 className="font-display text-2xl font-bold">Calcule seu frete</h2>
        <form onSubmit={calculate} className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <label className="w-full text-sm font-semibold sm:max-w-xs">CEP<input aria-label="CEP para calcular frete" required inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} placeholder="00000-000" disabled={busy} className={inputClass} value={postal} onChange={e=>{setPostal(e.target.value.replace(/[^\d-]/g,''));resetQuote();}} /></label>
          <button disabled={busy} className={primary}>{busy?'Calculando…':'Calcular frete'}</button>
        </form>
        {quote && <fieldset disabled={busy} className="mt-7"><legend className="text-sm font-semibold">Escolha a entrega</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{quote.options.map(option=><label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${shipping===option.id?'border-deep bg-aqua-soft/30':'border-border'}`}><input type="radio" name="shipping" value={option.id} checked={shipping===option.id} onChange={()=>setShipping(option.id)} className="mt-1" /><span><strong>{option.name} · {money(option.priceCents)}</strong><span className="mt-1 block text-sm text-muted-foreground">{option.deliveryDays} dia(s) útil(eis) após postagem</span></span></label>)}</div>{quote.options.length<2 && <p className="mt-3 text-sm text-muted-foreground">Uma das modalidades não está disponível para esta cotação.</p>}<button type="button" disabled={!shippingOption || busy} onClick={()=>void continuePurchase()} className={`${primary} mt-6`}>Continuar compra</button></fieldset>}
      </> : step==='details' ? <form onSubmit={review}>
        <h2 className="font-display text-2xl font-bold">Endereço de entrega</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">Confira o endereço encontrado para seu CEP e complete número e complemento.</p>
        {addressNotice && <p role="status" className="mt-3 text-sm">{addressNotice}</p>}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">{addressField('cep','CEP','postal-code')}{addressField('street','Logradouro','address-line1')}{addressField('number','Número (ou S/N)')}{addressField('complement','Complemento (opcional)','address-line2')}{addressField('district','Bairro')}{addressField('city','Cidade','address-level2')}{addressField('state','UF','address-level1')}</div>
        <h2 className="mt-10 font-display text-2xl font-bold">Seus dados</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">{field('name','Nome completo','text','name')}{field('document','CPF ou CNPJ')}{field('phone','Telefone/WhatsApp','tel','tel')}{field('email','E-mail','email','email')}</div>
        <div className="mt-8 flex flex-wrap gap-3"><button className={primary}>Conferir pedido</button><button type="button" onClick={()=>{setStep('shipping');setError('');focusStage();}} className={secondary}>Alterar produtos ou frete</button></div>
      </form> : quote && shippingOption ? <>
        <h2 className="font-display text-2xl font-bold">Confira seu pedido</h2>
        <ul className="mt-6 divide-y divide-border">{quote.lines.map(line=><li key={line.productId} className="py-4"><strong>{line.title}</strong><p className="mt-1 text-sm leading-7">{line.connector} · {line.quantity} unidade(s) · {money(line.unitPriceCents)} cada</p><p className="mt-1 font-semibold">{money(line.subtotalCents)}</p></li>)}</ul>
        <div className="mt-6 grid gap-6 text-sm leading-7 sm:grid-cols-2"><div><h3 className="font-bold">Entrega</h3><p>{buyer.address.street}, {buyer.address.number}{buyer.address.complement && `, ${buyer.address.complement}`}<br />{buyer.address.district} · {buyer.address.city}/{buyer.address.state}<br />CEP {buyer.address.cep}</p><p className="mt-2">{shippingOption.name} · {shippingOption.deliveryDays} dia(s) útil(eis) após postagem</p></div><div><h3 className="font-bold">Comprador</h3><p className="break-words">{buyer.name}<br />CPF/CNPJ: {buyer.document}<br />{buyer.phone}<br />{buyer.email}</p></div></div>
        <dl className="mt-7 space-y-3 border-t border-border pt-5"><div className="flex justify-between gap-3"><dt>Produtos</dt><dd>{money(quote.subtotalCents)}</dd></div><div className="flex justify-between gap-3"><dt>Frete {shippingOption.name}</dt><dd>{money(shippingOption.priceCents)}</dd></div><div className="flex justify-between gap-3 text-xl font-bold"><dt>TOTAL</dt><dd>{money(quote.subtotalCents+shippingOption.priceCents)}</dd></div></dl>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">Pix à vista. No cartão, eventuais juros/acréscimos são pagos pelo comprador, conforme as condições apresentadas pelo Mercado Pago. A STS não oferece parcelamento sem juros.</p>
        <label className="mt-6 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={accepted} disabled={busy} onChange={e=>setAccepted(e.target.checked)} className="mt-1" /><span>Conferi os dados, o conector e os valores e li as <a href="#condicoes-compra" onClick={()=>{const details=document.getElementById('condicoes-compra');if(details instanceof HTMLDetailsElement)details.open=true;}} className="underline">condições essenciais da compra</a>.</span></label>
        <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={()=>void pay()} disabled={!accepted || busy} className={primary}>{busy?'Preparando pagamento…':'Ir para pagamento'}</button><button type="button" disabled={busy} onClick={()=>{setStep('details');setAccepted(false);setError('');}} className={secondary}>Corrigir dados</button></div>
      </> : null}
      {error && <div role="alert" className="mt-6 rounded-xl border border-deep/25 bg-aqua-soft/25 p-4"><p className="text-sm leading-7">{error}</p><Help /></div>}
    </div>
    <CompraConditions />
  </div>;
}
