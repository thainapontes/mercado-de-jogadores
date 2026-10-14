# Guia do Desafio — SENAI/PE · Desenvolvedor I (Fullstack)

> 🌐 **Versão interativa (página web):** https://claude.ai/code/artifact/a9e23023-a2e4-479c-9252-446bf8a78f20
> Arquivo-fonte da página: [guia-desafio.html](guia-desafio.html) (edite esse arquivo e peça ao Claude para republicar no mesmo link).
>
> 📋 **Matriz de rastreabilidade (página web):** https://claude.ai/code/artifact/b5851511-70fe-404d-87d8-27b2f8a9b8eb · fonte: [matriz-rastreabilidade.html](matriz-rastreabilidade.html)
>
> 🎨 **Protótipo no Figma ("Passe", v1.0), para o frontend:** https://www.figma.com/design/oevjrS0eaqL3VHSvKYB8GS/Passe?node-id=2-2&t=gTcNDqeEto0OU9zk-1

> Guia de estudo e execução, bloco a bloco, usado para planejar e acompanhar este projeto.
>
> Divisão de trabalho combinada: **a IA escreve o código; você planeja, decide, confere, testa, versiona, documenta e explica.** Isso é exatamente o que um(a) dev faz no dia a dia com IA, e é o que a banca vai querer ver na entrevista.

---

## Sumário

