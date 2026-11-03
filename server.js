// Entrada server-side da Hostinger. Executar build antes; não contém credenciais.
import { main } from './.server-build/server/main.js';
main().catch(()=>{console.error('Inicialização recusada. Confira variáveis MySQL, chave, schema e build em docs/BUSINESS_NODE_MYSQL.md.');process.exitCode=1;});
