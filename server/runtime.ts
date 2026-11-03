import path from 'node:path';
import { mkdir, open, realpath, readFile, unlink } from 'node:fs/promises';
import { inside } from './app.ts';

export async function privateDirectory(directory:string) {
  await mkdir(directory,{recursive:true,mode:0o700});
  const resolved=await realpath(directory);
  for(const folder of ['public','build']) {
    let root:string;try{root=await realpath(folder);}catch{root=path.resolve(folder);}
    if(inside(root,resolved)||inside(resolved,root))throw Error('Diretório privado deve ficar fora da raiz pública.');
  }
  return resolved;
}
export async function lockRuntime(directory:string,mode:string) {
  const filename=path.join(directory,'.server.lock');
  try {
    const marker=JSON.parse(await readFile(filename,'utf8')) as {pid:number};
    try {process.kill(marker.pid,0);throw Error('Já existe uma instância neste diretório.');}
    catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;await unlink(filename);}
  }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  const lock=await open(filename,'wx',0o600);await lock.writeFile(JSON.stringify({pid:process.pid,mode}));
  const modeFile=path.join(directory,'.environment');
  try {const existing=await readFile(modeFile,'utf8');if(existing!==mode)throw Error('Diretório pertence a outro ambiente.');}
  catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT'){await lock.close();await unlink(filename);throw error;}const marker=await open(modeFile,'wx',0o600);await marker.writeFile(mode);await marker.close();}
  return async()=>{await lock.close();await unlink(filename);};
}
