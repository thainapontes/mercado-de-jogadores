# Passe · Mercado de Jogadores

API REST e interface web do mercado de jogadores de uma liga fictícia: cadastro de jogadores e clubes, compra e
venda com taxa, multa e comissão, histórico de transações com exportação CSV, escalação, partidas e classificação.

Estudo de caso SENAI/PE · CÓD. 237 Desenvolvedor I (Fullstack).

- **Backend:** NestJS 11 + TypeScript + Prisma 7 + PostgreSQL 16 (pasta `backend/`)
- **Frontend:** React 19 + Vite + TypeScript (pasta `frontend/`)

---

## 1. Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js | 22 LTS (o `.nvmrc` da raiz indica 22) |
| npm | 10 (vem com o Node.js 22) |
| Docker Engine com Docker Compose v2 | Docker 24 ou superior, Compose 2.20 ou superior |

O PostgreSQL 16 não precisa ser instalado: ele sobe pelo Docker Compose (imagem pública `postgres:16`), no passo 2.

## 2. Banco de dados: criar e recriar do zero

O banco é criado pelas migrations do Prisma (`backend/prisma/migrations`) e começa **vazio**, sem jogadores, clubes,
transações nem partidas.

```bash
# Subir o PostgreSQL 16 (na raiz do repositório)
docker compose up -d db

# Criar as tabelas (na pasta backend, depois do npm ci do passo 3)
cd backend
npx prisma migrate deploy
```

Recriar do zero (apaga todas as tabelas e dados e aplica as migrations de novo, sem carregar dados):

```bash
# Na pasta backend, com o banco no ar
npx prisma migrate reset --force
```

## 3. Instalar e executar

Os arquivos de trava das dependências (`backend/package-lock.json` e `frontend/package-lock.json`) estão versionados,
e a instalação usa `npm ci`.

```bash
# Banco de dados (na raiz do repositório)
docker compose up -d db

# Backend (na pasta backend)
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run start:dev
# API em http://localhost:3000 (o script da banca acrescenta /api/v1)

# Frontend (em outro terminal, a partir da raiz do repositório)
cd frontend
cp .env.example .env
npm ci
npm run dev
# Interface em http://localhost:5173

# Recriar o banco do zero (na pasta backend)
npx prisma migrate reset --force
```

- **Origem da API:** `http://localhost:3000` (as rotas ficam em `http://localhost:3000/api/v1`).
- **URL do frontend:** `http://localhost:5173`.

### Alternativa: tudo pelo Docker Compose (um comando)

Sobe o banco, a API e a interface, cada um no seu container (`node:22-alpine` para a API e para a interface). A API
aplica as migrations ao iniciar. Use **ou** este caminho **ou** o de cima, porque os dois usam as mesmas portas.

```bash
# Na raiz do repositório
docker compose up -d --build
# API em http://localhost:3000 · Interface em http://localhost:5173

# Recriar o banco do zero no Docker (apaga o volume e sobe tudo de novo)
docker compose down -v
docker compose up -d --build
```

## 4. Variáveis de ambiente

Cada projeto tem um `.env.example`, que funciona como está; o passo 3 copia cada um para `.env` (o `.env` fica fora
do Git).

**Backend** (`backend/.env.example`)

| Variável | Para que serve | Valor do exemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://postgres:postgres@localhost:5432/passe?schema=public` |
| `PORT` | Porta da API | `3000` |
| `CORS_ORIGIN` | Origem do frontend aceita pelo CORS (uma ou mais, separadas por vírgula; `*` é recusado) | `http://localhost:5173` |

**Frontend** (`frontend/.env.example`)

| Variável | Para que serve | Valor do exemplo |
| --- | --- | --- |
| `VITE_API_URL` | Origem da API, sem `/api/v1` (a interface acrescenta). Sem o `.env`, a interface usa `http://localhost:3000` | `http://localhost:3000` |

## 5. Estrutura de pastas e bibliotecas

