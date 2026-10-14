# Mercado de Jogadores — desafio SENAI/PE (Desenvolvedor I Fullstack)

API REST + interface web de um mercado de jogadores de uma liga fictícia.
Enunciado, barema e glossário: https://github.com/isi-tics/desafio-isi-dev-1 (`README.md`, `barema.md`, `glossario.md`).
Errata publicada a partir de 16/10/2026 prevalece sobre o enunciado.

## Como trabalhamos

- Claude escreve o código; a Thainá (estagiária) decide, revisa, testa e precisa explicar tudo na entrevista.
  Explique cada decisão em português simples: o que faz, por que está ali, qual regra ou item do barema atende.
- Siga o plano em `docs/GUIA-DO-DESAFIO.md` (24 blocos). Em cada bloco: plano de arquivos primeiro, dúvidas do
  enunciado, implementação só depois da aprovação, com as tabelas de exemplo do enunciado viradas testes.
- Ao concluir uma regra, atualize `docs/MATRIZ-RASTREABILIDADE.md` (onde no código, teste, status).
- Registre cada bloco em `docs/DIARIO-IA.md` (o que foi pedido, aceito, alterado ou descartado): vira a seção
  "Uso de inteligência artificial" do README.
- `docs/guia-desafio.html` e `docs/matriz-rastreabilidade.html` são páginas publicadas como artifacts. Ao alterar
  uma delas, republique no mesmo link (passando a `url`) e faça commit:
  - guia: https://claude.ai/code/artifact/a9e23023-a2e4-479c-9252-446bf8a78f20
  - matriz: https://claude.ai/code/artifact/b5851511-70fe-404d-87d8-27b2f8a9b8eb
- Mockup no Figma (referência de fluxo, não de pixel): https://www.figma.com/design/oevjrS0eaqL3VHSvKYB8GS/Passe?node-id=2-2

## Stack (fechada; tecnologia fora da lista elimina)

- Node.js 22 LTS em tudo (Node 24 é proibido): `"engines": { "node": "22.x" }` e `.nvmrc`; Docker com `node:22-alpine`.
- Backend: NestJS + TypeScript + Prisma + PostgreSQL 16 (imagem pública `postgres:16` no Docker Compose da raiz).
- Frontend: React + Vite (template `react-ts`), React Router em modo biblioteca, TanStack Query,
  React Hook Form + Zod, Tailwind. No Docker roda com `vite preview` em `node:22-alpine`, sem nginx.
- Testes: Jest no backend, Vitest + Testing Library no frontend, ambos terminando sozinhos (sem watch).
- ESLint + Prettier nos dois; `format:check` só verifica.
- Dinheiro sempre `Decimal` (decimal.js / `Prisma.Decimal`, colunas `DECIMAL`), arredondado uma única vez no fim
  de cada cálculo, metade para longe do zero (`ROUND_HALF_UP`).

## Convenções de código

- Identificadores em inglês: `camelCase` para funções e variáveis, `PascalCase` para classes, tipos e componentes.
- Banco em português, com os nomes exatos de "3. Estrutura de tabelas": modelos em inglês mapeados por `@@map`/`@map`.
- Campos da API e query params em `snake_case`, como no enunciado; o mapeamento para camelCase fica nos DTOs e mappers.
- Textos de tela e mensagens de erro em português.
- Código entregue limpo: sem trechos comentados, sem arquivo, função ou variável sem uso.

## Arquitetura

- Backend: controller (só HTTP: rota, DTO, status, cabeçalhos) → service (regras e ordem 400 → 404 → 409) → Prisma.
  Todo cálculo é função pura em `backend/src/domain`, um único lugar por fórmula; o "agora" entra como parâmetro
  (relógio injetável). Gravações de compra, venda, partida, escalação e condição→DOENTE ficam em `prisma.$transaction`.
- Frontend: todo acesso à API em `frontend/src/api` + hooks do TanStack Query em `src/hooks`; componentes só usam hooks.
  A tela mostra o que a API devolve e nunca recalcula regra (a única conta permitida é valor + taxa).

## Git

- Commits em português, Conventional Commits, pequenos, uma ideia por commit, com escopo e descrição:
  `feat(players): cadastro com cálculo do valor base`. Mensagens só com palavras genéricas
  ("fix", "ajustes", "update", "wip", "final"…) contam contra no barema.
- Push todo dia: o barema exige ≥ 10 commits que alteram `backend/` e ≥ 10 que alteram `frontend/`,
  com push em ≥ 3 dias diferentes. Histórico já enviado nunca é reescrito (nada de `push --force`).
- `package-lock.json` e `.env.example` versionados; `.env` fora do Git.

## Prazos

- Dúvidas ao avaliador: até 15/10/2026 23h59 (issue pública ou e-mail).
- Entrega: até 23/10/2026 20h (meta interna: 17h). Repositório público às 12h de 26/10/2026.
