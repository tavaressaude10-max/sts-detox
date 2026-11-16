// Entrada server-side da Hostinger. Executar build antes; não contém credenciais.
// Esta preparação autoriza exclusivamente homologação; ausência de modo não usa produção.
void (async () => {
  try {
    if (process.env.STS_RUNTIME !== 'homologacao') throw Error('Runtime not authorized');
    const { main } = await import('./.server-build/server/main.js');
    await main(process.env);
  } catch {
    console.error('Inicialização recusada. Confira o modo de homologação e sua configuração privada.');
    process.exitCode=1;
  }
})();
