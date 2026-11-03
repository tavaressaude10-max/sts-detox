# Base privada do Assistente Tavares — avaliação local

Atualização de 31/10/2026: ver `INTEGRACAO_PRIVADA_LOCAL.md`. A fila de 154
páginas recebeu triagem de adequação: cinco textos OCR integralmente conferidos
e corrigidos, 149 OCR excluídos (não transcritos integralmente). A base local
tem 1.552 trechos. O chat F4 já consulta oito respostas curtas pelo servidor
local, sem IA e sem expor o acervo. Os registros abaixo são históricos.

Preparação em 30/10/2026. Busca lexical local, sem IA e sem upload do acervo.
Os PDFs originais permanecem na pasta fornecida pelo proprietário. Os hashes
SHA-256 são conferidos novamente ao construir o índice.

## Acervo

| Obra | Edição identificada | Páginas PDF | Fonte editorial |
| --- | --- | ---: | --- |
| DETOX BioEquilíbrio | Edição digital, 2026 | 133 | PDF 5 |
| DETOX Iônico — Entre a Medicina Convencional e as Terapias Integrativas | 2026; número de edição não localizado | 226 | PDF 3 |
| DETOX PET — Bioeletricidade humana e animal | Edição digital organizada, 2026 | 93 | PDF 2 |
| Enciclopédia — Corpo Humano: O Mais Extraordinário Laboratório e Farmácia do Mundo | 1ª edição, 2026 | 640 | PDF 4 |

Total: 1.092 páginas. Autoria: Severino Tavares da Silva.
Edição da Enciclopédia conferida visualmente na página de direitos autorais;
o frontispício de DETOX Iônico informa 2026, sem número de edição.

## Armazenamento e reprodução da preparação

`.private-assistant/` contém inventário, hashes, texto por página, imagens
de conferência, OCR, catálogo e `search.sqlite`. A pasta é ignorada pelo Git e
explicitamente negada pelo Vite, inclusive por `/@fs/` e `?raw`.
Não há importação desse acervo no frontend, rota HTTP de busca ou download.
Não copiar a pasta privada para `public`, `build`, ZIPs de publicação ou CDN.
A exclusão do Git é proteção operacional, não criptografia do disco.

Scripts locais (Python com pypdf, pypdfium2 e Pillow; SQLite da biblioteca padrão):

```powershell
python scripts/inspect-assistant-pdfs.py 'C:\Users\USUARIO\Desktop\LIVROS PARA ASSISTENTE'
python scripts/audit-assistant-images.py
python scripts/render-assistant-review.py
powershell.exe -NoProfile -File scripts/ocr-assistant-local.ps1 -ImageFolder .private-assistant/review
python scripts/assistant-corpus.py build
python scripts/test-assistant-corpus.py
python scripts/assistant-corpus.py search 'O livro constitui protocolo veterinário?' --book livro-3
```

Nesta máquina foi utilizado o Python já disponível no runtime local, sem
instalar dependências no site. O OCR é Windows.Media.Ocr, idioma pt-BR.
O script precisa de acesso local normal ao componente Windows OCR; o sandbox
restrito devolveu acesso negado. Nenhum OCR em nuvem foi utilizado.

## Qualidade e referências

Texto nativo e texto OCR ficam separados, com método de extração e pendências.
A busca padrão exclui OCR não revisado. `--include-ocr` é opção de avaliação,
não autorização para responder publicamente. Trechos têm até 180 palavras,
com sobreposição de 30, nunca atravessando páginas. Cada trecho tem ID estável,
livro, página PDF, capítulo detectado quando disponível e seção dos marcadores
do PDF quando presentes. Cabeçalhos de capítulos são extraídos do corpo, não
inventados. A página impressa é extraída quando identificável; ainda deve ser
conferida visualmente antes de uma citação pública. Sem número identificado,
citar explicitamente “página do PDF”; não supor um deslocamento constante.

109 páginas tinham pouco texto nativo. Uma segunda triagem procura imagens
ocupando mais de 30% da página com menos de 1.500 caracteres nativos, detectando
também páginas mistas. São heurísticas, não garantia de leitura perfeita de
todos os diagramas. Catálogo privado lista as páginas e o OCR pendente.
Não houve erro fatal de extração; OCR e conteúdo editorial ainda exigem revisão.
As páginas de abertura e infográficos não devem ser confundidos com falhas de
um capítulo inteiro. Em particular, BioEquilíbrio PDF 127 e Iônico PDF 222 são
páginas praticamente em branco; BioEquilíbrio PDF 7 é ilustrativa e PDF 126
contém uma frase curta. Páginas de divisão de partes podem continuar com pouco
texto mesmo após OCR, sem significar perda de conteúdo.

## Exemplos verificáveis de busca

Continuidade após validação Firefox pelo proprietário: as quatro páginas dos
exemplos abaixo foram renderizadas e conferidas visualmente. BioEquilíbrio
PDF 114 mostra o número impresso 110; PET PDF 2 mostra 2. Iônico PDF 4 e
Enciclopédia PDF 77 não exibem numeração impressa. Quatro rascunhos curtos,
com fontes e limites, estão em `.private-assistant/RESPOSTAS_PARA_AVALIACAO.md`.
Essa conferência é de fidelidade textual e paginação, não validação científica
independente. Não há conexão desses rascunhos com o chat nem envio externo.