```text
mercado-de-jogadores/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        modelos em inglês mapeados para as tabelas do enunciado (@@map/@map)
│   │   └── migrations/          SQL versionado (inclui o índice UNIQUE em lower(nome) dos clubes)
│   ├── src/
│   │   ├── main.ts              inicia a API
│   │   ├── app.setup.ts         prefixo /api/v1, CORS, validação, filtro de erros, log e Swagger
│   │   ├── common/              infraestrutura sem regra de negócio: leitura do corpo, ids da URL, query params,
│   │   │                        validação estrita, normalização de nomes, datas -03:00, relógio, log
│   │   ├── domain/              funções puras com todos os cálculos (um único lugar por fórmula)
│   │   ├── prisma/              PrismaService e tradução de erros do banco
│   │   ├── players/             jogadores: controller, service, DTOs, mapper
│   │   ├── clubs/               clubes
│   │   ├── market/              compra, venda, histórico e CSV
│   │   └── league/              escalação, partidas e classificação
│   ├── test/                    testes e2e (supertest + banco de teste)
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 único lugar com fetch: cliente HTTP e uma função por endpoint
│   │   ├── hooks/               hooks do TanStack Query (consultas e ações) e ação protegida contra clique duplo
│   │   ├── components/ui/       componentes reutilizáveis: DataTable, FormField, Modal, ConfirmDialog, avisos…
│   │   ├── components/layout/   layout com o menu e cabeçalho das páginas
│   │   ├── features/            formulários (com schema Zod) e resultados de cada assunto
│   │   ├── pages/               Jogadores, Clubes, Clube, Partidas e Classificação
│   │   └── utils/               formatação de moeda e datas, rótulos e validações reutilizáveis
│   ├── Dockerfile
│   └── .env.example
├── docs/                        guia do desafio, matriz de rastreabilidade, diário de IA e rotina
├── docker-compose.yml           PostgreSQL 16, API e interface
└── .nvmrc                       Node.js 22
```

### Bibliotecas do backend

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `express` | Framework da API: módulos, controllers, injeção de dependência e pipes (stack obrigatória) |
| `@nestjs/swagger` | Documentação interativa da API em `/api/docs` |
| `class-validator`, `class-transformer` | Validação estrita dos corpos e dos query params pelos DTOs |
| `prisma`, `@prisma/client`, `@prisma/adapter-pg` | ORM, migrations e conexão com o PostgreSQL; o `Decimal` do Prisma (decimal.js) é usado em todo cálculo de dinheiro |
| `dotenv` | Lê o `.env` ao iniciar a API e no `prisma.config.ts` |
| `reflect-metadata`, `rxjs` | Dependências exigidas pelo NestJS |
| `jest`, `ts-jest`, `@nestjs/testing`, `supertest` | Testes unitários do domínio e testes e2e da API |
| `eslint`, `typescript-eslint`, `prettier` (+ plugins) | Lint e verificação de formatação |
| `typescript`, `@nestjs/cli`, `ts-node`, `tsconfig-paths` | Compilação e execução em TypeScript |

### Bibliotecas do frontend

| Biblioteca | Motivo |
| --- | --- |
| `react`, `react-dom`, `vite`, `@vitejs/plugin-react` | Interface em React criada com o Vite, template `react-ts` (stack obrigatória) |
| `react-router` | Rotas das páginas, no modo biblioteca (`BrowserRouter` + `Routes`) |
| `@tanstack/react-query` | Consultas à API com carregamento e erro, e atualização das listas depois de cada ação (invalidação das consultas) |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Formulários com validação antes do envio e mensagem junto ao campo |
| `tailwindcss`, `@tailwindcss/vite` | Estilos e layout responsivo |
| `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` | Testes de componentes, formulários e formatadores |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `prettier` | Lint e verificação de formatação |
| `typescript`, `@types/*`, `globals` | Tipagem |

### Diferenciais: testes, lint, formatação, Swagger, logs e Docker

