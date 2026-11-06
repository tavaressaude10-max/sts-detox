import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { validPaymentId } from './providers.ts';
import { ShopError, record } from './domain.ts';
import { shippingFailure, paymentFailure } from '../../src/lib/shop-catalog.ts';
import type { CommerceService } from './service.ts';

function equal(a: string, b: string) { const aa=Buffer.from(a),bb=Buffer.from(b); return aa.length === bb.length && timingSafeEqual(aa,bb); }
const mac = (secret: string, message: string) => createHmac('sha256',secret).update(message).digest('hex');
export function verifyWebhook(secret: string, signature: string, requestId: string, dataId: string, now = Date.now(), mode: 'test' | 'production' = 'test') {
  if (!secret || !requestId || requestId.length > 200 || !validPaymentId(dataId.toUpperCase(),mode)) return false;
  const fields = Object.fromEntries(signature.split(',').map(v => v.trim().split('=')));
  const ts = fields['ts'] ?? '', hash = fields['v1'] ?? '';
  if (!/^\d{10,13}$/.test(ts) || !/^[a-f0-9]{64}$/i.test(hash)) return false;
  const time = ts.length <= 10 ? Number(ts)*1000 : Number(ts);
  if (Math.abs(now-time) > 10*60_000) return false;
  // Entregas de Order assinam o ID em minúsculas; o simulador também pode
  // preservar a capitalização. Ambos identificam o mesmo recurso canônico.
  // Os dois caminhos exigem HMAC válido, request-id e timestamp recente.
  const canonical = equal(mac(secret,`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`),hash.toLowerCase());
  const simulator = equal(mac(secret,`id:${dataId};request-id:${requestId};ts:${ts};`),hash.toLowerCase());
  return canonical || simulator;
}
async function body(req: IncomingMessage) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new ShopError('content_type','Use JSON.',415);
  let size=0;const chunks: Buffer[]=[];
  for await (const chunk of req) { size+=chunk.length; if(size>24_000) throw new ShopError('body_too_large','Solicitação muito grande.',413);chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; } catch { throw new ShopError('invalid_json','Dados inválidos.'); }
}
function json(res: ServerResponse, status: number, value: unknown) { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(value)); }

export function createCommerceHandler(service: CommerceService) {
  const secret=service.config.dataKey;
  const rates=new Map<string,{count:number;until:number}>();
  function session(req: IncomingMessage) {
    const cookie=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('sts_shop='))?.slice(9) ?? '';
    const [id,expires,signature]=cookie.split('.');
    if(!id || !expires || !signature || !/^[a-f0-9]{48}$/.test(id) || !/^\d{13}$/.test(expires) || Number(expires)<Date.now() || !equal(signature,mac(secret,`${id}.${expires}`))) return null;
    return id;
  }
  const csrf=(id:string)=>mac(secret,`csrf:${id}`);
  return async(req: IncomingMessage,res: ServerResponse)=>{
    const url=new URL(req.url || '/','http://local.invalid');
    try {
      if(!url.pathname.startsWith('/api/loja/')) throw new ShopError('not_found','Não encontrado.',404);
      // Sessões assinadas evitam somar todos os clientes atrás do mesmo proxy.
      // Não confiar em X-Forwarded-For fornecido pelo visitante.
      const rateKey=(url.pathname==='/api/loja/webhooks/mercadopago'?'webhook:':'client:')+(session(req) ?? req.socket.remoteAddress ?? 'local'), now=Date.now();
      for(const [k,v] of rates)if(v.until<now)rates.delete(k);
      if(rates.size>=10_000&&!rates.has(rateKey))throw new ShopError('rate_limit','Aguarde antes de tentar novamente.',429);
      const rate=rates.get(rateKey) ?? {count:0,until:now+60_000};rate.count++;rates.set(rateKey,rate);
      if(rate.count>120) throw new ShopError('rate_limit','Aguarde um minuto e tente novamente.',429);
      if(url.pathname==='/api/loja/webhooks/mercadopago' && req.method==='POST') {
        const id=url.searchParams.get('data.id') ?? '';
        if(!verifyWebhook(service.config.webhookSecret,String(req.headers['x-signature'] ?? ''),String(req.headers['x-request-id'] ?? ''),id,Date.now(),service.config.mode)) throw new ShopError('signature','Notificação não autenticada.',401);
        const payload=record(await body(req));
        if(payload['live_mode']!==(service.config.mode === 'production') || payload['type']!=='order' || String(record(payload['data'])['id']).toUpperCase()!==id.toUpperCase()) throw new ShopError('test_guard','Notificação de outro ambiente.',400);
        await service.webhook(id.toUpperCase()); json(res,200,{received:true}); return;
      }
      const expectedHost=new URL(service.config.origin).host;
      const host=req.headers.host;
      if(host!==expectedHost && host!==`127.0.0.1:${req.socket.localPort}` && host!==`localhost:${req.socket.localPort}`) throw new ShopError('origin','Origem não autorizada.',403);
      if(req.headers.origin && req.headers.origin!==service.config.origin) throw new ShopError('origin','Origem não autorizada.',403);
      let id=session(req);
      if(url.pathname==='/api/loja/session' && req.method==='GET') {
        if(!id) {
          id=randomBytes(24).toString('hex');const expires=String(Date.now()+7*24*60*60_000), value=`${id}.${expires}`;
          res.setHeader('Set-Cookie',`sts_shop=${value}.${mac(secret,value)}; HttpOnly; SameSite=Lax; Path=/api/loja; Max-Age=604800${service.config.origin.startsWith('https:')?'; Secure':''}`);
        }
        json(res,200,{csrf:csrf(id),mode:service.config.mode});return;
      }
      if(!id) throw new ShopError('session','Sua sessão expirou. Recarregue a página.',401);
      if(req.method==='POST') {
        if(req.headers.origin!==service.config.origin || !equal(String(req.headers['x-shop-csrf'] ?? ''),csrf(id))) throw new ShopError('csrf','Recarregue a página para continuar.',403);
        const input=await body(req);
        if(url.pathname==='/api/loja/quotes') { json(res,200,await service.quote(id,input));return; }
        if(url.pathname==='/api/loja/address') { json(res,200,await service.address(id,record(input)['quoteId']));return; }
        if(url.pathname==='/api/loja/checkout') { json(res,200,await service.checkout(id,input));return; }
      }
      const match=/^\/api\/loja\/orders\/(STS-[a-f0-9]{32})$/.exec(url.pathname);
      if(req.method==='GET' && match) { json(res,200,await service.status(id,match[1]!,String(req.headers['x-shop-return-token'] ?? '')));return; }
      throw new ShopError('not_found','Não encontrado.',404);
    } catch(error) {
      const known=error instanceof ShopError;
      const status=known?error.status:502, code=known?error.code:'service_unavailable';
      let message=known?error.message:'Serviço indisponível. Tente novamente.';
      if(status>=500 && url.pathname==='/api/loja/quotes')message=code==='not_configured'
        ? 'O cálculo de frete ainda não foi configurado neste ambiente.'
        : shippingFailure;
      if(status>=500 && url.pathname==='/api/loja/checkout')message=paymentFailure;
      // Não registrar corpo, URL de checkout, documentos, tokens ou erros brutos do provedor.
      json(res,status,{code,message});
    }
  };
}
export function createCommerceServer(service: CommerceService) { return createServer(createCommerceHandler(service)); }
