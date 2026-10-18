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
