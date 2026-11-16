// Entrada server-side da Hostinger. Executar build antes; não contém credenciais.
// Esta preparação autoriza exclusivamente homologação; ausência de modo não usa produção.
void (async () => {
  let stage = 'CONFIG';
  try {
    if (process.env.STS_RUNTIME !== 'homologacao') throw Error('Runtime not authorized');
    stage = 'IMPORT';
    const { main } = await import('./.server-build/server/main.js');
    const { fileURLToPath } = await import('node:url');
    stage = 'START';
    await main(process.env, fileURLToPath(new URL('./build/', import.meta.url)));
  } catch {
    // Only fixed stage names: never log raw exceptions, env, paths or credentials.
    console.error(`Inicialização recusada. [STS_ENTRY_${stage}] Confira a configuração e o build.`);
    process.exitCode=1;
  }
})();
