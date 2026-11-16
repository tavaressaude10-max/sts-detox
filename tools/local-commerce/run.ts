import {readFile} from 'node:fs/promises';
import {createApp} from './app.ts';
import {simulation} from './simulation.ts';
import {validateBundle} from '../../server/assistant-core.ts';

// Dedicated local entry. Never imported by server.js or compiled into .server-build.
if(process.env['COMMERCE_MODE']==='production' || process.env['COMMERCE_PRODUCTION_CHECKOUT_ENABLED']==='true' || process.env['EMAIL_CRON_SEND']==='true')throw Error('UNSAFE_CONFIGURATION');
const port=4173,origin=`http://127.0.0.1:${port}`;
const file=process.argv[2];
const bundle=file ? validateBundle(JSON.parse(await readFile(file,'utf8'))) : undefined;
const repository={async load(){if(!bundle)throw Error('F4_NOT_CONFIGURED');return bundle;}};
const {service}=simulation(origin);
const server=createApp(service,{origin,enabled:!!bundle,repository});
server.listen(port,'127.0.0.1',()=>console.log(`Simulação local: ${origin} — use apenas dados fictícios; pedidos em memória, sem cobrança ou e-mail. F4: ${!!bundle}`));
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>server.close());
