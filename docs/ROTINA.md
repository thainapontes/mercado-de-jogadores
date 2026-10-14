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
- A partir do Bloco 4, suba o banco: `docker compose up -d db` (na raiz do projeto).
- Para revisar o código no editor, em outro terminal: `code .`

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

- **Porta 5173 ocupada no PC do trabalho:** o projeto `mk-anomaly-detection-service` usa a mesma porta do nosso
  frontend. Antes de rodar o desafio, pare os containers dele (`docker compose stop`, na pasta daquele projeto).
- **`node -v` mostra outra versão:** rode `nvm use` dentro da pasta do projeto.
- **`docker` pede `sudo` no PC de casa:** faltou sair e entrar de novo na sessão depois do passo 3.
