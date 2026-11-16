import {randomBytes} from 'node:crypto';
import {CommerceService} from './service.ts';
import type {DataStore} from '../../server/storage/types.ts';
import type {PaymentSnapshot, Providers} from './providers.ts';

export class MemoryStore implements DataStore {
  records=new Map<string,unknown>();
  locks=new Map<string,Promise<unknown>>();
  async get<T>(key:string):Promise<T|undefined>{return structuredClone(this.records.get(key)) as T|undefined;}
  async put(key:string,value:unknown){this.records.set(key,structuredClone(value));}
  async lock<T>(key:string,run:()=>Promise<T>):Promise<T>{
    const next=(this.locks.get(key) || Promise.resolve()).catch(()=>{}).then(run);
    this.locks.set(key,next);
    try{return await next;}finally{if(this.locks.get(key)===next)this.locks.delete(key);}
  }
}
// No environment, disk, database, SMTP or external fetch is used by this simulator.
export function simulation(origin:string){
  const url=new URL(origin);
  if(url.protocol!=='http:' || url.hostname!=='127.0.0.1')throw Error('LOOPBACK_ONLY');
  const store=new MemoryStore(),payments=new Map<string,PaymentSnapshot>();
  const providers:Providers={
    async quote(){return [{id:'1',name:'PAC',priceCents:2000,deliveryDays:5},{id:'2',name:'SEDEX',priceCents:3500,deliveryDays:2}];},
    async address(cep){return {cep,street:'Rua de teste',district:'Centro',city:'João Pessoa',state:'PB'};},
    async createPayment(input){
      const id='ORDTST'+input.id.replace(/[^a-z0-9]/gi,'').toUpperCase();
      const amount=(input.totalCents/100).toFixed(2);
      const payment:PaymentSnapshot={id,user_id:'123456',currency:'BRL',live_mode:false,external_reference:input.id,total_amount:amount,total_paid_amount:amount,status:'processed',status_detail:'accredited',transactions:{payments:[{status:'processed',status_detail:'accredited',paid_amount:amount}]},checkout_url:origin+'/compra?pedido='+input.id};
      payments.set(id,payment);return structuredClone(payment);
    },
    async getPayment(id){const p=payments.get(id);if(!p)throw Error('SIMULATED_ORDER_NOT_FOUND');return structuredClone(p);},
  };
  const service=new CommerceService(store,providers,{mode:'test',origin,returnOrigin:origin,accessToken:'',testSellerId:'123456',sellerId:'123456',webhookSecret:'',superfreteToken:'',dataKey:randomBytes(32).toString('hex'),directory:'',checkoutEnabled:true});
  return {service,store};
}