```bash
# Backend (na pasta backend)
npm test                  # testes unitários (sem banco)
npm run test:e2e          # testes e2e: precisa do banco no ar (docker compose up -d db); usa o banco passe_test,
                          # criado sozinho, e nunca apaga o banco passe
npm run lint
npm run format:check      # só verifica, não altera arquivos
# Swagger: http://localhost:3000/api/docs (com a API no ar)
# Logs: uma linha por requisição no terminal da API (método, caminho, status e tempo)

# Frontend (na pasta frontend)
npm test                  # Vitest em modo run: termina sozinho
npm run lint
npm run format:check      # só verifica, não altera arquivos

# Docker Compose completo (na raiz): ver "Alternativa: tudo pelo Docker Compose"
docker compose up -d --build
```

## 6. Decisões e premissas

**Gerais**

- **Dinheiro sempre em `Decimal`** (colunas `DECIMAL` e decimal.js no código), arredondado uma única vez no fim de
  cada cálculo, com metade para longe do zero.
- **Relógio injetável:** o "agora" entra como parâmetro nos cálculos do domínio, e a API usa um `ClockService`. Nos
  testes e2e, o relógio é ajustável para comprar num instante e vender noutro.
- **Datas:** gravadas em `TIMESTAMPTZ`; na API, entram e saem com `-03:00`. As respostas trazem segundos e não trazem
  milissegundos.

**Banco**

- **Nome único do clube (RN10):** índice UNIQUE em `lower(nome)`, escrito na migration, sem coluna extra. O nome
  chega ao banco já normalizado pela V4. Por isso "Águias FC" e "águias fc" são o mesmo nome, e "Aguias FC" é
  outro.
- **Concorrência:** compra, venda e escalação travam a linha do clube (`SELECT … FOR UPDATE`) dentro da transação, e
  o jogador só muda de clube com uma gravação condicionada. Duas compras simultâneas do mesmo jogador dão 200 e 409.
  A criação de clube trava a tabela para respeitar o limite de 20. Um jogador alterado por outra operação no meio da
  compra, da venda ou da edição → 409 com mensagem de "tente de novo".
- **Contrato na venda:** `RESCINDIDO` quando há multa (maior que 0); senão, `ENCERRADO`.

**API**

- **Listagem de jogadores:** o banco filtra o que é simples (ativos, posição, condição, clube ou livre, idade). O
  valor de mercado é calculado pela função do domínio, e o filtro de valor, a busca, a ordenação e a paginação são
  feitos em memória. Assim a fórmula fica num só lugar; é adequado ao tamanho da liga (até 20 clubes de 12
  jogadores, mais os livres).
- **Ordem alfabética:** minúsculas, sem acentos e comparação por ponto de código Unicode (não `localeCompare`);
  empate pelo id.
- **Corpo em pedido sem corpo:** é ignorado, mesmo se for JSON quebrado (V1). `POST` sem
  `Content-Type: application/json` conta como corpo que não é objeto → 400.
- **Id no corpo** (`club_id`, `player_ids`, `home_club_id`, `away_club_id`) acima de 2.147.483.647 → 400.
- **Prazo da fidelidade:** medido do instante exato do servidor, no máximo 1.095 × 24 h depois.
- **Nome do clube:** "palavra" segue a definição da V4 (precisa ter letra), então hífen ou ponto soltos não contam
  como palavra; a "primeira letra do nome" da sigla é o primeiro caractere que é letra.
- **Id com escape inválido na URL** (`/players/%ZZ`) responde 400, pelo roteador do Express; não é um formato
  previsto no enunciado.

**Interface**

- **A tela não recalcula regra:** valores, overall, multa, comissão, totais, placar e classificação vêm da API. A
  única conta é o custo total da compra (valor + taxa).
- **"Só livres" e clube:** a tela impede a combinação. Com "Só livres" marcado, o filtro de clube fica desabilitado
  (e o contrário também).
- **Outras recusas previsíveis** (DOENTE direto para APTO, mudança de posição de jogador com clube, idade menor):
  a tela envia o pedido e mostra o `message` da API, sempre do mesmo jeito.
- **Filtros da lista de jogadores:** são aplicados pelo botão "Filtrar" e voltam para a página 1; a ordenação usa um
  critério por vez.
- **Clube na lista de jogadores:** "nome (sigla)", a partir do `GET /clubs`; "Livre" quando `club_id` é `null`.
- **Filtro por jogador no histórico:** as opções são os jogadores que aparecem no histórico do clube sem filtro.
- **Clique duplo:** o botão fica desabilitado durante o envio, e a ação ignora um segundo envio enquanto o primeiro
  não terminar.