Os testes exigem a referência abaixo entre os três resultados e confirmam que
o trecho recuperado pertence ao texto daquela página. São exemplos de busca,
não respostas produzidas por IA nem revisão científica dos livros.

| Pergunta | Referência recuperada | Conteúdo pertinente |
| --- | --- | --- |
| A cor da água indica toxinas? | BioEquilíbrio, capítulo 11, PDF 114, número impresso extraído 110 | O texto distingue a alteração visual da água da comprovação de eliminação de toxinas. |
| Qual o caráter informativo educacional do livro? | DETOX Iônico, declaração legal, PDF 4 | Define o caráter educativo e os limites das interpretações. |
| O livro constitui protocolo veterinário? | DETOX PET, nota ao leitor, PDF 2, número impresso 2 | A nota declara que a obra não constitui protocolo veterinário nem autorização de aplicação. |
| Qual é a função das mitocôndrias na produção de ATP? | Enciclopédia, capítulo 4, PDF 77 | Aborda produção de ATP e a transformação de energia dos nutrientes. |

Há limites relevantes: correspondência de palavras não garante resposta à
pergunta. Por exemplo, “substitui tratamento médico” também recuperou relatos
de casos no Iônico. Isso exige seleção de fontes, ressalvas e revisão; nunca
usar o primeiro resultado automaticamente como recomendação clínica.

## Conexão futura no site — ainda não implementada

O projeto entrega uma SPA estática. Node 22 registrado na Hostinger é usado
no build; isso não comprova que exista um servidor de aplicação em execução.
Não há backend de IA, credencial configurada, provedor contratado ou cobrança
ativada. O plano e o preço de um backend persistente precisam ser confirmados
antes da contratação; nesta etapa não foi alterada a conta da hospedagem.

Implementar um backend protegido que mantenha o índice fora do document root,
recupere trechos aprovados e retorne somente resposta curta em português e
referências conferidas. Credenciais em segredo do servidor, nunca `VITE_*`.
Validar IDs de fontes na resposta, tratar os livros como dados e não instruções,
comparar trechos conflitantes e distinguir relatos/hipóteses de evidência.
Não diagnosticar, prescrever, prometer cura ou diagnosticar pela água.

Preservar atendimento no site e o fluxo de WhatsApp já preparado: pergunta
informativa sobre produto não é compra; preço, orçamento, pagamento, intenção
de compra ou pedido humano geram mensagem revisável. Falta de fundamentação ou
conflito também oferecem continuidade. Só abrir WhatsApp por ação do visitante,
que ainda deverá enviar a mensagem naquele aplicativo.

Antes de disponibilizar a base a visitantes: bloquear pedidos de capítulos,
páginas consecutivas, transcrição ou continuação de textos; não expor busca
bruta, PDFs ou índice. Usar limites por sessão/IP, registro cumulativo de
trechos utilizados e detecção de pedidos sucessivos para reconstrução.
Nenhum filtro isolado garante impedir reconstrução por múltiplas contas.
Hoje essa exposição não existe: a busca só funciona no terminal local.

Limites sugeridos para piloto, ainda não ativados: pergunta de 400 caracteres,
até três trechos, entrada total de 4.000 tokens, saída de 500 tokens, 5 pedidos
por minuto e 30 por dia por sessão/IP, duas chamadas simultâneas, timeout e
corte efetivo por orçamento mensal no servidor. Ajustar com testes de qualidade.
Não depender só de alertas de orçamento do provedor.

## Custos ilustrativos, sem contratação

A extração, OCR e busca atual não geram cobrança de API. Uma opção para orçamento
é GPT-5.4 Mini: US$ 0,75/milhão de tokens de entrada e US$ 4,50/milhão de saída,
segundo a [página oficial do modelo](https://developers.openai.com/api/docs/models/gpt-5.4-mini),
consultada em 30/10/2026. Não é seleção definitiva de modelo.
Com 4.000 tokens de entrada e 500 de saída faturados, seriam US$ 0,00525 por
resposta ou US$ 5,25 por 1.000 respostas. Estimativa sem cache, ferramentas,
impostos, câmbio e hospedagem; raciocínio extra/repetições aumentam o consumo.
Um teto de piloto de US$ 10/mês pode ser proposto ao proprietário, mas não foi
autorizado nem ativado. A disponibilidade e a tarifa devem ser reconfirmadas.

Busca privada não exige File Search hospedado nem upload dos livros.
Uma conexão futura com API externa transmitiria os trechos selecionados e a
pergunta: essa decisão ainda precisa ser aprovada. A [política oficial de dados](https://developers.openai.com/api/docs/guides/your-data)
informa ausência de treinamento por padrão e possíveis logs de abuso por até
30 dias; `store:false` não equivale a retenção zero. Definir política de dados
antes de enviar qualquer trecho. Um modelo executado inteiramente local evita
esse envio, mas exigiria avaliação de hardware, desempenho e qualidade.
