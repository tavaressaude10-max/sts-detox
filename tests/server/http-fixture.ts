import {request} from 'node:http';
// Raw HTTP preserves Host for virtual-host/proxy tests (fetch may replace it).
export function localFetch(url:string, options:RequestInit={}):Promise<Response> {
  const target=new URL(url);
  if(target.hostname!=='127.0.0.1' || target.protocol!=='http:')throw Error('Local test only');
  return new Promise((resolve,reject)=>{
    const headers=Object.fromEntries(new Headers(options.headers).entries());
    const req=request(target,{method:options.method || 'GET',headers},res=>{
      const chunks:Buffer[]=[];
      res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);
      res.on('end',()=>{
        const resultHeaders=new Headers();
        for(const [name,value] of Object.entries(res.headers))if(value!==undefined)resultHeaders.set(name,Array.isArray(value)?value.join(', '):value);
        resolve(new Response(options.method==='HEAD' || res.statusCode===204 || res.statusCode===304 ? null : Buffer.concat(chunks),{status:res.statusCode!,headers:resultHeaders}));
      });
    });
    req.on('error',reject);req.setTimeout(5000,()=>req.destroy(Error('Local test timeout')));
    req.end(typeof options.body==='string'?options.body:undefined);
  });
}
