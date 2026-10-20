# Diário de uso de IA

Registro de cada bloco do guia: o que foi pedido à IA, o que foi aceito, alterado ou descartado.
É a base da seção "Uso de inteligência artificial" do README.

**Ferramenta:** Claude Code (modelo Claude Opus), no terminal, dentro do repositório. Ele lê o `CLAUDE.md` da raiz
a cada sessão. **Como:** a IA propõe um plano e escreve o código; eu aprovo o plano, confiro o resultado
(testes, banco, chamadas à API) e faço todos os commits.

> Os Blocos 1 a 3 foram registrados em 15/10, a partir do histórico do Git e das decisões anotadas no `CLAUDE.md`.

---

## Bloco 1 — Entender o problema (14/10)

- **Pedido:** um guia de execução do desafio em blocos (`docs/GUIA-DO-DESAFIO.md`, também como página web) e uma
  matriz de rastreabilidade com as regras V1–V9 e RN01–RN21 (`docs/MATRIZ-RASTREABILIDADE.md`).
- **Aceito:** a divisão em 24 blocos, o cronograma de 10 dias e a matriz ligando cada regra ao bloco e aos itens do barema.
- **Alterado:** o diário de IA passou a ser um arquivo próprio (`docs/DIARIO-IA.md`), em vez de um anexo do guia.

## Bloco 2 — Arquitetura e stack (14/10)

- **Pedido:** escolher a stack dentro da lista permitida e a estrutura de pastas.
- **Aceito:** NestJS + Prisma + PostgreSQL 16; React + Vite com TanStack Query, React Hook Form + Zod e Tailwind;
  cálculos como funções puras em `backend/src/domain`; dinheiro em `Decimal`.
- **Decidido por mim:**
  - unicidade do nome do clube por índice UNIQUE em `lower(nome)`;
  - um único README na raiz;
  - não enviar dúvidas à banca: o que o enunciado não define vai para "Decisões e premissas".
- **Descartado:**
  - Express + Zod no lugar do NestJS: exigiria montar à mão as camadas, o tratamento de erros e o Swagger;
  - coluna extra `nome_normalizado` para a RN10.

## Bloco 3 — Ambiente e Git (14/10)

- **Pedido:** `.gitignore`, `.gitattributes` (LF), `.nvmrc` com o Node 22, o `CLAUDE.md` com as regras do projeto
  e uma rotina para trabalhar em dois computadores (`docs/ROTINA.md`).
- **Aceito:** os arquivos sugeridos. **Decidido por mim:** a IA nunca faz commit nem push; eu faço os commits a
  partir das mensagens que ela sugere.

## Bloco 4 — Banco de dados (15/10)

- **Pedido:** projeto NestJS em `backend/`, `docker-compose.yml` com `postgres:16`, `schema.prisma` com as 7 tabelas
  e a migration inicial.
- **Aceito:**
  - modelos em inglês mapeados para os nomes exatos do enunciado com `@@map`/`@map`;
  - dinheiro com a precisão do enunciado;
  - `escalacoes` com chave primária composta e `jogador_id` UNIQUE;
  - nenhuma coluna de valor calculado.
- **Decidido por mim, a partir do que a IA levantou:**
  - **versões fixas: NestJS 11 e Prisma 7.10.0.** O `npm install prisma` sem versão instalaria a 8.0.0-rc.23
    (versão de teste). O NestJS 12 é recente demais (TypeScript 6, Jest em modo experimental);
  - datas em `TIMESTAMPTZ`;
  - cliente do Prisma gerado no `npm ci` (`postinstall`), fora do Git.
- **Alterado pela IA durante a execução, e conferido:**
  - o índice `lower(nome)` foi escrito à mão na migration. Uma segunda migration de teste saiu vazia: o Prisma não
    tenta apagar o índice;
  - o `prisma.config.ts` foi tirado do build, porque mudava a saída para `dist/src/main.js` e quebraria o
    `start:prod`;
  - o exemplo "Hello World" do NestJS foi removido (código sem uso).