- **Datas na tela:** `dd/mm/aaaa hh:mm`, no horário de Brasília. O campo do fim da fidelidade (`datetime-local`) é
  lido no horário de Brasília e enviado como `AAAA-MM-DDTHH:MM-03:00`.
- **Moeda:** duas casas e vírgula decimal (`1.234,56`); a variação do caixa e o lucro aparecem com sinal (`+35,70`,
  `-38,85`).
- **Escalação:** a tela gera as vagas da formação escolhida (1 goleiro e os setores de defesa, meio e ataque) e, em
  cada vaga, oferece só os jogadores do elenco daquela posição que não estão DOENTE.

## 7. Funcionalidades não implementadas

Nenhuma.

## 8. Uso de inteligência artificial

**Ferramenta:** Claude Code (modelos Claude Opus), no terminal, dentro do repositório. O arquivo `CLAUDE.md` da raiz
guarda as regras do projeto (stack, convenções, arquitetura e regras de Git) e é lido pela IA a cada sessão.

**Onde:** no código do backend e do frontend, nos testes, nos Dockerfiles e no `docker-compose.yml`, neste README e
nos documentos de apoio (`docs/`).

**Como e por quê:** segui um guia de 24 blocos (`docs/GUIA-DO-DESAFIO.md`). Em cada bloco, eu passava as regras do
enunciado, a IA propunha o plano de arquivos e escrevia o código e os testes, e as tabelas de exemplo do enunciado
viravam testes automatizados. Eu conferia o resultado (testes, chamadas à API, consultas no banco) e fazia todos os
commits. Usei IA para ganhar velocidade num prazo curto, mantendo o controle das decisões e da verificação. O registro
completo, bloco a bloco, está em `docs/DIARIO-IA.md`.

**O que aceitei:** a arquitetura em camadas (controller → service → Prisma), com os cálculos como funções puras em
`backend/src/domain`; os testes a partir das tabelas do enunciado; no frontend, a camada `api/` como único lugar com
`fetch`, os hooks do TanStack Query e os componentes compartilhados.

**O que decidi ou alterei:**

- versões fixas do NestJS 11 e do Prisma 7.10.0, porque o `npm install` sem versão traria uma versão de teste do
  Prisma;
- unicidade do nome do clube por índice em `lower(nome)`, em vez de uma coluna extra;
- o `ValidationPipe` do NestJS convertia `"01"` para `1` na URL, e `/players/01` daria 200 em vez de 404: a
  conversão foi desligada, e o teste foi conferido retirando a proteção de propósito;
- nomes de variáveis em português nos testes foram trocados por nomes em inglês, e a mensagem do 409 de caixa foi
  corrigida para não mostrar o caixa como se fosse o limite.

**Erros da IA que os testes pegaram:** casos de teste com valores calculados errado à mão (um overall de 73 que era
72, ordens esperadas sem o desempate pelo nome, somas em ponto flutuante), dados de teste que violavam regras do
enunciado e, no frontend, uma validação que mostrava duas mensagens para o mesmo campo vazio e uma regra "mandante
diferente do visitante" que aparecia antes de os clubes serem escolhidos. No Docker, o cliente do Prisma era gerado
sem o `tsconfig.json` e a API não subia; o teste do `docker compose` pegou o erro, e o Dockerfile foi corrigido.

**O que descartei:** Express + Zod no lugar do NestJS (exigiria montar à mão as camadas, os erros e o Swagger), a
coluna extra `nome_normalizado` e o `localeCompare` para a ordem alfabética (o enunciado define a comparação por
ponto de código).

**Frontend no último dia:** por causa do prazo, pedi o frontend (Blocos 14 a 21) de uma vez, sem a parada de
aprovação do plano em cada bloco. O código foi conferido por testes de componentes, pelo fluxo completo percorrido no
Chrome (cadastro, compra, venda, histórico, CSV, escalação, partida e classificação, com clique duplo gerando um só
pedido) e pela largura de 375 px sem rolagem horizontal.
