# Homologação isolada do Assistente Tavares

Na máquina de homologação, a opção `node homologacao.mjs --pesquisa-local` ativa a
consulta ao catálogo e ao índice FTS5 em `.private-assistant/` após uma pergunta
sem resposta no F4. Requer Node 22 com `node:sqlite` e FTS5, HOST=127.0.0.1 e
HOMOLOG_SITE_ORIGIN igual a http://127.0.0.1:PORT (substituir PORT pela porta local).
O servidor abre search.sqlite somente para leitura. As citações são extrativas,
limitadas a texto nativo ou OCR revisado. Manter o índice e o catálogo fora do
build público e dos pacotes hospedados.

Preparação local em Node 22.12+ da série 22: npm ci, npm run verificar e
python scripts/pacote-homologacao.py. O ZIP de runtime contém o frontend, o
servidor compilado, o lockfile e duas entradas. Usar homologacao.mjs neste
Web App. O manifesto do ZIP define npm start para essa entrada e npm run build
para conferir os caminhos e resolver os módulos sem conectar ao banco.

Após autorização, usar Web App e URL de homologação separados, sem vínculo com
a branch publicada. Instalar com npm ci. Preservar o ZIP extraído na raiz de
execução Node, com build e .server-build ao lado da entrada. Somente build
pode ser servido como conteúdo estático. Verificar o limite de upload do canal.
Evitar seleção automática de Vite. O arquivo server.js é a entrada normal do
projeto; a entrada de homologação isola as credenciais e fixa checkout=false.

Cadastrar apenas HOMOLOG_SITE_ORIGIN (HTTPS do Web App separado),
HOMOLOG_MYSQL_HOST, HOMOLOG_MYSQL_PORT, HOMOLOG_MYSQL_DATABASE,
HOMOLOG_MYSQL_USER, HOMOLOG_MYSQL_PASSWORD, HOMOLOG_MYSQL_TLS e HOMOLOG_DATA_KEY.
Usar usuário dedicado, restrito ao banco de homologação, e chave própria desse
banco. Host remoto exige TLS com certificado válido. A entrada aceita apenas u897433725_sts_homologa, usa o namespace test e bloqueia o checkout no serviço e no provedor de pagamentos.
O verificador scripts/validar-homologacao.ps1 usa a chave SSH já cadastrada para encaminhar a conexão ao MySQL local da hospedagem e pede a senha MySQL e a chave em campos ocultos. Faz apenas SELECT.

Medir em partida fria o tempo até GET /api/health (200). GET /api/ready e
as duas APIs devem retornar 503 até a leitura do schema e validação do F4.
Se falhar, manter bloqueado, corrigir a configuração de homologação e reiniciar.
Verificar as oito consultas curadas, inclusive a página 10 da Enciclopédia,
e o bloqueio do checkout. Não configurar cron nem provedores de pagamento.
