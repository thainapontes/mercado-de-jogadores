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

## Bloco 8 — Listagem de jogadores (20/10)

- **Pedido:** `GET /players` com busca, filtros combinados, ordenação de até dois critérios e paginação, com a
  validação estrita dos query params e a tabela de paginação da RN07 virando teste.
- **Aceito:** a opção A do guia: o banco filtra o que é simples (ativos, posição, condição, clube/livre, idade), e o
  valor de mercado é calculado pela função do domínio; o filtro de valor, a busca, a ordenação e a paginação são feitos
  em memória. A fórmula continua num só lugar, o que é adequado ao tamanho da liga (máximo de 20 clubes).
- **Também aceito:**
  - decoradores reutilizáveis para query params em `common/query/query-params.ts` (inteiro, id, decimal, valor de
    lista, lista sem repetir o campo e busca), que serão usados também em clubes, histórico e partidas;
  - os parâmetros chegam como texto, são validados por expressão regular (`01`, `1.0`, `1e2` e `10,5` recusados) e só
    depois são convertidos (`toPlayerListCriteria`);
  - a busca usa a mesma normalização da ordem alfabética (minúsculas e sem acentos), agora exportada de
    `domain/ordering.ts` como `toComparableText`;
  - valor fora do aceito é recusado com 400, nunca ajustado (`limit=51` → 400).
- **Erros da IA corrigidos pelos testes (todos nos dados dos testes):**
  - a IA errou à mão a ordem esperada de 7 casos de ordenação, esquecendo o desempate pelo nome. Ao corrigir, os dados
    foram mudados para que o 2º critério de ordenação realmente mude o resultado, porque antes alguns casos de dois
    critérios davam a mesma ordem do primeiro e não provavam nada;
  - num e2e, a IA cadastrou um jogador de 35 anos com `potential` acima do maior atributo (recusado, como manda a
    regra) e supôs que outros jogadores valiam mais de 30 sem conferir o overall deles nas próprias posições.
- **Conferido:** 299 testes unitários e 109 e2e passando; `lint`, `format:check` e `tsc` sem erros; API compilada no ar
  (`sort=POSITION` → 400, `club_id=999` → 404, jogador excluído fora da lista).

## Blocos 9 a 12 — Clubes, mercado, histórico e liga (20/10)

> Pedi os Blocos 9 a 13 de uma vez.
> Por isso, as decisões abaixo foram tomadas pela IA e ainda passam pela minha revisão antes dos commits.

- **Pedido:** `POST/GET /clubs` e `GET /clubs/{id}` (Bloco 9); compra e venda (Bloco 10); histórico com `summary` e
  CSV (Bloco 11); escalação, partidas e classificação (Bloco 12). As tabelas do enunciado viraram testes.
- **Feito pela IA (a revisar):**
  - cada cálculo novo é função pura no domínio: valor do elenco, patrimônio e ordenação dos clubes
    (`domain/club-value.ts`), prazo de até 1.095 dias da fidelidade (`domain/purchase.ts`), resumo do histórico
    (`domain/transaction-summary.ts`), formações (`domain/lineup.ts`) e classificação (`domain/standings.ts`). A
    classificação reaproveita o `resultOf` do motor da partida, para "quem venceu" ficar num lugar só; os dias
    restantes e o % de multa do `GET /clubs/{id}` usam as mesmas funções da venda;
  - consultas reaproveitadas com o 404 embutido: `findActivePlayer` (jogador excluído conta como inexistente) e
    `findClub`; o `PlayersService` passou a usá-las também;
  - **concorrência:** compra, venda e escalação travam a linha do clube (`SELECT … FOR UPDATE`) dentro da
    `$transaction`, e o jogador só muda de clube com `updateMany` condicionado (`clubId: null` na compra). Assim, duas
    compras simultâneas do mesmo jogador dão 200 e 409, e o limite de 12 e o de 50% do caixa não são furados. A
    criação de clube usa `LOCK TABLE clubes` para o limite de 20, e o erro de unicidade do banco (`P2002`) também
    vira 409;
  - o CSV e o histórico usam a mesma consulta (`TransactionsService.find`); o `Content-Type: text/csv` é definido
    só depois do sucesso, para os erros continuarem em JSON;
  - o relógio dos testes e2e passou a ser ajustável (`TestClock.set`), para comprar num instante e vender noutro.
