import { configFromEnv, realProviders } from './providers.ts';
import { PrivateStore } from './store.ts';
import { CommerceService } from './service.ts';
import { createCommerceServer } from './http.ts';

const config=configFromEnv(process.env);
if(config.mode !== 'test') throw Error('Use npm start para o servidor público de produção.');
const service=new CommerceService(new PrivateStore(config.directory,config.dataKey),realProviders(config),config);
const server=createCommerceServer(service);
server.requestTimeout=20_000; server.headersTimeout=10_000;
server.listen(8788,'127.0.0.1',()=>console.log('API de compras em TESTE: http://127.0.0.1:8788 (credenciais nunca são exibidas).'));
const close=()=>server.close(()=>process.exit(0));
process.on('SIGINT',close);process.on('SIGTERM',close);
