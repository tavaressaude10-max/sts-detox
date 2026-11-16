// lock executa uma unidade atômica. Adaptadores locais servem apenas para testes.
export interface DataStore {
  get<T>(key:string):Promise<T|undefined>;
  put(key:string,value:unknown):Promise<void>;
  lock<T>(key:string,run:()=>Promise<T>):Promise<T>;
}