- **Decisões que vão para "Decisões e premissas" do README:**
  - id no corpo (`club_id`, `player_ids`, `home_club_id`, `away_club_id`) acima de 2.147.483.647 → 400;
  - o prazo de `loyalty_until` é medido do instante exato do servidor: no máximo 1.095 × 24 h depois;
  - nome do clube: "palavra" segue a definição da V4 (precisa de letra), então hífen ou ponto soltos não contam como
    palavra; a "primeira letra do nome" da sigla é o primeiro caractere que é letra;
  - jogador alterado por outra operação no meio da compra ou da venda → 409 com mensagem de "tente de novo".
- **Erros da IA corrigidos pelos testes:**
  - no teste do 21º clube, a IA gerou siglas começando por "A" para nomes que começam por "C"; o código recusou
    certo (400) e o dado do teste foi corrigido;
  - o compilador e o lint pegaram o `LeagueModule` sem registro no `AppModule` e um tipo usado em decorador sem
    `import type`;
  - no teste do `summary`, a IA escreveu somas em ponto flutuante (`38.85 + 42`); viraram os valores literais.
- **Ambiente:** o PostgreSQL instalado no sistema voltou a ocupar a porta 5432 (ele não foi desabilitado). Os testes
  rodaram num container temporário na porta 5433. Para resolver de vez: `sudo systemctl disable --now postgresql`.
- **Conferido:** 376 testes unitários e 243 e2e passando (eram 299 e 109); `lint`, `format:check` e `build` sem
  erros; API compilada no ar com `curl` (`Location` do clube, compra, CSV com LF e erro do CSV em JSON) e os 19
  endpoints do enunciado no Swagger.

## Bloco 13 — Revisão do backend contra o barema (20/10)

- **Pedido:** testes e2e cobrindo B01–B22 e uma revisão "com olhos de avaliador" do B2 e do B3, sem corrigir antes
  de decidir.
- **E2e por item do barema:** `clubs` (B09, B17), `market` (B10–B16, inclusive a sequência de compras do B13),
  `transactions` (B18, B19) e `league` (B20–B22), além dos de jogadores (B01–B08). As recusas conferem o código, o
  `message` em JSON e que nada foi gravado.
- **Resultado da revisão:** nenhuma falha funcional confirmada; ordem 400 → 404 → 409, os 6 cálculos num lugar só,
  as 5 operações em `$transaction`, camadas, validação e SQL parametrizado conferidos. Apontado e decidido:
  - **corrigido:** variáveis em português nos testes novos (`goleiro`, `jovem`, `semTransacoes`…) e a função
    `escalate` ("intensificar", em inglês) viraram nomes em inglês. O barema conta nomes fora do padrão também nos
    testes. `meiaLua`, `aguias` e `delta` ficaram porque são nomes próprios dos exemplos;
  - **corrigido:** o Swagger não mostrava corpos nem query params. O plugin do `@nestjs/swagger` no `nest-cli.json`
    passou a ler os DTOs (`.dto.ts` e `.query.ts`);
  - **corrigido:** a mensagem do 409 de caixa dizia "limite de 50% do caixa (100,00)", mostrando o caixa como se
    fosse o limite. Agora diz "passa da metade do caixa do clube (100,00)";
  - **corrigido:** o `TRUNCATE` dos testes usava `$executeRawUnsafe` com texto fixo; passou para `$executeRaw`, para
    não levantar dúvida numa busca por "Unsafe";
  - **anotado, sem mudança:** o índice `clubes_nome_lower_key` existe só na migration (o Prisma não descreve índice
    em `lower()`). Se um dia eu gerar outra migration, preciso conferir que o SQL não traz `DROP INDEX` dele;
  - **anotado, sem mudança:** um id com escape inválido na URL (`/players/%ZZ`) responde 400 pelo roteador do
    Express, e não 404. Não é um formato do enunciado;
  - **fica para os Blocos 20 e 21:** README da raiz e Docker Compose completo, que o B3, o B4 e o B5 exigem.
- **Conferido:** 376 testes unitários e 243 e2e passando; `lint`, `format:check`, `build` e
  `tsc --noUnusedLocals --noUnusedParameters` sem erros; os 19 endpoints no Swagger com corpos e query params.

## Blocos 14 a 21 — Frontend, Docker e README (23/10)

> Por causa do prazo, pedi todos os módulos restantes de uma vez.

- **Pedido:** terminar o frontend (Blocos 14 a 19), o Docker Compose completo (Bloco 20) e o README (Bloco 21),
  seguindo o barema.
