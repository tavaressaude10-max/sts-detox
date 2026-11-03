// Adaptador de desenvolvimento/teste. O servidor público usa MySQL.
import { readFile } from 'node:fs/promises';
import type { AssistantRepository } from './assistant-core.ts';
import { validateBundle } from './assistant-core.ts';
export class FileAssistantRepository implements AssistantRepository {
  private filename:string;
  constructor(filename:string){this.filename=filename;}
  async load(){return validateBundle(JSON.parse(await readFile(this.filename,'utf8')));}
}
