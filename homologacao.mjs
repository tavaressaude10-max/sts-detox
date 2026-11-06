import {main} from './.server-build/server/main.js';

// Somente os parâmetros do processo HTTP e as credenciais exclusivas desta aplicação.
const env={
  HOST:process.env.HOST, PORT:process.env.PORT, COMMERCE_MODE:'test',
  COMMERCE_STORAGE:'mysql', ASSISTANT_ENABLED:'true', COMMERCE_CHECKOUT_DISABLED:'true',
  COMMERCE_SITE_ORIGIN:process.env.HOMOLOG_SITE_ORIGIN,
  COMMERCE_DATA_KEY:process.env.HOMOLOG_DATA_KEY
};
for(const name of ['HOST','PORT','TLS','DATABASE','USER','PASSWORD']){
  env['MYSQL_TEST_'+name]=process.env['HOMOLOG_MYSQL_'+name];
}
if(env.MYSQL_TEST_DATABASE!=='u897433725_sts_homologa'){
  throw Error('Informe o banco dedicado de homologação.');
}
let search;
if(process.argv.includes('--pesquisa-local')){
  if(env.HOST!=='127.0.0.1' || env.COMMERCE_SITE_ORIGIN!=='http://127.0.0.1:'+env.PORT){
    throw Error('A pesquisa privada exige origem e servidor locais.');
  }
  const {openPrivateSearch}=await import('./scripts/pesquisa-local.mjs');
  search=openPrivateSearch();
}
await main(env,search);
