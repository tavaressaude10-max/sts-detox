import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('entrada compilada recusa modo ausente e banco de produção sem iniciar servidor',()=>{
  for(const vars of [{}, {STS_RUNTIME:'production'},
    {STS_RUNTIME:'homologacao',HOMOLOG_MYSQL_DATABASE:'u897433725_sts_producao'}]){
    const result=spawnSync(process.execPath,['server.js'],{encoding:'utf8',timeout:5000,
      env:{SystemRoot:process.env['SystemRoot'],...vars}});
    assert.equal(result.status,1);
    assert.equal(result.stdout,'');
    assert.match(result.stderr,/Inicialização recusada/);
    assert.doesNotMatch(result.stderr,/u897433725|password|SELECT|at file:/);
  }
});