- **Feito pela IA (a revisar):**
  - fundação: cliente HTTP único em `frontend/src/api/client.ts`, que lança o `message` da API; hooks do TanStack
    Query; componentes compartilhados (`DataTable` com carregando, vazio e erro; `FormField`; `Modal`;
    `ConfirmDialog`; `SubmitButton`; avisos de sucesso e erro); formatação de moeda e datas no horário de Brasília;
  - proteção contra clique duplo em `hooks/useSubmitAction.ts`: além de desabilitar o botão, uma trava ignora o
    segundo envio enquanto o primeiro não termina (o botão desabilitado sozinho pode demorar um instante a aparecer);
  - telas: jogadores (filtros, paginação, cadastro, edição, condição, exclusão, compra), clubes, página do clube
    (elenco com contratos e venda, histórico com totais e CSV, escalação por vagas), partidas e classificação;
  - depois de cada ação, as consultas afetadas são invalidadas, e a tela recarrega os dados da API sem F5;
  - `backend/Dockerfile` e `frontend/Dockerfile` em `node:22-alpine`; a interface roda com `vite preview`, sem nginx.
- **Erros da IA corrigidos pelos testes:**
  - nome vazio mostrava duas mensagens ("Informe o nome" e "de 3 a 100"); passou a parar na primeira;
  - a regra "visitante diferente do mandante" aparecia antes de os clubes serem escolhidos;
  - a confirmação de exclusão não sabia se tinha dado certo (o 204 não tem corpo): a ação passou a devolver
    `{ data }` no sucesso;
  - no Docker, a API não subia (`Cannot find module './internal/class.ts'`): o Prisma gera o cliente olhando o
    `tsconfig.json`, que o Dockerfile copiava só depois do `npm ci`. O teste do `docker compose up` pegou o erro.
- **Conferido:** 67 testes do frontend; `lint`, `format:check` e `build` sem erros; fluxo completo no Chrome
  (headless) contra a API de verdade: cadastro (clique duplo → um jogador), compra, 409 de DOENTE → APTO com o
  `message`, venda, histórico, CSV, escalação, partida (clique duplo → um `POST /matches`) e classificação; 375 px sem
  rolagem horizontal em jogadores, clube (com o histórico), clubes, partidas e classificação; `docker compose up
  --build` com banco, API e interface conversando.
- **Roteiro de testes pela tela:** pedi à IA um passo a passo na ordem do roteiro da banca (F01 a F14, mais F3 e
  F5), com os valores do exemplo do enunciado, em `docs/ROTEIRO-TESTES-TELA.md`. Os textos e números esperados
  foram conferidos com o código e os testes; a execução pela tela é minha.
- **Não resolvido:** o barema pede push em pelo menos 3 dias diferentes também na pasta `frontend/`. Como o frontend
  inteiro sobe em 23/10, esse critério do F4 fica "atende em parte".

## Bloco 22 — Ensaio em máquina limpa (23/10)

- **Pedido:** conferir o que faltava para a entrega e simular a banca: clonar o repositório e seguir o README ao pé
  da letra.
- **Feito pela IA (a revisar):** clone do repositório público numa pasta nova, sem `node_modules` nem `.env`, e com
  um projeto do Docker Compose separado, para o banco começar vazio. Os comandos do README rodaram sem ajuste: banco,
  migrations, API e interface no ar em cerca de 2,5 minutos. Depois, o fluxo completo pela API (cadastro, clubes,
  compra, venda, histórico, CSV, escalação, partida e classificação), o CORS da interface, os comandos dos
  diferenciais (376 testes unitários e 243 e2e no backend, 68 no frontend, `lint`, `format:check` e Swagger) e o
  caminho alternativo `docker compose down -v` + `up -d --build`, que subiu em cerca de 1 minuto.
- **Erro corrigido antes do ensaio:** na escalação, as vagas vazias contavam como "jogador repetido", e a tela
  mostrava a mensagem errada. A checagem de repetidos passou a olhar só as vagas preenchidas, com um teste novo.
- **Conferido por mim:** o roteiro de testes pela tela (`docs/ROTEIRO-TESTES-TELA.md`), sem falhas.
- **Não alterado:** o README. Neste PC, as portas 5432 e 5173 estavam ocupadas por outros serviços e foi preciso
  pará-los durante o ensaio; numa máquina limpa, as portas estão livres.