- **Problemas encontrados:**
  - no WSL, o `npm` era o do Windows e o `nest new` falhou; foi instalado o nvm com o Node 22 dentro do WSL;
  - no Prisma 7 não existe mais `--skip-seed`: o guia foi corrigido para `npx prisma migrate reset --force`;
  - o Prisma 7 recusa o `migrate reset` pedido por uma IA, então eu rodo esse comando.
- **Conferido por mim:**
  - as colunas de cada tabela, comparadas com "3. Estrutura de tabelas";
  - inserções diretas no `psql`: "Águias FC" e "águias fc" → recusado; "Aguias FC" → aceito; sigla repetida →
    recusado; mesmo jogador em duas escalações → recusado;
  - `migrate reset --force` recria o banco vazio.

## Bloco 5 — Esqueleto da API (18/10)

- **Pedido:** a fundação da API, sem regra de negócio, já respondendo como o enunciado exige:
  - prefixo `/api/v1`;
  - CORS só para o frontend;
  - toda recusa como `{message}` em JSON;
  - id malformado na URL → 404;
  - corpo que não é objeto → 400;
  - campos extras ignorados;
  - log de cada requisição, Swagger, lint e formatação;
  - utilitários de nome (V4) e de data (RN01) com testes.
- **Aceito:** o plano de arquivos. A configuração fica numa função `setupApp`, usada pelo `main.ts` e pelos testes e2e,
  para que o teste confira a configuração de verdade.
- **Decidido por mim, a partir do que a IA levantou:**
  - corpo enviado em pedido sem corpo é ignorado **mesmo se for JSON quebrado** (V1). Por isso o leitor de JSON nunca
    falha na hora: ele marca o corpo como inválido, e o 400 só aparece nas rotas que usam `@Body()`;
  - POST sem `Content-Type: application/json` conta como corpo que não é objeto → 400;
  - datas na resposta com segundos e sem milissegundos;
  - `lint` só verifica (`--max-warnings 0`), e há um `lint:fix` separado.
- **Problema encontrado pela IA:** com `transform: true`, o `ValidationPipe` do Nest converte sozinho os parâmetros da
  URL (`"01"` vira `1`), e `/players/01` daria 200 em vez de 404 (V8). A conversão foi desligada numa subclasse
  (`StrictValidationPipe`). Para provar que o teste pega isso, a proteção foi retirada de propósito: o teste do `01`
  falhou, e a proteção voltou.
- **Conferido:** 55 testes unitários e 28 e2e passando; `lint` e `format:check` sem erros; API no ar com `curl`
  (rota inexistente → 404 em JSON, `/api/docs` abre, uma linha de log por requisição).

## Bloco 6 — O domínio: os cálculos (19/10)

- **Pedido:** todos os cálculos como funções puras em `backend/src/domain`, sem banco e sem relógio (o "agora" entra
  como parâmetro), com cada tabela de exemplo do enunciado virando teste, linha por linha (`it.each`).
- **Aceito:** o plano de arquivos: `money`, `overall`, `base-value`, `market-value`, `purchase`, `sale`, `ordering` e
  `match-engine`, mais `types` (posições e condições) e `integer-rounding` (inteiro com meio para cima, usado pelo
  overall e pelo × 0,85 da partida).
- **Decidido por mim, a partir do que a IA levantou:**
  - `Decimal` do próprio Prisma (`@prisma/client/runtime/client`), sem pacote novo: é o decimal.js e a mesma classe
    que o Prisma devolve ao ler as colunas `DECIMAL`;
  - funções que juntam as contas (`calculatePurchase` e `calculateSale`): custo total, lucro, crédito e situação do
    contrato também ficam no domínio, e os services só gravam;
  - contrato `RESCINDIDO` quando a multa é maior que 0, senão `ENCERRADO`;
  - ordem alfabética comparando pontos de código Unicode (o enunciado define caractere assim), não `localeCompare`;
  - `formation`, `standings`, `club-values` e `transaction-summary` ficam para os Blocos 9, 11 e 12, para não haver
    código sem uso;
  - cada commit leva o teste da própria regra, em vez de um commit só de testes no fim.
