import {main} from './.server-build/server/main.js';

// Somente os parâmetros do processo HTTP e as credenciais exclusivas desta aplicação.
const env={
  HOST:process.env.HOST, PORT:process.env.PORT, COMMERCE_MODE:'production',
  COMMERCE_STORAGE:'mysql', ASSISTANT_ENABLED:'true', COMMERCE_PRODUCTION_CHECKOUT_ENABLED:'false',
  COMMERCE_SITE_ORIGIN:process.env.HOMOLOG_SITE_ORIGIN,
  COMMERCE_PRODUCTION_DATA_KEY:process.env.HOMOLOG_DATA_KEY
};
for(const name of ['HOST','PORT','TLS','DATABASE','USER','PASSWORD']){
  env['MYSQL_PRODUCTION_'+name]=process.env['HOMOLOG_MYSQL_'+name];
}
if(env.MYSQL_PRODUCTION_DATABASE?.toLowerCase()==='u897433725_sts_producao'){
  throw Error('Banco de produção recusado na homologação.');
}
await main(env);
