import { runEmailJob } from './.server-build/server/email-job.js';
runEmailJob(process.env).then(result=>console.log(JSON.stringify(result))).catch(()=>{console.error('Cron não concluído. Confira banco, ambiente e SMTP; nenhum segredo é registrado.');process.exitCode=1;});