- **Erros da IA corrigidos pelos testes:**
  - a IA inventou um caso de overall "72,49 → 72" que não existe: todos os pesos são múltiplos de 5, então a soma
    também é. Trocado por 72,45 → 72;
  - num teste da partida, a IA deixou a defesa do 2º jogador de linha no valor padrão, e o "0 × 0" esperado deu gol.
    O código estava certo; os dados do teste foram corrigidos.
- **Conferido:** 143 testes unitários (88 novos no domínio) e 28 e2e passando; `lint`, `format:check` e `tsc` sem erros.

## Bloco 7 — Jogadores: cadastro, consulta, edição, condição e exclusão (19 e 20/10)

- **Pedido:** `POST /players`, `GET /players/{id}`, `PUT /players/{id}`, `PATCH /players/{id}/condition` e
  `DELETE /players/{id}`, com as validações de "Limites de cada campo", RN06, RN08 e RN09, e a tabela "Como conferir"
  do guia virando teste.
- **Aceito:** o plano de arquivos: `PrismaService`, `ClockService`, `@NormalizeName()` e `Satisfies` em `common`, e o
  módulo `players` com 3 DTOs, regras do jogador, um único mapper (`toPlayerResponse`), service e controller.
- **Decidido por mim, a partir do que a IA levantou:**
  - e2e com banco de verdade: um banco separado, `passe_test`, no mesmo container. O `prisma migrate deploy` cria
    esse banco e aplica as migrations antes dos testes, e cada teste começa com as tabelas vazias;
  - duas requisições ao mesmo tempo: `PUT`, `PATCH` e `DELETE` gravam com `updateMany` repetindo a condição
    ("ainda livre", "ainda na mesma condição"). Se outra operação mudou o jogador no meio, nada é gravado e a
    resposta é 409;
  - jogador que vira DOENTE sai da escalação já neste bloco, na mesma transação, e a formação continua salva;
  - "palavra" do nome = trecho sem espaços com pelo menos uma letra; o tamanho conta caracteres Unicode;
  - agilidade ≤ 85 com 35+ anos também vale no `PUT` (400); com clube, enviar a mesma posição é aceito.
- **Problemas de ambiente resolvidos:**
  - um PostgreSQL instalado no sistema ocupava a porta 5432: a Thainá parou o serviço, e o container foi recriado
    para publicar a porta (registrado no `ROTINA.md`);
  - o client do Prisma 7 usa `import()` dinâmico, que o Jest só aceita com `--experimental-vm-modules`. O
    `test:e2e` passou a chamar `node --experimental-vm-modules ...`, que funciona também no Windows (ao contrário
    de `NODE_OPTIONS=...` no script). O Jest também ganhou um `moduleNameMapper` para os imports `.js` do client gerado.
- **Erros da IA corrigidos pelos testes (todos nos dados dos testes, não no código):**
  - a IA esperava que "A B" fosse recusado por ser curto, mas ele tem 3 caracteres e duas palavras: é válido;
  - a IA calculou o overall do Meia Lua como ATA como 73; o certo é 72 (7.160 ÷ 100 = 71,6);
  - a IA copiou a idade 23 do exemplo 2.1.5 para editar o Meia Lua, que tem 25: o 409 de "idade menor" estava certo.
  Além disso, as regras entre campos passaram a deixar o erro de tipo para o validador de tipo (`potential: "86"`
  dá "deve ser inteiro", não "menor que o maior atributo").
- **Conferido:** 189 testes unitários e 68 e2e (40 de jogadores) passando; `lint`, `format:check`, `tsc` e `build` sem
  erros; API compilada no ar com `curl` (201 com `Location`, nome normalizado, `base_value` enviado ignorado,
  `market_value` 37 após MAL_CONDICIONADO, 204 no DELETE e 404 depois).
