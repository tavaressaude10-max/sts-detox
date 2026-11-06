import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AssistenteCompra } from '@/components/AssistenteCompra';

const CompraEletrodos = lazy(() => import('@/components/CompraEletrodos').then(module => ({ default: module.CompraEletrodos })));
const PaymentReturn = lazy(() => import('@/components/CompraEletrodos').then(module => ({ default: module.PaymentReturn })));

export const Route = createFileRoute('/compra')({
  validateSearch: (search: Record<string,unknown>) => ({
    produto: typeof search['produto']==='string' ? search['produto'] : '',
    pedido: typeof search['pedido']==='string' && /^STS-[a-f0-9]{32}$/.test(search['pedido']) ? search['pedido'] : '',
  }),
  head:()=>({meta:[{title:'Eletrodos | STS DETOX IÔNICO'},{name:'robots',content:'noindex, nofollow'},{name:'referrer',content:'no-referrer'}]}),
  component:CompraPage,
});
function CompraPage(){
  const {produto,pedido}=Route.useSearch();
  // Build público fica fechado até homologação e liberação explícita.
  // A API mantém sua própria trava; esta condição não substitui a segurança do backend.
  const checkoutEnabled=import.meta.env.DEV || import.meta.env['VITE_CHECKOUT_ENABLED']==='true';
  const [mode,setMode]=useState<'test'|'production'|'unavailable'|null>(null);
  useEffect(()=>{if(!checkoutEnabled)return;const controller=new AbortController();
    fetch('/api/loja/session',{credentials:'same-origin',cache:'no-store',signal:controller.signal})
      .then(async r=>{if(!r.ok)throw Error();return r.json();})
      .then(data=>{if(!['test','production'].includes(data.mode))throw Error();setMode(data.mode);})
      .catch(()=>{if(!controller.signal.aborted)setMode('unavailable');});
    return()=>controller.abort();},[checkoutEnabled]);
  if(!checkoutEnabled)return <div className="min-h-screen bg-background text-foreground"><SiteHeader ancorasHome={false}/><main className="mx-auto max-w-4xl px-4 py-16 sm:px-8"><section className="rounded-3xl border border-border bg-surface p-6 sm:p-10"><h1 className="font-display text-3xl font-bold text-deep">Compras online em preparação</h1><p className="mt-6 leading-7">O pagamento pelo site ainda não está disponível. Para informações sobre os eletrodos, fale com professor Tavares pelo atendimento humano.</p><a href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-deep underline">Voltar ao site</a></section><AssistenteCompra/><SiteFooter/></main></div>;
  return <div className="min-h-screen bg-background text-foreground"><SiteHeader ancorasHome={false} /><main className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-16">{mode==='test'&&<p className="mb-6 rounded-xl border border-deep/20 bg-aqua-soft/30 px-4 py-3 text-sm font-semibold text-deep">Ambiente de teste — sem pagamentos reais ou envio de produtos. Use somente dados de teste.</p>}{mode==='unavailable'?<p role="alert">Compras indisponíveis no momento. Fale com professor Tavares pelo atendimento humano.</p>:mode===null?<p role="status">Conectando ao atendimento de compras…</p>:<Suspense fallback={<p role="status">Carregando compra…</p>}>{pedido?<PaymentReturn key={pedido} orderId={pedido} />:<CompraEletrodos key={produto} initialProduct={produto} />}</Suspense>}<AssistenteCompra /><SiteFooter /></main></div>;
}
