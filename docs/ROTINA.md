# Rotina de trabalho

Dois computadores: o **PC do trabalho** (Windows + WSL Ubuntu) e o **PC de casa** (Ubuntu).
O ponto de encontro entre eles é o **GitHub**: tudo que não foi enviado com `git push` não existe no outro PC.

---

## Todo dia, em qualquer PC

### Ao começar

```bash
cd ~/projetos/mercado-de-jogadores
git pull                  # traz o que foi feito no outro PC
nvm use                   # garante o Node 22 (lê o .nvmrc)
claude                    # abre o Claude Code; diga em que bloco paramos
```

- Se o `git pull` trouxe mudança no `package-lock.json`, rode `npm ci` dentro de `backend/` ou `frontend/`.
- Suba o banco: `docker compose up -d db` (na raiz do projeto).
- Se o `git pull` trouxe uma pasta nova em `backend/prisma/migrations/`, aplique no seu banco: `npx prisma migrate dev`
  (na pasta `backend/`).
- Para revisar o código no editor, em outro terminal: `code .`
- Testes do backend (na pasta `backend/`): `npm test` (unitários, sem banco) e `npm run test:e2e` (precisa do banco no
  ar). O e2e usa um banco separado, `passe_test`, no mesmo container: ele é criado e recebe as migrations sozinho, e
  cada teste começa com as tabelas vazias. Os dados do banco `passe` nunca são apagados pelos testes.

- Frontend (em outro terminal, na pasta `frontend/`): `npm run dev` → `http://localhost:5173`. A API precisa estar no
  ar (`npm run start:dev` na pasta `backend/`). Testes do frontend: `npm test` (Vitest, termina sozinho);
  `npm run lint` e `npm run format:check`.
- Tudo pelo Docker, sem npm (banco, API e interface): `docker compose up -d --build` na raiz. Usa as mesmas portas
  (5432, 3000 e 5173), então não rode junto com o `npm run start:dev` e o `npm run dev`.
- Teste manual pela tela, na ordem do roteiro da banca: `docs/ROTEIRO-TESTES-TELA.md`. Ele começa com
  `npx prisma migrate reset --force`, que **apaga todos os dados** do banco `passe`.

### Ao parar

```bash
git status                # confere se ficou algo sem commit
git push                  # SEMPRE: o barema conta os dias com push
```

Os commits são seus: o Claude deixa as mudanças prontas e sugere a mensagem.

> ⚠️ Nunca use `git push --force`. Se o `git push` ou o `git pull` reclamar de histórico divergente
> (esqueceu o push num PC e trabalhou no outro), pare e peça ajuda ao Claude antes de qualquer outro comando.

---

## Preparação do PC de casa (uma vez só)

### 1. Git com o e-mail noreply

```bash
git config --global user.name "Thainá Pontes"
git config --global user.email "178962557+thainapontes@users.noreply.github.com"
```

Confira com `git config --global user.email`. Sem isso, os commits saem com o e-mail pessoal, e o enunciado pede o noreply.

### 2. Node.js 22 (pelo nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

Feche e abra o terminal, depois:

```bash
nvm install 22
nvm alias default 22
node -v                   # tem que mostrar v22.x (Node 24 é proibido)
```

### 3. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Saia da sessão e entre de novo (ou reinicie), para o Docker funcionar sem `sudo`. Confira:

```bash
docker compose version
docker run --rm hello-world
```

### 4. GitHub CLI e o repositório

```bash
sudo apt install gh
gh auth login             # escolha GitHub.com, HTTPS, login pelo navegador
gh repo clone thainapontes/mercado-de-jogadores ~/projetos/mercado-de-jogadores
```

### 5. Arquivos que não vão pelo Git

O `.env` fica fora do Git de propósito. Quando `backend/` e `frontend/` existirem, em cada um:

```bash
cp .env.example .env
npm ci
```

Quando o `.env.example` ganhar uma variável nova, copie a linha para o `.env` dos dois PCs. Ex.: desde o Bloco 5,
o backend não sobe sem `CORS_ORIGIN` (a origem do frontend, `http://localhost:5173`).

O `npm ci` do backend também gera o cliente do Prisma (script `postinstall`). Depois, com o banco no ar
(`docker compose up -d db`, na raiz), crie as tabelas, ainda dentro de `backend/`:

```bash
npx prisma migrate deploy
```

Os dados do banco também não viajam: cada PC tem o seu banco, e as migrations criam as tabelas do zero.

### 6. VS Code e extensões

No Ubuntu nativo não há a etapa do WSL: instale direto pelo terminal.

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension humao.rest-client
```

### 7. Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

O `CLAUDE.md` vem junto com o repositório, então o contexto do projeto já está lá.

---

## Problemas conhecidos

- **Porta 5432 ocupada (`address already in use` no `docker compose up`):** há um PostgreSQL instalado direto no
  sistema. Pare o serviço com `sudo systemctl stop postgresql` (e `sudo systemctl disable postgresql` para ele não
  voltar ao ligar o PC). Aconteceu em 19/10.
- **Porta 5173 ocupada no PC do trabalho:** o projeto `mk-anomaly-detection-service` usa a mesma porta do nosso
  frontend. Antes de rodar o desafio, pare os containers dele (`docker compose stop`, na pasta daquele projeto).
- **`node -v` mostra outra versão:** rode `nvm use` dentro da pasta do projeto.
- **`docker` pede `sudo` no PC de casa:** faltou sair e entrar de novo na sessão depois do passo 3.
- **`npm` do Windows dentro do WSL (PC do trabalho):** se `which npm` mostrar `/mnt/c/Program Files/nodejs/npm`,
  o WSL está usando o npm do Windows, e os comandos falham ("caminhos UNC não são suportados"). Em 15/10 instalamos
  o nvm no WSL (`~/.nvm`), com o Node 22 como padrão; num terminal novo, `which npm` precisa mostrar `~/.nvm/...`.
  Se não mostrar, rode `nvm use`.
- **`prisma migrate reset` recusado quando a IA pede:** o Prisma 7 exige a confirmação de uma pessoa. Rode você mesma
  (na pasta `backend/`): `npx prisma migrate reset --force`.
