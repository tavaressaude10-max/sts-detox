import {scrypt, timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import type {IncomingMessage, ServerResponse} from 'node:http';

export function requireHomologation(env:NodeJS.ProcessEnv) {
  if(env['STS_RUNTIME']!=='homologacao')throw Error('RUNTIME_REQUIRED');
}
export function denyLegacyOperation():void { throw Error('LEGACY_OPERATION_DISABLED'); }
export interface AccessPolicy {
  readonly mode:'restricted'|'quarantine';
  authorize(req:IncomingMessage,res:ServerResponse):Promise<boolean>;
}
const issued=new WeakSet<object>();
export function assertPolicy(policy:AccessPolicy|undefined):asserts policy is AccessPolicy {
  if(!policy || !issued.has(policy))throw Error('ACCESS_POLICY_REQUIRED');
}
export function createAccessPolicy(env:NodeJS.ProcessEnv):AccessPolicy {
  requireHomologation(env);
  const mode=env['HOMOLOG_ACCESS_MODE'] ?? 'restricted';
  if(mode!=='restricted' && mode!=='quarantine')throw Error('ACCESS_MODE');
  if(env['COMMERCE_PRODUCTION_CHECKOUT_ENABLED']==='true' || env['EMAIL_CRON_SEND']==='true' || env['EMAIL_DELIVERY']==='smtp')throw Error('UNSAFE_CONFIGURATION');
  const origin=new URL(env['HOMOLOG_SITE_ORIGIN'] || '');
  if(origin.hostname==='stsdetox.stsdetox.com.br' || origin.username || origin.password || origin.pathname!=='/' || origin.search || origin.hash)throw Error('ACCESS_ORIGIN');
  const local=origin.protocol==='http:' && origin.hostname==='127.0.0.1' && env['HOST']==='127.0.0.1';
  if(!local && origin.protocol!=='https:')throw Error('HTTPS_REQUIRED');
  // Start only an unavailable HTTP surface when the ingress cannot be authenticated.
  // No header, peer address or credential can release quarantine; restart is required.
  if(mode==='quarantine'){
    const policy:AccessPolicy=Object.freeze({mode,async authorize(_req:IncomingMessage,res:ServerResponse){
      res.setHeader('Cache-Control','no-store');
      res.setHeader('Connection','close');
      res.writeHead(503);res.end();return false;
    }});
    issued.add(policy);return policy;
  }
  const proxies=(env['HOMOLOG_TRUSTED_PROXY_IPS'] || '').split(',').map(x=>x.trim()).filter(Boolean);
  if(!local && (!proxies.length || proxies.some(x=>!isIP(x))))throw Error('TRUSTED_PROXY_REQUIRED');
  const username=env['HOMOLOG_ADMIN_USER'] || '';
  const verifier=env['HOMOLOG_ADMIN_VERIFIER'] || '';
  // scrypt N=16384,r=8,p=1; salt 16 bytes and derived key 32 bytes, hex.
  const match=/^scrypt:([a-f0-9]{32}):([a-f0-9]{64})$/.exec(verifier);
  if(!/^[A-Za-z0-9_-]{1,64}$/.test(username) || !match)throw Error('ADMIN_VERIFIER_REQUIRED');
  const salt=Buffer.from(match[1]!,'hex'), expected=Buffer.from(match[2]!,'hex');
  let active=0, attempts=0, since=Date.now();
  const policy:AccessPolicy={mode,async authorize(req,res){
    res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Authorization');
    const reject=(status:number)=>{if(status===401)res.setHeader('WWW-Authenticate','Basic realm="STS homologacao", charset="UTF-8"');res.writeHead(status);res.end();return false;};
    const count=(name:string)=>req.rawHeaders.filter((_,i)=>i%2===0 && req.rawHeaders[i]!.toLowerCase()===name).length;
    if(count('host')!==1 || req.headers.host!==origin.host)return reject(403);
    if(local){if(!['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress || ''))return reject(403);}
    else if(!proxies.includes(req.socket.remoteAddress || '') || count('x-forwarded-proto')!==1 || req.headers['x-forwarded-proto']!=='https')return reject(403);
    if(count('authorization')!==1)return reject(401);
    const header=req.headers.authorization || '';
    if(header.length>2048 || !/^Basic [A-Za-z0-9+/]+={0,2}$/.test(header))return reject(401);
    const encoded=header.slice(6), bytes=Buffer.from(encoded,'base64');
    if(bytes.toString('base64')!==encoded)return reject(401);
    const decoded=bytes.toString('utf8'), colon=decoded.indexOf(':');
    if(colon<1 || decoded.length>1024 || !Buffer.from(decoded,'utf8').equals(bytes))return reject(401);
    if(Date.now()-since>=60000){since=Date.now();attempts=0;}
    if(active>=4 || attempts>=120){res.setHeader('Retry-After','60');return reject(429);}
    attempts++;active++;
    try {
      const derived=await new Promise<Buffer>((resolve,rejectHash)=>scrypt(decoded.slice(colon+1),salt,32,{N:16384,r:8,p:1},(error,key)=>error?rejectHash(error):resolve(key)));
      const valid=timingSafeEqual(derived,expected) && decoded.slice(0,colon)===username;
      derived.fill(0);
      if(!valid)return reject(401);
      return true;
    }catch{return reject(503);}finally{active--;bytes.fill(0);}
  }};
  Object.freeze(policy);issued.add(policy);return policy;
}