- [Parte 0 — Visão geral](#parte-0--visão-geral)
  - [Datas que importam](#datas-que-importam)
  - [Como a nota funciona (e onde estão os pontos)](#como-a-nota-funciona-e-onde-estão-os-pontos)
  - [O que elimina](#o-que-elimina-leia-duas-vezes)
  - [Cronograma sugerido](#cronograma-sugerido-10-dias)
  - [Como trabalhar com a IA (o método)](#como-trabalhar-com-a-ia-o-método-que-vale-para-todos-os-blocos)
- **Fase 1 — Preparação**
  - [Bloco 1 — Entender o problema](#bloco-1--entender-o-problema)
  - [Bloco 2 — Decidir a arquitetura e a stack](#bloco-2--decidir-a-arquitetura-e-a-stack)
  - [Bloco 3 — Ambiente e repositório Git](#bloco-3--ambiente-e-repositório-git)
- **Fase 2 — Backend**
  - [Bloco 4 — Banco de dados](#bloco-4--banco-de-dados)
  - [Bloco 5 — Esqueleto da API](#bloco-5--esqueleto-da-api-a-fundação)
  - [Bloco 6 — O domínio: os cálculos](#bloco-6--o-domínio-os-cálculos-o-coração-do-projeto)
  - [Bloco 7 — Jogadores: cadastro, consulta, edição, condição e exclusão](#bloco-7--jogadores-cadastro-consulta-edição-condição-e-exclusão)
  - [Bloco 8 — Listagem de jogadores](#bloco-8--listagem-de-jogadores-busca-filtros-ordenação-e-paginação)
  - [Bloco 9 — Clubes](#bloco-9--clubes)
  - [Bloco 10 — Mercado: compra e venda](#bloco-10--mercado-compra-e-venda)
  - [Bloco 11 — Histórico de transações e CSV](#bloco-11--histórico-de-transações-e-exportação-csv)
  - [Bloco 12 — Liga: escalação, partidas e classificação](#bloco-12--liga-escalação-partidas-e-classificação)
  - [Bloco 13 — Revisão do backend contra o barema](#bloco-13--revisão-do-backend-contra-o-barema)
- **Fase 3 — Frontend**
  - [Bloco 14 — Fundação do frontend](#bloco-14--fundação-do-frontend)
  - [Bloco 15 — Telas de jogadores](#bloco-15--telas-de-jogadores)
  - [Bloco 16 — Clubes, página do clube, compra e venda](#bloco-16--clubes-página-do-clube-compra-e-venda)
  - [Bloco 17 — Histórico na página do clube e CSV](#bloco-17--histórico-na-página-do-clube-e-exportar-csv)
  - [Bloco 18 — Liga no frontend](#bloco-18--liga-no-frontend)
  - [Bloco 19 — Polimento: feedback, estados, responsividade e testes](#bloco-19--polimento-feedback-estados-responsividade-e-testes)
- **Fase 4 — Entrega**
  - [Bloco 20 — Docker Compose completo](#bloco-20--docker-compose-completo)
  - [Bloco 21 — README final](#bloco-21--readme-final)
  - [Bloco 22 — Ensaio em máquina limpa](#bloco-22--ensaio-em-máquina-limpa)
  - [Bloco 23 — Entrega](#bloco-23--entrega)
  - [Bloco 24 — Preparação para a entrevista](#bloco-24--preparação-para-a-entrevista)
- [Anexo A — Pegadinhas do enunciado](#anexo-a--as-pegadinhas-do-enunciado-checklist)
- [Anexo B — Matriz de rastreabilidade](#anexo-b--matriz-de-rastreabilidade-modelo)
- [Anexo C — Diário de uso de IA](#anexo-c--diário-de-uso-de-ia-modelo)

---

# Parte 0 — Visão geral

## Datas que importam

| Quando | O quê |
| --- | --- |
| **qui 15/10/2026, 23h59** | Último prazo para enviar **dúvidas** (issue no GitHub ou e-mail). |
| **sex 16/10/2026** | Saem as respostas, publicadas como **errata**. Leia: a errata vale mais que o enunciado. |
| **sex 23/10/2026, 20h** | **Prazo de entrega** (e-mail com link e hash do commit). Mire em entregar até as 17h. |
| **seg 26/10/2026, 12h** | O repositório precisa estar **público** (a banca copia nesse horário). |

## Como a nota funciona (e onde estão os pontos)

Nota de 0 a 10: **5,0 do backend + 5,0 do frontend**. Para passar: **≥ 7,0 no total, com ≥ 2,5 em cada lado**.

| Parte | O quê | Pontos | Como é corrigido |
| --- | --- | --- | --- |
| B1 | Roteiro da API | **30** | **Script automático**: chama sua API e confere status, corpo e cabeçalhos. Cada item vale tudo ou nada. |
| B2 | Qualidade do código backend | 10 | Pessoa lendo o código |
| B3 | Banco de dados | 6 | Pessoa lendo + inserções diretas no banco |
| B4 | README + Git (backend) | 2 | Leitura |
| B5 | Diferenciais backend | 2 | Testes, Docker, Swagger, logs, lint (0,5 cada, até 2) |
| F1 | Roteiro da interface | **30** | Pessoa usando sua tela, com vídeo e registro de rede |
| F2 | Qualidade do código frontend | 10 | Leitura |
| F3 | Usabilidade e feedback | 6 | Uso da tela |
| F4 | README + Git (frontend) | 2 | Leitura |
| F5 | Diferenciais frontend | 2 | Responsividade (1), testes (1), lint (0,5) |

**O que isso significa na prática:**

1. **60% da nota são os dois roteiros (B1 e F1).** Regra de negócio exata vale mais que tela bonita. A fidelidade visual ao Figma **não conta ponto**.
2. **O script do B1 é implacável**: `40.00` vs `40.01` zera o item inteiro. Arredondamento, ordem e código HTTP precisam estar exatos.
3. **Se a aplicação não subir seguindo o README, você perde quase tudo.** Testar o README numa máquina limpa (Bloco 22) é obrigatório.
4. **Entrega parcial é aceita**: o que funciona pontua. Se faltar tempo, corte funcionalidades inteiras no fim da lista (Liga) em vez de fazer tudo pela metade.

## O que elimina (leia duas vezes)

- E-mail de entrega **depois do prazo**, ou enviado de **outro endereço** (use o e-mail onde você recebe as mensagens do RH).
- Repositório **não público** às 12h de 26/10.
- **Hash** ausente ou errado no e-mail (precisa ser o hash completo, de 40 caracteres).
- Commit sem as pastas `frontend/` e `backend/` na raiz.
- **Tecnologia fora da lista**: SQLite, MongoDB, Create React App etc.
- Cópia de outro candidato.

## Cronograma sugerido (10 dias)

O barema exige **commits enviados (push) em pelo menos 3 dias diferentes** em cada pasta. Então: **faça push todo dia**.

| Dia | Data | Blocos | Meta do dia |
| --- | --- | --- | --- |
| 1 | qua 14/10 | 1, 2, 3 | Entender tudo, enviar dúvidas, ambiente pronto, repositório criado |
| 2 | qui 15/10 | 4, 5 | Banco criado por migration; API de pé com erros padronizados. **Dúvidas até 23h59.** |
| 3 | sex 16/10 | 6, 7 | Cálculos com testes passando; CRUD de jogadores. **Ler a errata.** |
| 4 | sáb 17/10 | 8, 9 | Listagem com filtros; clubes |
| 5 | dom 18/10 | 10, 11 | Compra, venda, histórico, CSV |
| 6 | seg 19/10 | 12, 13 | Liga; revisão do backend |
| 7 | ter 20/10 | 14, 15 | Base do frontend; telas de jogadores |
| 8 | qua 21/10 | 16, 17 | Clubes, compra, venda, histórico |
| 9 | qui 22/10 | 18, 19, 20 | Liga no front, polimento, Docker |
| 10 | sex 23/10 | 21, 22, 23 | README, ensaio limpo, **entrega até as 17h** |

Se atrasar: o backend é a base de tudo, então não comece o frontend com o backend quebrado. Mas **não deixe o frontend para o último dia**: são 5 pontos da nota e o mínimo de 2,5 vale para ele também.

## Como trabalhar com a IA (o método que vale para todos os blocos)

O maior erro com IA é pedir "faz o projeto inteiro". Sai um código enorme que você não entende e que tem bugs escondidos. Faça assim, **em todo bloco**:

1. **Leia a parte do enunciado do bloco.** Anote as regras com suas palavras.
2. **Peça um plano antes do código.** "Antes de escrever código, liste os arquivos que vai criar ou alterar e o que cada um faz. Aponte dúvidas sobre o enunciado."
3. **Corrija o plano.** É aqui que você exerce o papel de dev: "não, o cálculo tem que ficar no domínio, não no controller".
4. **Mande implementar, com testes.** As tabelas de exemplo do enunciado "foram conferidas e podem ser usadas como casos de teste". Peça que **cada tabela vire um teste automatizado**.
5. **Rode e confira você mesma.** Rode os testes, chame a API e compare com o enunciado. Não acredite em "pronto, funcionando".
6. **Peça explicação do que não entendeu.** "Explique linha a linha o que essa função faz e por quê." Se você não consegue explicar, não está pronto.
7. **Faça o commit** com mensagem descritiva e **push**.
8. **Anote no diário de IA** (Anexo C) o que pediu, o que aceitou e o que mudou. Isso vira a seção obrigatória do README.

### Modelo de prompt (adapte em cada bloco)

```text
CONTEXTO
Estou fazendo o desafio do SENAI (API REST + frontend React) de mercado de jogadores.
Stack: NestJS + TypeScript + Prisma + PostgreSQL (backend); React + Vite + TypeScript (frontend).
Arquitetura: controller (só HTTP) → service (orquestra e valida regras) → Prisma (dados).
Os cálculos ficam em funções puras em src/domain, cada um em UM único lugar.
Identificadores em inglês, camelCase/PascalCase. Sem código comentado, sem código sem uso.

TAREFA
Implementar [BLOCO X: descrição].

REGRAS DO ENUNCIADO (copiadas literalmente)
[cole aqui os trechos do enunciado: regras, limites, exemplos de request/response]

O QUE EU QUERO
1. Primeiro, o plano: arquivos a criar ou alterar e responsabilidade de cada um. Não escreva código ainda.
2. Liste qualquer ponto do enunciado que esteja ambíguo para você.
3. Depois que eu aprovar: implemente e escreva testes usando as tabelas de exemplo como casos.
```

> 💡 Se você usa o Claude Code ou o Cursor, crie na raiz do repositório um arquivo de instruções (`CLAUDE.md` ou `.cursorrules`) com a parte "CONTEXTO" acima. A IA vai ler isso sozinha toda vez, e você não precisa repetir. Declare isso no README, na seção de IA.

---

# Fase 1 — Preparação

## Bloco 1 — Entender o problema

### 🎯 Objetivo
Ao final deste bloco, você consegue explicar o sistema inteiro sem olhar o enunciado e tem uma lista de dúvidas para enviar até 15/10.

### 📖 O que você precisa entender

O sistema simula um **mercado de jogadores**. O fluxo é linear:

```text
Jogadores ──┐
            ├──► Compra (cria contrato) ──► Venda (multa + comissão) ──► Histórico
Clubes ─────┘          │
                       └──► Escalação (5 titulares) ──► Partidas ──► Classificação
```

São **4 módulos**:

| Módulo | Entidades | Ideia central |
| --- | --- | --- |
| 1. Jogadores | jogador | O preço muda conforme condição física, agilidade e idade. O "valor base" é fixo, calculado uma vez no cadastro; o "valor de mercado" é recalculado a cada consulta. |
| 2. Clubes | clube | Começa com 300,00 de caixa. Patrimônio = caixa + soma do valor de mercado dos jogadores. |
| 3. Mercado | contrato, transação | Comprar custa valor + taxa (limite de 50% do caixa). Vender antes do fim do contrato gera multa; vender com lucro gera comissão. Tudo vai para o histórico. |
| 4. Liga | escalação, partida, duelo | 5 titulares; o placar sai de 6 "duelos" de atributo contra atributo, sem sorteio. |

**Conceitos que você precisa dominar:**

- **Valor calculado vs. valor gravado.** O valor de mercado, o overall, o patrimônio e a classificação **nunca** são colunas no banco. São calculados na hora. O valor base, o valor da transação e o valor de compra do contrato **são** gravados (são "foto do momento").
- **Snapshot (foto do momento).** A transação e o duelo guardam nome e valores do momento. Se o jogador muda de nome depois, o histórico não muda.
- **Exclusão lógica (soft delete).** Excluir = preencher `excluido_em`. A linha continua no banco, mas a API trata o jogador como inexistente (404).
- **Operação atômica (transação do banco).** A compra mexe em 4 coisas (caixa, jogador, contrato, transação). Ou grava tudo ou nada. Isso vale ponto (B2).
- **Códigos HTTP:** `400` = pedido mal formado; `404` = não existe; `409` = existe e está bem formado, mas fere uma regra de negócio. A ordem de checagem é sempre **400 → 404 → 409**.

### 🛠️ Passo a passo

1. **Leia na ordem sugerida pelo próprio enunciado:** Objetivo → Como funciona → glossário → barema → Premissas → Funcionalidades → Endpoints.
2. **Leia o `barema.md` inteiro.** Ele diz exatamente o que o script vai testar (itens B01 a B22 e F01 a F14). É a sua "lista de aceitação".
3. **Abra o mockup no Figma** e passe por todas as telas. Não precisa copiar o visual, mas ele mostra o fluxo.
4. **Calcule à mão** 2 ou 3 exemplos de cada tabela (valor de mercado, overall, valor base, taxa, multa, comissão, duelos). Use calculadora. Se o seu número bate com o da tabela, você entendeu a regra. **Isso é o que vai te salvar na entrevista.**
5. **Monte a matriz de rastreabilidade** (Anexo B): uma linha para cada regra (V1–V9, RN01–RN21), com as colunas "onde está no código" e "testado?". Você vai preencher ao longo do projeto.
6. **Leia as issues já abertas** em https://github.com/isi-tics/desafio-isi-dev-1/issues. Outras pessoas podem ter feito perguntas úteis.
7. **Liste suas dúvidas** e envie até **15/10 às 23h59**. Uma boa dúvida cita a regra e dá um exemplo concreto:
   > "Na RN07, com `sort=age_asc,name`, o desempate final por nome fica redundante. Está correto aceitar `name` como segundo critério?"

### ✅ Como saber que terminou
- [ ] Consigo explicar, sem olhar, o que acontece numa compra e numa venda, com os números do exemplo do "Meia Lua".
- [ ] Calculei à mão pelo menos um exemplo de cada tabela e bati com o resultado.
- [ ] Sei a diferença entre 400, 404 e 409 e consigo dar um exemplo de cada.
- [ ] A matriz de rastreabilidade está criada.
- [ ] Dúvidas enviadas (ou decidi que não tenho).

### 🎤 Na entrevista podem perguntar
- "Por que o valor de mercado não é uma coluna no banco?" → Porque depende da condição e da idade atuais; gravá-lo criaria dado duplicado que fica desatualizado.
- "Qual a diferença entre a transação do histórico e uma transação de banco?" → Uma é registro de negócio (compra/venda); a outra é o mecanismo de atomicidade do banco.

---

## Bloco 2 — Decidir a arquitetura e a stack

### 🎯 Objetivo
Escolher as tecnologias **dentro da lista permitida** e saber justificar cada escolha.

### 📖 A stack recomendada (e por quê)

| Camada | Escolha | Por que (sua justificativa na entrevista) |
| --- | --- | --- |
| Backend | **Node.js 22 LTS + NestJS + TypeScript** | O Nest já organiza o projeto em módulo/controller/service, o que pontua direto em "camadas" (B2). Tem validação declarativa (pipes + DTOs), filtro de exceções central e Swagger quase automático (diferencial B5). |
| ORM | **Prisma** | Migrations versionadas (critério B3: "criação reprodutível"), consultas parametrizadas (segurança B2), transações com `$transaction`. O próprio enunciado usa Prisma como exemplo de README. |
| Banco | **PostgreSQL 16** (no Docker) | Aceito, robusto, tem `NUMERIC` para dinheiro. Rodar no Docker evita instalar o Postgres na máquina da banca. |
| Dinheiro | **Decimal** (`Prisma.Decimal` / decimal.js) | `0.1 + 0.2 !== 0.3` em JavaScript. Com `number` (float), 8,7875 pode virar 8,78749999 e arredondar errado. O script confere centavo por centavo. |
| Frontend | **React 18+ + Vite (template `react-ts`)** | Permitido, rápido e simples. Não use Next.js: evita o risco de eliminação por Route Handler que "calcula". |
| Rotas (front) | **React Router** (modo biblioteca) | Permitido explicitamente. **Não** use o "modo framework". |
| Dados (front) | **TanStack Query** | Cria a "camada de acesso à API" via hooks (F2), dá `isPending` para desabilitar o botão (clique duplo, F3) e recarrega os dados depois de cada ação (F2). |
| Formulários | **React Hook Form + Zod** | Validação antes de enviar, com mensagem junto ao campo (F2). |
| Estilo | **Tailwind CSS** | Rápido para fazer responsivo (diferencial de 375 px). |
| Testes | **Jest** (já vem no Nest) no back; **Vitest + Testing Library** no front | Diferenciais B5 e F5. |
| Qualidade | **ESLint + Prettier** nos dois | Diferenciais B5 e F5. |

> Alternativa: Express + Zod no lugar do NestJS é mais "simples de ler", mas você teria que montar à mão as camadas, o tratamento de erros e o Swagger. Com IA escrevendo o código, o Nest entrega mais pontos com menos risco. Escolha uma e não troque no meio.

### 📖 Estrutura de pastas (alvo)

```text
mercado-de-jogadores/            ← raiz do repositório
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        ← modelo do banco (tabelas em português via @@map)
│   │   └── migrations/          ← SQL versionado
│   ├── src/
│   │   ├── main.ts              ← bootstrap: prefixo /api/v1, CORS, pipes, filtro
│   │   ├── app.module.ts
│   │   ├── common/              ← filtro de exceções, validadores, formatação de datas e texto
│   │   ├── domain/              ← FUNÇÕES PURAS: cálculos (1 lugar só para cada regra)
│   │   │   ├── money.ts
│   │   │   ├── overall.ts
│   │   │   ├── base-value.ts
│   │   │   ├── market-value.ts
│   │   │   ├── purchase.ts      (taxa e limite)
│   │   │   ├── sale.ts          (dias restantes, multa, comissão)
│   │   │   ├── ordering.ts      (ordem alfabética, ordem das posições)
│   │   │   └── match-engine.ts  (duelos e placar)
│   │   ├── prisma/              ← PrismaService
│   │   ├── players/             ← controller, service, dto
│   │   ├── clubs/
│   │   ├── market/              ← compra, venda, histórico, CSV
│   │   └── league/              ← escalação, partidas, classificação
│   ├── test/
│   ├── .env.example
│   └── package.json (+ package-lock.json versionado!)
├── frontend/
│   ├── src/
│   │   ├── api/                 ← cliente HTTP + funções por recurso (ÚNICO lugar com fetch)
│   │   ├── hooks/               ← hooks do TanStack Query (usePlayers, useBuyPlayer…)
│   │   ├── components/          ← DataTable, FormField, Feedback, ConfirmDialog, Pagination…
│   │   ├── pages/               ← PlayersPage, ClubsPage, ClubPage, MatchesPage, StandingsPage
│   │   ├── utils/               ← formatMoney, formatDateTime, toApiDateTime
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── .gitignore
├── .gitattributes
└── README.md
```

**Por que separar `domain/`?** O barema (B2, "Regras de negócio") exige que cada um dos 6 cálculos (valor de mercado, overall, taxa, multa, comissão, placar) esteja **em um único lugar**. Funções puras (recebem dados, devolvem resultado, sem banco) são fáceis de testar e impossíveis de duplicar sem perceber.

### 📖 Convenções (decida agora e passe para a IA)

- **Código em inglês** (`marketValue`, `PlayersService`). O barema penaliza "identificadores em mais de um idioma". Exceções permitidas: nomes de tabelas e colunas do banco (em português, definidos pelo enunciado) e campos da API em snake_case.
- **Textos de tela e mensagens de erro em português.**
- **Mensagens de commit em português**, no padrão Conventional Commits: `feat(players): cadastro com cálculo do valor base`.

### ✅ Como saber que terminou
- [ ] Sei dizer por que escolhi cada tecnologia.
- [ ] Todas estão na lista permitida (Node 20/22, React 18+, Vite, PostgreSQL 14+).
- [ ] A estrutura de pastas está decidida.

---

## Bloco 3 — Ambiente e repositório Git

### 🎯 Objetivo
Máquina pronta, repositório criado e o primeiro commit enviado.

### 🛠️ Passo a passo

**3.1 Instale (no Windows):**

| Ferramenta | Versão | Verificar com |
| --- | --- | --- |
| Node.js | **22 LTS** (instalador do nodejs.org) | `node -v` → `v22.x` |
| Git | atual | `git --version` |
| Docker Desktop | atual (ative o WSL 2) | `docker compose version` |
| VS Code + extensões | ESLint, Prettier, Prisma, REST Client (ou Thunder Client) | — |
| WSL 2 com Ubuntu 24.04 | opcional, mas **muito útil no Bloco 22** | `wsl -l -v` |

> ⚠️ **Node 24 não é permitido.** O enunciado aceita só Node.js **20 LTS ou 22 LTS**. Se `node -v` mostrar `v24.x`, instale o 22 com um gerenciador de versões (ex.: `nvm-windows`: `nvm install 22` e `nvm use 22`). No projeto, fixe a versão com `"engines": { "node": "22.x" }` no `package.json` e um arquivo `.nvmrc` com `22`. No Docker, use a imagem `node:22-alpine`.

**3.2 Configure o Git com o e-mail privado (noreply)** — o enunciado pede isso para proteger seus dados:

1. No GitHub: *Settings → Emails* → marque "Keep my email addresses private" e copie o endereço `xxxx+usuario@users.noreply.github.com`.
2. No terminal:
   ```bash
   git config --global user.name "Seu Nome"
   git config --global user.email "xxxx+usuario@users.noreply.github.com"
   ```

**3.3 Crie o repositório** (pode começar privado; precisa estar público até 26/10, às 12h):

```bash
cd ~/Downloads/Desafio
mkdir mercado-de-jogadores && cd mercado-de-jogadores
git init -b main
mkdir backend frontend
```

**3.4 Crie dois arquivos de configuração na raiz** (peça à IA ou escreva):

- `.gitignore`: `node_modules/`, `dist/`, `.env`, `coverage/`. **Não ignore** `package-lock.json` nem `.env.example`.
- `.gitattributes` com `* text=auto eol=lf`. Você está no Windows, e a banca, no Ubuntu: isso evita que os scripts quebrem por causa do fim de linha CRLF.

**3.5 Primeiro commit e push:**

```bash
git add .
git commit -m "chore: estrutura inicial do repositório com pastas backend e frontend"
git remote add origin https://github.com/SEU_USUARIO/mercado-de-jogadores.git
git push -u origin main
```

### 📖 Regras de Git que valem ponto (B4 e F4)

- **≥ 10 commits que alteram `backend/`** e **≥ 10 que alteram `frontend/`**.
- **Push em ≥ 3 dias diferentes** (o que conta é a data do push, não a do commit).
- **No máximo metade das mensagens "genéricas".** Palavras proibidas sozinhas: *ajuste, correção, fix, update, wip, teste, final, versão…*
  - ❌ `fix` · `ajustes` · `update final`
  - ✅ `fix(market): arredonda a taxa para longe do zero` · `feat(clubs): ordenação pelo patrimônio`
- **Um commit = uma ideia.** Commit pequeno é mais fácil de explicar e de desfazer.
- **Nunca use `git push --force`** depois de enviar: commits reescritos contam só no dia do envio forçado.

### ✅ Como saber que terminou
- [ ] `node -v`, `docker compose version` e `git --version` funcionam.
- [ ] Repositório no GitHub, com o primeiro push feito, usando o e-mail noreply (confira com `git log --format='%ae'`).

---

# Fase 2 — Backend

## Bloco 4 — Banco de dados

### 🎯 Objetivo
As 7 tabelas criadas por **migration**, com os nomes exatos do enunciado, e comandos para criar e recriar o banco do zero.

### 📖 O que você precisa entender

- **Migration** = arquivo SQL versionado que leva o banco de uma versão para a próxima. Quem clonar o repositório roda `prisma migrate deploy` e tem o mesmo banco.
- **Prisma `@@map` e `@map`**: no código você chama o modelo de `Player` e o campo de `baseValue`; no banco, eles viram `jogadores.valor_base`. Assim o banco segue o enunciado (português) e o código segue o padrão (inglês).
- **Chave estrangeira (FK)** liga tabelas: `jogadores.clube_id → clubes.id`.
- **Restrição de unicidade (UNIQUE)** garantida **no banco**, não só no código. O barema testa inserindo direto no banco.

### 📖 As 3 armadilhas do banco (valem pontos no B3)

1. **Nome do clube único, sem diferenciar maiúsculas, mas diferenciando acentos.** "Águias FC" e "águias fc" são iguais; "Águias FC" e "Aguias FC" são diferentes.
   - Solução recomendada: uma coluna extra `nome_normalizado` (o nome depois da regra V4, em minúsculas) com `UNIQUE`. O enunciado permite isso explicitamente ("coluna ou índice normalizado para garantir a RN10 é permitido").
   - Alternativa: índice único em `lower(nome)` criado por SQL na migration (o Prisma não gera esse índice sozinho; teria que editar a migration à mão).
2. **`escalacoes`**: chave primária **composta** (`clube_id`, `jogador_id`) **e** `jogador_id` com `UNIQUE`.
3. **Nenhuma coluna de valor calculado**: nada de `valor_mercado`, `overall`, `patrimonio`, `pontos`…

**Tipos de dinheiro:** `DECIMAL(6,2)`, `DECIMAL(10,2)` etc., exatamente como nas tabelas do enunciado. No Prisma: `@db.Decimal(6, 2)`.

**Datas:** use `TIMESTAMPTZ` (`@db.Timestamptz`) para guardar o instante exato; a conversão para `-03:00` é feita só na hora de responder.

### 🛠️ Passo a passo

1. Peça à IA para criar o projeto Nest em `backend/` e configurar o Prisma.
2. Peça um `docker-compose.yml` **na raiz** com o serviço `db` (imagem pública `postgres:16`, porta 5432, usuário e senha de desenvolvimento, volume nomeado).
3. Peça o `schema.prisma` com as 7 tabelas. **Cole no prompt a seção "3. Estrutura de tabelas" inteira.**
4. **Confira você mesma, coluna por coluna**, comparando com o enunciado. Cada coluna faltando ou com nome diferente é um "desvio" (3 desvios = zero no critério).
5. Rode:
   ```bash
   docker compose up -d db
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev --name init
   ```
6. Teste a recriação: `npx prisma migrate reset --force --skip-seed`.
   > ⚠️ O `migrate reset` roda o *seed* automaticamente se houver um configurado. O banco precisa começar **vazio**, então use `--skip-seed` ou não configure seed.
7. Abra o banco e olhe as tabelas: `npx prisma studio`, ou `docker compose exec db psql -U postgres -d passe -c '\d jogadores'`.

### 🤖 Prompt sugerido

```text
[CONTEXTO do modelo de prompt]
TAREFA: criar o schema Prisma e a primeira migration.
REGRAS: [cole "3. Estrutura de tabelas" e a RN10]
Requisitos:
- Modelos em inglês (Player, Club, Contract, Transaction, Lineup, Match, MatchDuel) mapeados com @@map/@map
  para os nomes EXATOS do enunciado.
- Dinheiro em Decimal com a precisão do enunciado. Datas em Timestamptz.
- Unicidade do nome do clube conforme a RN10 via coluna nome_normalizado UNIQUE.
- escalacoes com PK composta (clube_id, jogador_id) e UNIQUE em jogador_id.
- Nenhuma coluna para valores calculados.
Mostre o schema antes de gerar a migration.
```

### ✅ Como conferir
- [ ] As 7 tabelas existem, com **todos** os nomes de colunas do enunciado.
- [ ] Teste a unicidade no `psql`: inserir 'Águias FC' e depois 'águias fc' → erro. Inserir 'Aguias FC' → aceita.
- [ ] `migrate reset --force --skip-seed` recria tudo vazio.

### 💾 Commits
- `chore(backend): cria projeto NestJS com Prisma`
- `feat(db): schema das 7 tabelas e migration inicial`
- `chore: docker compose com PostgreSQL 16`

### 🎤 Na entrevista
- "Por que DECIMAL e não FLOAT para dinheiro?"
- "Como você garantiu que 'Águias FC' e 'águias fc' não coexistam, mesmo inserindo direto no banco?"

---

## Bloco 5 — Esqueleto da API (a fundação)

### 🎯 Objetivo
Uma API que ainda não faz nada de negócio, mas já se comporta **exatamente** como o enunciado exige em erros, prefixo, CORS, validação e logs. Isso vale pontos em quase todo item do B1, porque toda recusa precisa ter o formato certo.

### 📖 O que construir (e por quê)

| Peça | O que faz | Regra |
| --- | --- | --- |
| Prefixo global `/api/v1` | Todas as rotas começam com ele | Convenções |
| **Filtro global de exceções** | Toda recusa vira `{ "message": "texto" }` com o status certo, **sem stack trace**, e `Content-Type: application/json`. Erros inesperados viram 500 com mensagem genérica. | B02, B2 "Validação e erros" |
| Rota inexistente → 404 em JSON | `GET /api/v1/inexistente` → `404 {message}` | B02 |
| JSON inválido → 400 | Corpo malformado, ou array/valor simples (`[]`, `"x"`, `10`) → 400 | V1 |
| **ValidationPipe** com `whitelist: true` e **sem** `forbidNonWhitelisted` | Campos extras são **ignorados sem erro** | V7 |
| **Sem conversão automática de tipos** | `"15"` (texto) tem que ser recusado | V2 |
| Validador de id na URL | `abc`, `0`, `-1`, `1.5`, `01` ou valor acima de 2147483647 → **404** (não 400!) | V8 |
| CORS | Só a origem do frontend, lida de variável de ambiente (`CORS_ORIGIN`) | B2 "Segurança" |
| Logger de requisições | Uma linha por requisição: data e hora, método, caminho, status. Use o `Logger` do Nest ou o `pino`, **nunca** `console.log`. | Diferencial B5 |
| Swagger em `/api/docs` | Documentação interativa | Diferencial B5 |
| ESLint + Prettier com `npm run lint` e `npm run format:check` | O de formatação **só verifica** | Diferencial B5 |
| Utilitários de texto e data | `normalizeName()` (regra V4), `parseApiDateTime()` (RN01), `formatApiDateTime()` (saída `-03:00`) | V4, RN01 |

### 📖 Detalhes que pegam

- **V4 (nomes):** remover espaços das pontas, trocar espaços repetidos por um só, recusar caracteres de controle (tab, quebra de linha) com 400, e texto vazio conta como ausente.
- **RN01 (datas):** a entrada precisa casar **exatamente** com `AAAA-MM-DDTHH:MM-03:00`. Além do formato, a data tem que existir (`2027-02-30` → 400; `24:00` → 400). Não deixe o `new Date()` "ajustar" a data sozinho: valide dia, mês e hora.
- **Saída de datas:** sempre `AAAA-MM-DDTHH:MM:SS-03:00`. O servidor guarda em UTC; na resposta, subtraia 3 horas e escreva `-03:00`.
- **Mensagem de erro do Nest:** por padrão, o `ValidationPipe` devolve `message` como **array**. O enunciado quer um texto. O filtro de exceções deve juntar tudo numa string.

### 🤖 Prompt sugerido

```text
[CONTEXTO]
TAREFA: montar a fundação da API NestJS, ainda sem regras de negócio.
REGRAS: [cole "Validação dos dados" (V1 a V9), "Datas e horas" (RN01), "Convenções da API" e "2.5 Códigos de erro globais"]
Preciso de:
1. prefixo /api/v1; CORS só para process.env.CORS_ORIGIN;
2. filtro global de exceções: sempre {message: string}, Content-Type application/json, sem stack trace, 500 genérico;
3. 404 em JSON para rota inexistente; 400 para JSON inválido ou corpo que não seja objeto;
4. ValidationPipe com whitelist (ignora extras), SEM forbidNonWhitelisted e SEM conversão implícita de tipos;
5. um pipe para ids da URL: só /^[1-9]\d*$/ e até 2147483647, senão 404;
6. utilitários em src/common: normalização de nome (V4), parse estrito de data (RN01) e formatação -03:00;
7. log de cada requisição com o Logger do Nest (data e hora, método, caminho, status);
8. Swagger em /api/docs; ESLint e Prettier com scripts lint e format:check;
9. testes unitários para os utilitários de nome e de data, com casos válidos e inválidos do enunciado.
Primeiro me mostre o plano.
```

### ✅ Como conferir (use o REST Client ou o curl)

```http
### rota inexistente → 404 JSON
GET http://localhost:3000/api/v1/inexistente

### JSON inválido → 400
POST http://localhost:3000/api/v1/players
Content-Type: application/json

{ "name": "Ana

### array como corpo → 400
POST http://localhost:3000/api/v1/players
Content-Type: application/json

[]
```

- [ ] Toda resposta de erro tem `message` em texto e `Content-Type: application/json`.
- [ ] Nenhuma resposta mostra stack trace.
- [ ] O log mostra uma linha por requisição.
- [ ] `/api/docs` abre.
- [ ] `npm run lint` e `npm run format:check` passam.

### 💾 Commits
- `feat(api): prefixo /api/v1, CORS por variável de ambiente e filtro global de erros`
- `feat(api): validação de id da URL e de corpo JSON`
- `feat(common): normalização de nomes e datas no horário de Brasília`
- `chore(backend): ESLint, Prettier, Swagger e log de requisições`

### 🎤 Na entrevista
- "Onde ficam tratados os erros da sua API?" → Num filtro global; os services só lançam exceções (`BadRequestException`, `NotFoundException`, `ConflictException`).
- "Por que id `abc` dá 404 e não 400?" → Porque o enunciado manda (V8): um id inválido na URL é tratado como recurso inexistente.

---

## Bloco 6 — O domínio: os cálculos (o coração do projeto)

### 🎯 Objetivo
Todos os cálculos do sistema como **funções puras**, com **todas as tabelas de exemplo do enunciado viradas testes**, todos passando. Este bloco sozinho sustenta B05, B06, B10, B13, B14, B15 e B21 (cerca de 13 pontos), o critério "Regras de negócio" do B2 e o diferencial de testes.

### 📖 O que você precisa entender

**Função pura** = mesma entrada, mesma saída; não acessa banco, não pega a hora sozinha (a hora é passada como parâmetro). Por isso dá para testar com as tabelas.

**Arredondamento — a regra mais importante do projeto:**
- Dinheiro: 2 casas, metade **para longe do zero** (14,775 → 14,78; 0,385 → 0,39), **uma única vez, no final** de cada cálculo.
- Overall e atributos na partida: inteiro, metade para cima (72,5 → 73).
- Nunca arredonde no meio da conta. Exemplo: na comissão, 10% × 10,00 + 20% × 0,01 = 1,002 → 1,00 (soma tudo, depois arredonda).

**Por que não usar `number`?** Experimente no console do navegador: `0.1 + 0.2`. Dá `0.30000000000000004`. Com dinheiro, use `Decimal` (o `decimal.js`, que já vem com o Prisma). No `decimal.js`, o modo `ROUND_HALF_UP` arredonda a metade para longe do zero, que é o que o enunciado pede. Para inteiros (overall), dá para usar só aritmética de inteiros: some os produtos (inteiros) e arredonde a divisão por 100.

### 📖 As funções e as tabelas que viram teste

| Arquivo | Função | Regra | Tabela de teste no enunciado |
| --- | --- | --- | --- |
| `money.ts` | `roundMoney(decimal)` | Premissas | 14,775 → 14,78; 0,385 → 0,39 |
| `overall.ts` | `calculateOverall(position, attributes)` | RN06 | 5 linhas (MEI 73, ATA 76, LAT 72, ZAG 73, GOL 68) |
| `base-value.ts` | `calculateBaseValue(overall, potential, ageAtRegistration)` | RN06 | 9 linhas |
| `market-value.ts` | `calculateMarketValue(baseValue, condition, agility, age)` | RN02 a RN05 | 10 linhas |
| `purchase.ts` | `calculatePurchaseFee(marketValue)`, `exceedsCashLimit(cost, cash)` | RN13 | 5 linhas |
| `sale.ts` | `remainingDays(loyaltyUntil, now)`, `penaltyRate(days)`, `calculatePenalty(value, rate)`, `calculateCommission(profit)` | RN15, RN16 | 7 + 6 + 5 linhas |
| `ordering.ts` | `compareNames(a, b)`, `POSITION_ORDER` | Premissas, RN11 | "Épsilon" entre "Delta" e "Gama"; "Ana Lima" antes de "Ana-Maria" |
| `match-engine.ts` | `playMatch(homeLineup, awayLineup)` → duelos e placar | RN20 | Águias FC 1 × 2 Delta FC (6 duelos) |

### 📖 Detalhes de cada cálculo

- **Valor de mercado (RN05), passo a passo:**
  1. desconto pela condição: APTO 0, MAL_CONDICIONADO 15, DOENTE 30;
  2. se **não** está APTO: agilidade 80–100 → desconto ÷ 2; agilidade 1–30 → desconto + 10;
  3. ajuste por idade: até 21 → +10; 22–31 → 0; 32+ → −10;
  4. total = idade − desconto; se total < −40, usa −40;
  5. valor = base × (100 + total) ÷ 100, arredondado; se < 1,00, vale 1,00.
- **Taxa de compra:** 5% só se o valor de mercado for **maior** que 30,00 (30,00 exato não paga).
- **Limite de 50% do caixa:** compare `custo <= caixa / 2` **sem arredondar** a metade (caixa 261,15 → limite 130,575 → custo 130,58 é recusado).
- **Dias restantes:** a diferença em milissegundos ÷ 86.400.000, **arredondada para cima**; se ≤ 0, então 0. ("30 dias e 1 minuto" → 31.)
- **Comissão:** só com lucro > 0: 10% da parte até 10,00 + 20% da parte acima de 10,00, e arredonda no final.
- **Ordem alfabética:** minúsculas → remover acentos (NFD e retirar as marcas) → comparar caractere a caractere pela **ordem Unicode** (`a < b`), **não** com `localeCompare`. Empate → id crescente.
- **Partida:** ordenar os titulares pela ordem do elenco (GOL, ZAG, LAT, MEI, ATA; depois nome; depois id) → goleiro + linha 1º a 4º. MAL_CONDICIONADO: cada atributo × 0,85, arredondado com metade para cima (dá para fazer só com inteiros: `Math.floor((attr * 85 + 50) / 100)`). Duelos: 4º × goleiro, 3º × 1º, 2º × 2º; gol se ataque > defesa.

### 🤖 Prompt sugerido

```text
[CONTEXTO]
TAREFA: criar src/domain com funções PURAS para todos os cálculos, e testes com Jest.
REGRAS: [cole Premissas (arredondamento e ordem alfabética), RN02 a RN06 com as tabelas de pesos,
RN13, RN15, RN16 e RN20, com TODAS as tabelas de exemplo]
Requisitos:
- Dinheiro com Decimal (decimal.js do Prisma), arredondando para 2 casas com ROUND_HALF_UP (metade para longe do zero),
  uma única vez, no fim de cada cálculo. Inteiros (overall, atributos na partida) com metade para cima, em aritmética inteira.
- Nenhuma função acessa banco nem pega a hora atual: o "agora" é parâmetro.
- Cada tabela de exemplo do enunciado vira um teste com test.each, linha por linha.
- Cada cálculo existe em UM só lugar; os services vão importar daqui.
Primeiro o plano com as assinaturas das funções.
```

### ✅ Como conferir
- [ ] `npm test` termina sozinho (sem modo watch), com **todos** os testes verdes.
- [ ] Existem testes para **cada linha** de cada tabela do enunciado. Conte.
- [ ] Pegue uma linha de cada tabela, refaça a conta à mão e veja se você entende o código que a calcula.
- [ ] Procure no projeto: as fórmulas aparecem **só** em `src/domain`? (Busca no VS Code: `* 0.05`, `/ 100` etc.)

### 💾 Commits
- `feat(domain): arredondamento monetário para longe do zero`
- `feat(domain): overall por pesos da posição e valor base progressivo`
- `feat(domain): valor de mercado por condição, agilidade e idade`
- `feat(domain): taxa de compra, multa por fidelidade e comissão progressiva`
- `feat(domain): motor de partida com 6 duelos`
- `test(domain): casos das tabelas do enunciado`

### 🎤 Na entrevista (o mais provável de cair)
- "Calcule o valor de mercado deste jogador." Esteja pronta para fazer de cabeça um exemplo da tabela.
- "Por que funções puras?" → Testáveis, sem duplicação, separadas do framework.
- "Como você garantiu que os cálculos estão certos?" → As tabelas do enunciado viraram testes automatizados.

---

## Bloco 7 — Jogadores: cadastro, consulta, edição, condição e exclusão

### 🎯 Objetivo
`POST /players`, `GET /players/{id}`, `PUT /players/{id}`, `PATCH /players/{id}/condition` e `DELETE /players/{id}` funcionando. Itens B01, B02, B03, B04, B06 e B08 (≈ 6 pontos).

### 📖 Regras-chave

**Cadastro (`POST`)** — resposta **201** + cabeçalho `Location: /api/v1/players/{id}`:
- `name`: depois da V4, 3–100 caracteres, **≥ 2 palavras** e **nenhum dígito**.
- `position`: `GOL|ZAG|LAT|MEI|ATA`, exatamente em maiúsculas (`"mei"` → 400).
- `agility` 1–100 inteiro; se `age ≥ 35`, no máximo 85 (→ 400).
- `age` 16–45 inteiro.
- 6 atributos 1–99, **soma ≤ 480**.
- `potential` 1–99, **≥ maior atributo**; se `age ≥ 33`, **igual** ao maior atributo.
- Ignorar sem erro: `id`, `club_id`, `condition`, `base_value`, `overall`, `market_value` e qualquer campo desconhecido.
- `condition` nasce `APTO`; `club_id` nasce `null`; o `base_value` é calculado e **gravado**.

**Resposta do jogador** (sempre o mesmo formato, de 2.1.2): inclui `overall` e `market_value` **calculados na hora**. Crie **uma única função** que monta essa resposta (um *mapper*). Ela vai ser reusada no clube, na escalação e na listagem.

**Edição (`PUT`)** — exige `name`, `position`, `agility` e `age`:
- Atributos, potencial e valor base **não mudam** (mesmo se enviados).
- Jogador com clube **mudando** de posição → 409.
- Idade menor que a atual → 409.

**Condição (`PATCH /condition`)**:
- `DOENTE → APTO` direto → 409. Enviar a mesma condição → 200, sem mudança.
- Se passou a `DOENTE` e era titular → sai da escalação, **na mesma transação do banco**. (Deixe preparado agora; você liga isso de verdade no Bloco 12.)

**Exclusão (`DELETE`)** → **204 sem corpo**. Só jogador livre (com clube → 409). Preenche `excluido_em`. Depois disso, o jogador é **404 em tudo**.

> **A ordem das validações** dentro de cada endpoint: **(1)** formato do id e do corpo → 400 (ou 404 para id malformado na URL); **(2)** existência → 404; **(3)** regras de negócio → 409. A correção nunca combina dois erros, mas siga a ordem para ficar previsível.

### 🤖 Prompt sugerido

```text
[CONTEXTO]
TAREFA: módulo players com POST, GET /:id, PUT /:id, PATCH /:id/condition e DELETE /:id.
REGRAS: [cole "Cadastro de Jogadores", RN06, RN08, RN09, a tabela "Limites de cada campo" (linhas de jogador),
e os exemplos 2.1.2 a 2.1.6]
Requisitos:
- DTOs com class-validator para cada endpoint; validações que cruzam campos (soma ≤ 480, potencial,
  agilidade com 35+) como validadores reutilizáveis, não como if no controller.
- Controller só recebe e responde; regras no PlayersService; cálculos importados de src/domain.
- Um único mapper toPlayerResponse() que calcula overall e market_value.
- 201 com header Location. 204 sem corpo no DELETE.
- Jogador com excluido_em preenchido = 404 em todos os endpoints.
- A alteração para DOENTE remove o jogador da escalação dentro de prisma.$transaction.
Mostre o plano primeiro.
```

### ✅ Como conferir — casos que você mesma deve testar

| Pedido | Esperado |
| --- | --- |
| Cadastro do "Meia Lua" (exemplo 2.1.3) | 201, `base_value` 40.00, `overall` 75, `market_value` 40.00, `Location` |
| Mesmo cadastro com `"base_value": 999` | 201, `base_value` continua 40.00 |
| `"name": "  Meia   Lua "` | grava "Meia Lua" |
| `"name": "Ana"` (uma palavra) | 400 |
| `"name": "Ana 2"` | 400 |
| `"agility": "15"` (texto) | 400 |
| `"agility": 50.5` | 400 |
| `"position": "mei"` | 400 |
| `"Agility": 50` (no lugar de `agility`) | 400 (campo obrigatório ausente) |
| Soma dos atributos = 481 | 400 |
| `age` 34, `potential` > maior atributo | 400 |
| `PATCH` para MAL_CONDICIONADO | `market_value` 37.00 |
| `PATCH` de DOENTE para APTO | 409 |
| `PUT` com `age` menor | 409 |
| `DELETE` → depois `GET` | 204 → 404 |
| `GET /players/abc`, `/players/0`, `/players/01` | 404 |

### 💾 Commits
- `feat(players): cadastro com validações e cálculo do valor base`
- `feat(players): consulta com overall e valor de mercado calculados`
- `feat(players): edição com bloqueio de posição e de idade menor`
- `feat(players): alteração de condição física`
- `feat(players): exclusão lógica de jogador livre`

---

## Bloco 8 — Listagem de jogadores (busca, filtros, ordenação e paginação)

### 🎯 Objetivo
`GET /players` com todos os query params. Item B07, e base de F01/F02 (4 pontos de tela).

### 📖 Decisão de projeto importante

O filtro e a ordenação por **valor de mercado** usam um valor que **não está no banco**. Duas saídas:

| Opção | Como | Prós | Contras |
| --- | --- | --- | --- |
| **A (recomendada)** | Buscar todos os jogadores ativos do banco (com os filtros simples, como posição, condição, clube e idade, no `where`), calcular o valor de mercado com a função do domínio, e então filtrar por valor, ordenar e paginar em memória | Fórmula em um só lugar; simples de explicar | Não escala para milhões de jogadores (aqui não importa) |
| B | Reescrever a fórmula em SQL | Escala | Mais difícil; o barema até permite essa duplicação, mas é mais código para você explicar |

Registre a escolha no README, em "Decisões e premissas": *"A listagem calcula o valor de mercado em memória para manter a fórmula num único lugar; adequado ao volume esperado da liga."*

### 📖 Validação dos query params (é aqui que muita gente perde o B07)

- Inteiros (`page`, `limit`, `min_age`, `max_age`, `club_id`): só `/^[1-9]\d*$/`. `page=0`, `page=01`, `page=1.0` → 400.
- Decimais (`min_value`, `max_value`): `/^(0|[1-9]\d*)(\.\d{1,2})?$/`, de 0 a 550.
- Parâmetro presente e vazio (`position=`) → 400. Parâmetro desconhecido → ignorado.
- `sort`: até 2 valores separados por vírgula, sem repetir o **campo** (`value_asc,value_desc` → 400). Depois deles, o desempate é sempre nome e id.
- `free=true` + `club_id` → 400. `club_id` inexistente → 404.
- `min_age > max_age` ou `min_value > max_value` → 400. Com um só limite, o outro assume o extremo.
- `search`: 2–100 caracteres depois da V4; busca "contém", ignorando maiúsculas e acentos.
- `meta.total_pages` = teto(total ÷ limit); 0 quando não há itens. Página além da última → 200 com `data: []`.

### 🤖 Prompt sugerido

```text
[CONTEXTO]
TAREFA: GET /players com busca, filtros, ordenação e paginação.
REGRAS: [cole RN07, a tabela de paginação, "1. Filtros e query params aceitos" (linhas de /players e "Regras que valem para todos")]
Decisão: filtros simples no where do Prisma; valor de mercado calculado com a função do domínio;
filtro por valor, ordenação (com compareNames do domínio) e paginação em memória.
Validação dos query params num DTO/pipe próprio e reutilizável (nada de if no controller).
Escreva testes unitários da ordenação e da paginação com a tabela do enunciado.
```

### ✅ Como conferir
- [ ] `?search=joao` encontra "João Silva"; `?search=LUA` encontra "Meia Lua".
- [ ] `?sort=position` dá GOL, ZAG, LAT, MEI, ATA.
- [ ] 23 jogadores com `limit=10&page=3` → 3 itens, `total_pages` 3.
- [ ] `?position=mei` → 400; `?free=true&club_id=1` → 400; `?page=0` → 400.

### 💾 Commits
- `feat(players): listagem paginada com busca sem acentos`
- `feat(players): filtros combinados e ordenação com desempate`

---

## Bloco 9 — Clubes

### 🎯 Objetivo
`POST /clubs`, `GET /clubs` e `GET /clubs/{id}`. Itens B09 e B17, e base do F05/F07.

### 📖 Regras-chave

- **Nome:** depois da V4, 3–60 caracteres, **2 a 5 palavras**, só letras (com acento), espaço, hífen e ponto.
- **Sigla:** 3 letras A–Z maiúsculas; a 1ª é a 1ª letra do nome; as 3 aparecem no nome **nessa ordem** (ignorando caixa e acentos); não podem ser as 3 iguais. Ex.: "Águias FC" → `AGU` ✅, `AFC` ✅, `GUA` ❌ (não começa com A).
  - Isso é um problema de **subsequência**: percorra o nome normalizado procurando a 1ª letra, depois a 2ª a partir dali, depois a 3ª.
- Nome repetido (RN10) → **409**; sigla repetida → **409**; 21º clube → **409**. (Formato inválido é 400.)
- Clube nasce com `cash` 300.00. Resposta 201 + `Location`.
- **Detalhe (`GET /clubs/{id}`)**: `players` na ordem GOL, ZAG, LAT, MEI, ATA → nome → id; cada jogador com o mapper do Bloco 7 **+** `contract: { purchase_value, loyalty_until, remaining_days, penalty_rate }`. Os dias e o percentual vêm das **mesmas funções do domínio** usadas na venda.
- `squad_value` = soma dos valores de mercado; `net_worth` = caixa + elenco.
- `GET /clubs?sort=name|net_worth_asc|net_worth_desc` (padrão `name`); empate → nome → id. Qualquer outro valor → 400.

> **Concorrência no nome único:** mesmo que o service verifique antes, trate também o erro de unicidade do banco (código `P2002` do Prisma) como 409. Assim fica correto mesmo com dois pedidos ao mesmo tempo.

### ✅ Como conferir
- [ ] Criar "Águias FC"/`AGU` → 201, `Location`, `cash` 300.
- [ ] "  águias   fc " → 409; "Aguias FC" (sigla diferente) → 201.
- [ ] Sigla `XYZ` para "Águias FC" → 400.
- [ ] Criar 21 clubes → o último dá 409.

### 💾 Commits
- `feat(clubs): criação com nome único, validação da sigla e limite de 20`
- `feat(clubs): listagem ordenável por nome e patrimônio`
- `feat(clubs): detalhe com elenco ordenado e dados do contrato`

---

## Bloco 10 — Mercado: compra e venda

### 🎯 Objetivo
`POST /players/{id}/buy` e `POST /players/{id}/sell`. Itens B10 a B16: **10 pontos**, o bloco mais valioso.

### 📖 Compra — ordem das checagens

1. **400:** corpo; `club_id` inteiro positivo (0 ou negativo → 400); `loyalty_until` no formato da RN01, data real, **depois de agora** e **até 1.095 dias** (fora disso → 400).
2. **404:** jogador da URL inexistente ou excluído; clube inexistente.
3. **409:** jogador não está livre; o clube já **vendeu** esse jogador antes (procure uma transação `VENDA` com esse clube e esse jogador); elenco com 12; custo > 50% do caixa.

**Gravação (tudo dentro de um `prisma.$transaction`):**
- caixa −= valor + taxa;
- `jogador.clube_id` = clube;
- cria o contrato `ATIVO` com `valor_compra` (sem a taxa) e `fidelidade_ate`;
- cria a transação `COMPRA` (`taxa` = taxa, `multa` = 0, `lucro` = null, `variacao_caixa` = −(valor + taxa), `nome_jogador` = nome atual).

Resposta 200 no formato 2.3.1 (com `contract` e `club_cash`).

### 📖 Venda

1. **404:** jogador inexistente ou excluído. **409:** jogador livre.
2. Calcula: valor de mercado agora; dias restantes; % e multa (teto 10,00); lucro = valor − `valor_compra`; comissão; crédito = valor − multa − comissão.
3. **Grava tudo numa transação:** caixa += crédito; jogador livre (`clube_id` = null); contrato → `RESCINDIDO` (houve multa) ou `ENCERRADO` (sem multa) + `encerrado_em`; transação `VENDA`; **remove da escalação** se for titular.

Resposta 200 no formato 2.3.2.

### 📖 Concorrência (bom ponto para a entrevista)
Dois pedidos de compra ao mesmo tempo para o mesmo jogador podem passar os dois pela checagem "está livre?". Para evitar, dentro da transação: faça um `UPDATE ... WHERE clube_id IS NULL` e confira quantas linhas mudaram, ou use um nível de isolamento mais forte. Peça à IA para tratar isso e para te explicar a solução.

### 🤖 Prompt sugerido

```text
[CONTEXTO]
TAREFA: módulo market com POST /players/:id/buy e POST /players/:id/sell.
REGRAS: [cole RN12 a RN16 com as tabelas, "Campos da transação", os exemplos 2.3.1 e 2.3.2,
a linha loyalty_until de "Limites de cada campo", RN01 e a RN19 item 5]
Requisitos:
- Ordem das checagens: 400 → 404 → 409.
- Toda a gravação dentro de prisma.$transaction (caixa, jogador, contrato, transação, saída da escalação).
- Cálculos importados de src/domain (nada de fórmula no service).
- Proteção contra compra concorrente do mesmo jogador.
- Testes do service que reproduzam o cenário do "Meia Lua": compra em 02/11/2026 10:15, venda em 05/11/2026 16:40
  → dias 117, multa 4,00, comissão 0,30, crédito 35,70, caixa 296,85 (injete o relógio como dependência).
Mostre o plano primeiro.
```

> 💡 **Relógio injetável:** em vez de chamar `new Date()` espalhado pelo código, crie um `ClockService` com `now()`. Nos testes, você troca por um relógio fixo. Isso permite testar "venda 116 dias depois" sem esperar 116 dias.

### ✅ Como conferir (refaça o cenário do enunciado)
- [ ] Clube novo (300) compra o Meia Lua MAL_CONDICIONADO (37,00) → taxa 1,85, `club_cash` 261,15, contrato `ATIVO`.
- [ ] `GET /clubs/1` → `squad_value` 37, `net_worth` 298,15, `contract.remaining_days` e `penalty_rate` corretos.
- [ ] Caixa 100 + jogador de 48,00 → 409 (custo 50,40 > 50).
- [ ] Vender jogador livre → 409. O mesmo clube recomprar quem vendeu → 409; outro clube → 200.
- [ ] Vender com fidelidade já vencida → contrato `ENCERRADO`, multa 0.
- [ ] `loyalty_until` sem `-03:00` → 400; no passado → 400; a mais de 1.095 dias → 400.
- [ ] **Conciliação:** 300 + soma de `cash_change` = caixa atual.

### 💾 Commits
- `feat(market): compra com taxa, limite de caixa e contrato de fidelidade`
- `feat(market): venda com multa, comissão progressiva e crédito no caixa`
- `feat(market): bloqueio de recompra pelo clube vendedor`

---

## Bloco 11 — Histórico de transações e exportação CSV

### 🎯 Objetivo
`GET /clubs/{id}/transactions` e `.../export`. Itens B18 e B19: **4 pontos**.

### 📖 Regras-chave

- Ordem: `criado_em` decrescente; empate → `id` decrescente.
- Filtros: `type` (`COMPRA`, `VENDA` ou `COMPRA,VENDA`, sem espaço e sem repetir) e `player_id` (jogador excluído ou inexistente → **404**).
- `summary` sobre as transações **filtradas**: `total_spent` (valor + taxa das COMPRAs), `total_received` (`cash_change` das VENDAs), `total_fees`, `total_penalties`, `total_profit`.
- **Histórico e CSV usam a MESMA consulta** (um método no service), para não duplicar filtro e ordem.

**CSV — cada detalhe é conferido pelo script:**
```text
data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa
2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70
2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85
```
- `Content-Type: text/csv`; UTF-8 **sem BOM**; cada linha termina em `\n`, **inclusive a última**.
- Separador `;`; vírgula decimal; 2 casas; negativo com `-`; `lucro` vazio quando nulo.
- Nome com `;` ou `"` → entre aspas, com as aspas internas duplicadas: `"Zé ""Foguete"" Lima"`.
- Erros continuam em **JSON**.

### ✅ Como conferir
- [ ] Baixe o CSV com `curl -o hist.csv ...` e abra num editor que mostre os caracteres invisíveis (no VS Code, o canto inferior direito mostra "LF" e "UTF-8").
- [ ] Cadastre um jogador chamado `Zé "Foguete" Lima`, compre e exporte.
- [ ] Edite o nome do jogador depois da compra → o histórico mantém o nome antigo.

### 💾 Commits
- `feat(market): histórico de transações com filtros e resumo`
- `feat(market): exportação do histórico em CSV`

---

## Bloco 12 — Liga: escalação, partidas e classificação

### 🎯 Objetivo
`PUT`/`GET /clubs/{id}/lineup`, `POST`/`GET /matches`, `GET /matches/{id}` e `GET /standings`. Itens B20 a B22: **4,5 pontos**.

### 📖 Escalação (RN19)

- `formation` ∈ {`3-1`, `2-2`, `2-1-1`, `1-2-1`}; `player_ids`: lista de **exatamente 5** inteiros positivos distintos → senão 400.
- Clube ou jogador inexistente → 404.
- Jogador fora do elenco, `DOENTE`, ou posições que não fecham a formação → 409.
  - Fechar a formação = exatamente 1 GOL; defesa (ZAG+LAT) = 1º número; meio (MEI) e ataque (ATA) conforme a tabela. Ex.: `2-1-1` → 2 ZAG/LAT, 1 MEI, 1 ATA.
- `PUT` **substitui tudo** numa transação: atualiza `clubes.formacao`, apaga as linhas antigas de `escalacoes` e insere as 5.
- `GET` → `{ club_id, formation, complete, players }`. Os jogadores na ordem do elenco, no formato do jogador. Sem escalação: `formation: null`, `complete: false`, `players: []`.
- Venda ou passagem para `DOENTE` remove a linha do titular, mas mantém a `formacao` → `complete: false`.

### 📖 Partida (RN20)

1. 400 (ids inválidos, iguais) → 404 (clube inexistente) → 409 (algum sem escalação completa).
2. Busca os titulares, chama `playMatch()` do domínio (Bloco 6) e grava a partida + 6 duelos **numa transação**.
3. 201 + `Location: /api/v1/matches/{id}`. Resposta como em 2.4.2.
4. Não muda caixa, escalação nem jogadores.

### 📖 Classificação (RN21)

- Todos os clubes, mesmo sem jogos. Vitória 3, empate 1.
- Ordem: pontos ↓ → saldo ↓ → gols marcados ↓ → nome (`compareNames` do domínio) → id.
- `position` de 1 a N, sem repetir. Calculada a cada consulta.
- `GET /matches?club_id=`: da mais recente para a mais antiga (empate → id maior primeiro), **sem** `duels`.

### ✅ Como conferir
- [ ] Recrie o exemplo completo Águias FC × Delta FC (cadastre os 10 jogadores com os atributos da tabela; para chegar aos valores, use atributos que deem exatamente aqueles números) → placar 1 × 2, `VISITANTE`.
- [ ] Venda um titular → `GET lineup` com `complete: false` → `POST /matches` → 409.
- [ ] A tabela de classificação com 6 clubes do enunciado bate na ordem.

### 💾 Commits
- `feat(league): escalação com validação de formação`
- `feat(league): partida calculada por duelos e gravada com os valores do momento`
- `feat(league): histórico de partidas e classificação`

---

## Bloco 13 — Revisão do backend contra o barema

### 🎯 Objetivo
Encontrar os erros **antes** do script da banca.

### 🛠️ Passo a passo

1. **Passe pela tabela B01–B22 do barema, item a item.** Para cada item, escreva (ou peça à IA) um teste **e2e** (com `supertest`, chamando a API de verdade contra um banco de teste) que faça exatamente o que o item descreve. Isso é o seu "script da banca caseiro".
2. **Revise o B2 (qualidade), critério a critério:**

| Critério | Pergunta para você responder | Como checar |
| --- | --- | --- |
| Camadas | Algum controller acessa `prisma` ou faz conta? | Busque `prisma.` dentro dos arquivos `*.controller.ts` |
| Regras de negócio | Cada fórmula está só em `src/domain`? | Busque `0.05`, `0.85`, `* 6`, `/ 86400000` |
| Validação e erros | Todo endpoint valida por DTO ou pipe? Toda recusa passa pelo filtro global? | Leia os controllers |
| Consistência | Compra, venda, partida, escalação e condição→DOENTE estão em `$transaction`? | Busque `$transaction` |
| Segurança | Nada de SQL concatenado? Senha só no `.env`? CORS por variável? `.env` fora do Git? | `git ls-files \| grep .env` |
| Código morto | Algum código comentado, função sem uso, nome em português? | Peça à IA: "liste código sem uso e comentado" |

3. **Peça uma revisão à IA "com olhos de avaliador":**
   ```text
   Você é avaliador(a) deste desafio. Aqui está o barema [cole B2 e B3].
   Revise o código do backend e liste cada ocorrência que perderia ponto, com arquivo e linha.
   Não corrija ainda.
   ```
   Depois decida, uma por uma, o que corrigir.

### ✅ Como saber que terminou
- [ ] Testes e2e cobrindo os itens B01–B22 passam.
- [ ] `npm test`, `npm run lint` e `npm run format:check` passam.
- [ ] A matriz de rastreabilidade (Anexo B) está toda preenchida no lado backend.

### 💾 Commits
- `test(backend): testes e2e do fluxo de jogadores, mercado e liga`
- `refactor(backend): remove acesso ao banco do controller de clubes` (exemplo)

---

# Fase 3 — Frontend

> **Regra de ouro do frontend:** a tela **nunca recalcula** o que a API devolve (valor de mercado, taxa, multa, placar…). Ela só **mostra**. A única conta permitida é valor + taxa = custo total.

## Bloco 14 — Fundação do frontend

### 🎯 Objetivo
Projeto React criado, com navegação, camada de API, componentes compartilhados e formatadores. Sem isso, cada tela vira cópia da outra e você perde o F2.

### 📖 Peças e por quê

| Peça | Para que | Critério |
| --- | --- | --- |
| `api/client.ts` | **Único lugar com `fetch`**. Monta a URL a partir de `VITE_API_URL` + `/api/v1`, envia JSON e, se `!response.ok`, lança um erro com o `message` da API | F2 "Acesso à API" |
| `api/players.ts`, `api/clubs.ts`… | Uma função por endpoint | F2 |
| `hooks/` (TanStack Query) | `usePlayers(filters)`, `useCreatePlayer()`… As *mutations* invalidam as *queries* para recarregar os dados sem dar refresh na página | F2 "Atualização" |
| `components/DataTable` | Tabela genérica (colunas por props) com **carregando / vazio / erro** embutidos | F2 "Componentes", F3 "Estados" |
| `components/FormField` | Rótulo + campo + mensagem de erro | F2 |
| `components/Feedback` (toast) | Mensagem de sucesso ou erro (o `message` da API) | F2, F3 |
| `components/ConfirmDialog` | Confirmação (excluir, vender…). Não use `window.confirm`: ele funciona, mas um diálogo próprio é mais elegante e testável | F03, F08 |
| `components/SubmitButton` | Fica desabilitado enquanto o envio está pendente | F3 "clique duplo" |
| `utils/format.ts` | `formatMoney(37) → "37,00"`; `formatDateTime(iso) → "02/11/2026 10:15"` no fuso `America/Sao_Paulo`; `toApiDateTime("2027-03-02T10:15") → "2027-03-02T10:15-03:00"` | F3 "Apresentação", F06 |
| Layout + menu | Jogadores, Clubes, Partidas, Classificação | — |

### 🤖 Prompt sugerido

```text
[CONTEXTO do frontend: React + Vite + TS, React Router (modo biblioteca), TanStack Query, React Hook Form + Zod, Tailwind]
TAREFA: fundação do frontend.
REGRAS: [cole a seção "Frontend" inteira do enunciado e o F2/F3 do barema]
Crie: cliente HTTP único que lança erro com o message da API; hooks de dados; componentes
DataTable (com loading/vazio/erro), FormField, Feedback, ConfirmDialog, SubmitButton (desabilitado durante o envio
e protegido contra clique duplo); formatadores de moeda pt-BR e de data no fuso America/Sao_Paulo;
layout com menu. Nenhum fetch dentro de componentes. Variável VITE_API_URL com .env.example.
Plano primeiro.
```

### 💾 Commits
- `chore(frontend): cria projeto Vite React TypeScript com Tailwind`
- `feat(frontend): cliente HTTP e hooks de dados com TanStack Query`
- `feat(frontend): componentes de tabela, formulário, feedback e confirmação`
- `feat(frontend): formatação de moeda e datas no horário de Brasília`

---

## Bloco 15 — Telas de jogadores

### 🎯 Objetivo
Itens F01 a F04 (**7 pontos**).

### 📖 O que a tela precisa ter

- **Tabela:** nome, posição, **overall**, agilidade, idade, condição, valor base, **valor de mercado**, clube (nome ou sigla; "Livre" se `club_id` for null). Como a API devolve só o `club_id`, carregue a lista de clubes e faça a correspondência (isso não é "recalcular regra").
- **Paginação** de 10, com navegação e o **total encontrado** (`meta.total_items`).
- **Busca + filtros** (posição, condição, só livres, clube, idade mín/máx, valor mín/máx) e **ordenação** (nome; valor ↑↓; idade ↑↓; posição). Filtros ficam no estado e viram query params; ao mudar um filtro, volte à página 1.
- "Só livres" + clube: **desabilite** um quando o outro estiver ativo (ou mostre o `message` da API).
- **Excluir** só nos livres, com confirmação; o jogador some da lista.
- **Cadastro** com os 7 indicadores. Depois de salvar, mostre o `overall` e o `base_value` **que a API devolveu**.
- **Edição** (nome, posição, agilidade, idade) e **alteração de condição**.
  - Pode bloquear na tela: DOENTE → APTO; mudar a posição de quem tem clube; diminuir a idade. Ou envie e mostre o `message`. Escolha um e seja consistente.
- **Compra** a partir do jogador livre (aqui ou no Bloco 16): escolher o clube + `datetime-local` → `toApiDateTime()` → resultado com valor, taxa, custo total, fidelidade e novo caixa.

**Validação nos formulários (F2):** nome 3–100; agilidade 1–100; idade 16–45; atributos e potencial 1–99; obrigatórios. Mensagem **junto ao campo**. Regras que cruzam campos (soma ≤ 480, potencial ≥ maior atributo) podem ficar só na API.

### ✅ Como conferir
- [ ] Cadastrar → aparece na lista, com overall e valores vindos da API, sem dar F5.
- [ ] Erro da API (ex.: 400) aparece com o texto da API.
- [ ] Clique duplo em "Salvar" → **um só** pedido (confira na aba Network do DevTools).

### 💾 Commits
- `feat(frontend): lista de jogadores com paginação, busca e filtros`
- `feat(frontend): cadastro e edição de jogador`
- `feat(frontend): alteração de condição e exclusão com confirmação`

---

## Bloco 16 — Clubes, página do clube, compra e venda

### 🎯 Objetivo
Itens F05 a F08 (**7 pontos**).

### 📖 O que a tela precisa ter

- **Lista de clubes:** nome, sigla, caixa, valor do elenco, patrimônio; ordenação por nome e por patrimônio (↓, pelo menos), **na ordem devolvida pela API** (passe o `sort` para a API, não reordene na tela). Formulário de criação (nome 3–60, sigla de 3 letras).
- **Página do clube** (`/clubs/:id`), com abas: **Elenco | Histórico | Escalação**.
  - Elenco: caixa, valor do elenco, patrimônio; tabela com valor de mercado e as colunas do contrato (fim da fidelidade, dias restantes, % de multa).
  - Botão **Vender** em cada jogador → confirmação → resultado com valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito e novo caixa.
- Depois da compra, a tabela de jogadores mostra o clube, o filtro por clube encontra o jogador e "só livres" deixa de mostrá-lo. Isso acontece sozinho se a mutation invalidar as queries certas.

### 💾 Commits
- `feat(frontend): lista e criação de clubes`
- `feat(frontend): página do clube com elenco e contratos`
- `feat(frontend): compra de jogador com resultado detalhado`
- `feat(frontend): venda de jogador com confirmação e resultado`

---

## Bloco 17 — Histórico na página do clube e Exportar CSV

### 🎯 Objetivo
Itens F09 a F11 (**6 pontos**).

- Tabela: data e hora (Brasília), tipo, jogador, valor, taxa ou comissão, multa, lucro, variação do caixa **com sinal** (`+35,70`, `-38,85`).
- Filtro de tipo (checkboxes COMPRA/VENDA → `type=COMPRA,VENDA`) e de jogador (opções = jogadores que aparecem no histórico).
- Abaixo, o `summary` **da API**, respeitando o filtro.
- **Exportar CSV:** a função da camada de API faz o `fetch` com os mesmos filtros, recebe um `blob` e o componente dispara o download (`URL.createObjectURL` + `<a download>`).
- Erro do filtro (ex.: jogador excluído → 404) → mostre o `message`.

### 💾 Commits
- `feat(frontend): histórico de transações com filtros e totais`
- `feat(frontend): exportação do histórico em CSV`

---

## Bloco 18 — Liga no frontend

### 🎯 Objetivo
Itens F12 a F14 (**7 pontos**).

- **Escalação** (aba da página do clube): escolher a formação → a tela gera as vagas (1 GOL + vagas por setor); cada vaga é um `select` com os jogadores do elenco **daquela posição e sem DOENTE**. Validar as 5 vagas preenchidas. Depois de salvar, mostrar a escalação **devolvida pela API**. Se `complete: false`, mostrar o aviso "o clube não pode jogar até completar a escalação".
- **Partidas:** selecionar mandante e visitante (diferentes) → "Jogar partida" (botão protegido contra clique duplo!) → placar + 6 duelos da API (atacante, defensor, atributos, valores, gol).
- **Histórico de partidas:** data e hora, mandante, placar, visitante; filtro por clube; ao clicar, abrir os duelos (`GET /matches/{id}`).
- **Classificação:** posição, clube, J, V, E, D, GM, GS, SG, Pts, na ordem da API.

### 💾 Commits
- `feat(frontend): escalação com formação e vagas por setor`
- `feat(frontend): tela de partida com placar e duelos`
- `feat(frontend): histórico de partidas e classificação`

---

## Bloco 19 — Polimento: feedback, estados, responsividade e testes

### Checklist F3 (usabilidade, 6 pontos)

**As 9 ações** (cadastrar, editar e mudar a condição do jogador; excluir; criar clube; comprar; vender; escalar; jogar partida). Em cada uma:
- [ ] mostra uma mensagem de sucesso;
- [ ] numa recusa, mostra o `message` **da API** (não uma mensagem genérica);
- [ ] o clique duplo gera **um só** pedido.

**As 6 telas de lista** (jogadores, clubes, elenco, histórico, partidas, classificação). Em cada uma:
- [ ] carregando: no DevTools, aba Network, use "Slow 3G";
- [ ] vazio: com o banco recém-recriado;
- [ ] erro: com o backend desligado.

**Apresentação** — moeda `1.234,56` e datas em Brasília nas telas de jogadores, clubes, clube/histórico, resultado da compra, resultado da venda e partidas.

### Diferenciais do frontend (F5)

- **Responsividade (1 ponto):** DevTools → modo dispositivo → 375 px. As páginas de jogadores e do clube (com o histórico) **não podem ter rolagem horizontal da página**; as tabelas rolam dentro de um `div` com `overflow-x: auto`. Todas as ações continuam acessíveis.
- **Testes (1 ponto):** `npm test` com Vitest em modo `run` (sem watch). Ao menos um teste de componente, ex.: "DataTable mostra 'Nenhum jogador encontrado' quando a lista é vazia" e "formatMoney(37) retorna 37,00".
- **Lint (0,5):** `npm run lint` e `npm run format:check`.

### 💾 Commits
- `feat(frontend): estados de carregamento, vazio e erro nas listas`
- `style(frontend): layout responsivo para 375px`
- `test(frontend): testes de componentes e formatadores`
- `chore(frontend): ESLint e Prettier`

---

# Fase 4 — Entrega

## Bloco 20 — Docker Compose completo

### 🎯 Objetivo
Diferencial B5 (0,5): **um único comando** sobe banco, API e interface.

- `backend/Dockerfile`: instala com `npm ci`, gera o Prisma, faz o build; ao iniciar, roda `prisma migrate deploy` e sobe a API.
- `frontend/Dockerfile`: imagem `node:22-alpine`, build do Vite e `npm run preview -- --host 0.0.0.0 --port 5173` para servir. Lembre que o `VITE_API_URL` é embutido **no build**.
  > Por que não `nginx`? O enunciado diz que o frontend "é executado com Node.js 20 LTS ou 22 LTS". Servir pelo Node evita qualquer discussão sobre tecnologia fora da lista.
- `docker-compose.yml` com `db`, `backend` e `frontend`, e `depends_on` com `healthcheck` no banco.
- Teste: `docker compose down -v && docker compose up --build` → abra a lista de jogadores.

> Use só **imagens públicas oficiais** (`node:22-alpine`, `postgres:16`). Imagem sua no Docker Hub não é aceita.

### 💾 Commit
- `chore: docker compose com banco, API e interface`

---

## Bloco 21 — README final

O README da raiz precisa ter **cada item numa seção própria** (B4 e F4 conferem):

1. **Pré-requisitos** com versões: Node.js 22, npm 10, Docker com Compose v2.
2. **Banco: criar e recriar do zero**, com comandos copiáveis.
3. **Instalar e executar**, um comando por linha, dizendo a pasta. Informe: **origem da API** (`http://localhost:3000`, sem `/api/v1`) e **URL do frontend** (`http://localhost:5173`). Diga que os `package-lock.json` estão versionados.
4. **Variáveis de ambiente** (tabela), com o `.env.example` em `backend/` e em `frontend/`. Toda variável usada no código precisa estar listada.
5. **Estrutura de pastas** + **bibliotecas e o motivo de cada uma**. Toda biblioteca listada precisa estar no `package.json`.
6. **Decisões e premissas** — ex.: cálculo do valor de mercado em memória na listagem; coluna `nome_normalizado`; como a tela trata DOENTE → APTO; relógio injetável; formato de exibição das datas.
7. **Funcionalidades não implementadas** (ou "Nenhuma").
8. **Uso de inteligência artificial** — ferramentas, **onde** (arquivos ou funcionalidades), **como e por quê**, e **o que você aceitou, alterou ou descartou**. Use o seu diário (Anexo C). Seja honesta e específica:
   > "Usei o Claude Code para gerar o código do backend e do frontend, bloco a bloco. Eu escrevia o plano e as regras do enunciado no prompt, revisava o plano, rodava os testes e conferia os resultados com as tabelas do enunciado. Descartei a primeira versão do cálculo de comissão, que arredondava cada faixa separadamente (a regra manda arredondar uma vez só, no final). Alterei a listagem para calcular o valor de mercado em memória…"

Mais: comandos dos **diferenciais** (testes, lint, format:check, Docker, URL do Swagger).

**Modelo do bloco de execução** (adapte; a banca copia literalmente):

```text
# Banco de dados (na raiz do repositório)
docker compose up -d db

# Backend (na pasta backend)
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run start:dev
# API em http://localhost:3000 (a banca acrescenta /api/v1)

# Frontend (em outro terminal, a partir da raiz)
cd frontend
cp .env.example .env
npm ci
npm run dev
# Interface em http://localhost:5173

# Recriar o banco do zero (na pasta backend)
npx prisma migrate reset --force --skip-seed
```

> ⚠️ A banca **só** copia o `.env.example` para `.env` se o README mandar. Os valores do `.env.example` precisam funcionar como estão.

### 💾 Commit
- `docs: README com execução, decisões e uso de IA`

---

## Bloco 22 — Ensaio em máquina limpa

**Este bloco evita a nota zero.** Simule a banca:

1. Faça o push de tudo.
2. Num ambiente **limpo** (ideal: WSL com Ubuntu 24.04; alternativa: outra pasta, sem `node_modules` nem `.env`, e com `docker compose down -v` antes):
   ```bash
   git clone https://github.com/SEU_USUARIO/mercado-de-jogadores.git
   ```
3. **Siga o README literalmente**, copiando e colando cada comando, sem "consertar" nada de cabeça. Se precisou fazer algo que não está escrito, o README está errado: corrija e repita.
4. Cronometre: tudo deve subir em **menos de 30 minutos**.
5. Com tudo no ar, percorra o fluxo completo pela tela: cadastrar jogadores → criar clubes → comprar → vender → histórico → CSV → escalar → partida → classificação.
6. Rode os comandos dos diferenciais (testes, lint, format:check, Docker, Swagger).

---

## Bloco 23 — Entrega

1. Confirme o último commit no GitHub e copie o **hash completo**: `git rev-parse HEAD` (40 caracteres).
2. Confira se o repositório está **público** (abra o link numa janela anônima). Ele precisa estar público às 12h de 26/10 e continuar assim, **sem reescrever histórico**, até o resultado.
3. Envie o e-mail **do endereço em que você recebe as mensagens do RH**:

```text
Para: igor.conde@sistemafiepe.org.br
Cc: rachel.santos@sistemafiepe.org.br
Assunto: SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK)

Nome completo: [seu nome completo]
Repositório: https://github.com/SEU_USUARIO/mercado-de-jogadores
Commit final: [hash de 40 caracteres]
```

4. **Sem anexos.** Se mandar de novo, vale o último e-mail recebido no prazo.
5. **Depois do envio, não mexa mais** (ou, se mexer, saiba que só o hash informado conta).

---

## Bloco 24 — Preparação para a entrevista

São chamados os 10 primeiros aprovados. Como o uso de IA "pode ser questionado na entrevista", você precisa **dominar o porquê** de tudo.

### Treine responder em voz alta
1. Me explique a arquitetura do seu backend. (controller → service → domain/Prisma; por que cada camada)
2. Como você calculou o valor de mercado? Faça um exemplo. (RN05, passo a passo)
3. Por que você usou Decimal? Mostre um caso em que `number` erraria.
4. O que acontece no banco quando um clube compra um jogador? E se der erro no meio? (transação, rollback)
5. Como você evitou que dois clubes comprem o mesmo jogador ao mesmo tempo?
6. Como funciona a unicidade do nome do clube? (normalização + UNIQUE)
7. Por que 400, 404 ou 409 neste caso?
8. Como o frontend sabe que precisa atualizar a lista depois da compra? (invalidação de queries)
9. Como você evitou o clique duplo?
10. Onde e como você usou IA? Dê um exemplo de algo que a IA errou e você corrigiu.
11. O que você faria diferente com mais tempo? (ex.: mais testes e2e, cálculo em SQL para escalar, autenticação)
12. Qual foi a parte mais difícil?

### Exercício de domínio
Abra 5 arquivos aleatórios do seu projeto e explique cada um em voz alta, em 1 minuto. Onde travar, peça à IA para te explicar e repita.

---

# Anexo A — As pegadinhas do enunciado (checklist)

Use como revisão final. Cada linha já derrubou candidatos em desafios desse tipo.

**Formato e validação**
- [ ] `"15"` (texto) num campo inteiro → 400; `50.0` → aceito como 50; `50.5` → 400.
- [ ] Valores de lista são *case-sensitive*: `"ata"`, `"TRUE"` → 400.
- [ ] Campo extra ou com outro nome → **ignorado** (não é erro); mas, se faltar o obrigatório → 400.
- [ ] Corpo `[]`, `"x"`, `10` → 400. Corpo enviado em GET, DELETE ou venda → ignorado.
- [ ] Id na URL `abc`, `0`, `-1`, `1.5`, `01` ou > 2147483647 → **404**.
- [ ] Query param vazio (`position=`) → 400; desconhecido → ignorado.
- [ ] Nome com tab ou quebra de linha → 400; espaços normalizados antes de validar.
- [ ] Erros sempre `{message}` em JSON, inclusive na rota do CSV.

**Cálculos**
- [ ] Dinheiro arredonda **uma vez, no final**, metade **para longe do zero**.
- [ ] Taxa só se o valor for **> 30,00** (não ≥).
- [ ] Limite de 50% **sem arredondar** a metade do caixa; igual ao limite é aceito.
- [ ] Agilidade só mexe no desconto quando **não** está APTO.
- [ ] Teto de −40% e piso de 1,00 no valor de mercado; piso de 1,00 no valor base.
- [ ] Valor base usa a idade **do cadastro** e nunca muda; o overall é recalculado com a posição atual.
- [ ] Dias restantes: **teto**, e 0 se já passou.
- [ ] Multa com teto de **10,00**.
- [ ] Comissão só com lucro **> 0**; progressiva; arredonda no final.
- [ ] MAL_CONDICIONADO na partida: × 0,85, metade para cima; empate no duelo **não** é gol.

**Ordenação**
- [ ] Ordem alfabética: minúsculas + sem acento + ordem Unicode (espaço < hífen < letras), **não** `localeCompare`; empate → id.
- [ ] Posições: GOL, ZAG, LAT, MEI, ATA (não alfabética).
- [ ] Histórico: mais recente primeiro; empate → id decrescente.
- [ ] Classificação: pontos → saldo → gols marcados → nome.

**Estado e consistência**
- [ ] Jogador excluído = 404 em **todos** os lugares, inclusive no filtro `player_id` do histórico.
- [ ] O clube que vendeu não recompra o mesmo jogador; outro clube pode.
- [ ] Venda e DOENTE tiram o titular da escalação (`complete: false`), mas a formação continua salva.
- [ ] Transação e duelo guardam nome e valores do momento.
- [ ] 300 + Σ `cash_change` = caixa atual.

**Respostas**
- [ ] `POST /players`, `/clubs` e `/matches` → 201 + `Location`.
- [ ] `DELETE` → 204 **sem corpo**.
- [ ] Datas de saída `AAAA-MM-DDTHH:MM:SS-03:00`.
- [ ] Listas vazias → 200 com `[]`.
- [ ] CSV: `text/csv`, sem BOM, LF até na última linha, vírgula decimal, aspas duplicadas.

**Entrega**
- [ ] `package-lock.json` versionado nos dois projetos.
- [ ] `.env` fora do Git; `.env.example` dentro.
- [ ] `migrate reset` **não** popula o banco.
- [ ] CORS só para a origem do frontend (nunca `*`).

---

# Anexo B — Matriz de rastreabilidade (modelo)

Copie para uma planilha. Preencha conforme avança. Na entrevista, isso mostra organização.

| Regra | Resumo | Onde no código | Teste automatizado | Conferido à mão | Item do barema |
| --- | --- | --- | --- | --- | --- |
| V1 | Corpo deve ser objeto JSON | `common/filters/...` | `e2e/validation` | ☐ | B01, B02 |
| V4 | Normalização de nomes | `common/text/normalize-name.ts` | `normalize-name.spec.ts` | ☐ | B01 |
| RN05 | Valor de mercado | `domain/market-value.ts` | `market-value.spec.ts` (10 casos) | ☐ | B05 |
| RN06 | Overall e valor base | `domain/overall.ts`, `domain/base-value.ts` | 5 + 9 casos | ☐ | B06 |
| RN13 | Taxa e limite de caixa | `domain/purchase.ts` | 5 casos | ☐ | B10 |
| RN15 | Multa | `domain/sale.ts` | 7 casos | ☐ | B14 |
| RN16 | Comissão e crédito | `domain/sale.ts` | 6 + 5 casos | ☐ | B15 |
| RN20 | Partida | `domain/match-engine.ts` | exemplo Águias × Delta | ☐ | B21 |
| … | … | … | … | ☐ | … |

---

# Anexo C — Diário de uso de IA (modelo)

Mantenha num arquivo fora do repositório e atualize a cada bloco. No fim, ele vira a seção "Uso de inteligência artificial" do README.

| Data | Bloco | Ferramenta | O que pedi | O que aceitei | O que alterei ou descartei e por quê |
| --- | --- | --- | --- | --- | --- |
| 15/10 | 6 — Domínio | Claude Code | Funções de cálculo + testes com as tabelas | Estrutura das funções e os testes | A comissão arredondava cada faixa separadamente; pedi para arredondar só no final (RN16) |
| | | | | | |

---

> **Lembrete final:** você não precisa saber escrever cada linha de memória. Precisa saber **o que cada parte faz, por que está ali e como você verificou que está certa**. Esse é o trabalho de um(a) dev que usa IA bem. Boa sorte! 🚀
