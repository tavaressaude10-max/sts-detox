import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {validateBundle,respondFromBundle} from '../../server/assistant-core.ts';

test('mídias, home, livros, playlists e navegação preservados da base visual',()=>{
  const files=execFileSync('git',['-c','core.quotepath=false','ls-tree','-r','--name-only','15e639ec','public'],{encoding:'utf8'}).trim().split('\n');
  files.push('src/routes/index.tsx','src/routes/livros.tsx','src/components/VideoPlaylistBrowser.tsx','src/components/VideoPlaylists.tsx','src/components/VitrineLivros.tsx','src/components/SiteHeader.tsx','src/components/SiteFooter.tsx','src/lib/whatsapp.ts');
  for(const file of files){
    const actual=readFileSync(file),expected=execFileSync('git',['show',`15e639ec:${file}`],{maxBuffer:32*1024*1024});
    if(/\.(tsx?|txt|html|json)$/.test(file)||file.endsWith('.htaccess'))assert.equal(actual.toString().replaceAll('\r\n','\n'),expected.toString().replaceAll('\r\n','\n'),file);
    else assert.deepEqual(actual,expected,file);
  }
});
test('oito respostas privadas mantêm texto, título e páginas', {skip:!process.env['ASSISTANT_FIXTURE_FILE']},()=>{
  const bundle=validateBundle(JSON.parse(readFileSync(process.env['ASSISTANT_FIXTURE_FILE']!,'utf8')));
  assert.equal(bundle.records.length,8);assert.equal(new Set(bundle.records.map(r=>r.book_id)).size,4);
  for(const r of bundle.records)for(const alias of r.aliases){
    const answer=respondFromBundle(bundle,{question:alias}).answer!;
    assert.equal(answer.text,r.text);assert.ok(answer.sourceLabel.includes(r.title));
    assert.ok(answer.sourceLabel.includes(`página ${r.pdf_page} do PDF`));
    if(r.printed_page)assert.ok(answer.sourceLabel.includes(`página impressa ${r.printed_page}`));
  }
  assert.equal(respondFromBundle(bundle,{question:'pergunta inexistente 123456'}).answer,null);
});
