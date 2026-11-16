import { createCipheriv,createDecipheriv,randomBytes,createHash } from 'node:crypto';
export const keyHash=(key:string)=>createHash('sha256').update(key).digest('hex');
export class RecordCipher {
  private key:Buffer;
  constructor(secret:string){if(!/^[a-f0-9]{64}$/i.test(secret))throw Error('Chave de dados inválida.');this.key=Buffer.from(secret,'hex');}
  seal(context:string,value:unknown){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',this.key,iv);cipher.setAAD(Buffer.from(context));
    const text=JSON.stringify(value);if(Buffer.byteLength(text)>8*1024*1024)throw Error('Registro privado excede o limite.');
    const data=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]);}
  open<T>(context:string,data:Buffer):T{if(data.length<29)throw Error('Registro inválido.');const cipher=createDecipheriv('aes-256-gcm',this.key,data.subarray(0,12));cipher.setAAD(Buffer.from(context));cipher.setAuthTag(data.subarray(12,28));return JSON.parse(Buffer.concat([cipher.update(data.subarray(28)),cipher.final()]).toString('utf8')) as T;}
}
