# Roteiro de testes pela tela

Simula o roteiro da banca (barema, seção 5), na ordem dos itens F01 a F14, mais os critérios F3 e F5.
Comece com o banco **recriado do zero** (`npx prisma migrate reset --force`, na pasta `backend/`), a API e a
interface no ar, no Chrome, com a janela em 1366 × 768. Deixe o DevTools aberto na aba **Network**.

Marque cada linha quando o resultado for o esperado.

---

## 0. Telas vazias e erro (F3, "Estados das telas")

| # | Faça | Esperado |
| --- | --- | --- |
| 0.1 | Abra Jogadores, Clubes, Partidas e Classificação com o banco vazio | "Nenhum jogador encontrado.", "Nenhum clube cadastrado.", "Nenhuma partida jogada." |
| 0.2 | Network → "Slow 3G" e recarregue Jogadores | "Carregando…" na tabela antes dos dados |
| 0.3 | Pare a API (`Ctrl+C`) e recarregue Jogadores | Mensagem de erro na tabela ("Não foi possível conectar à API…"). Depois suba a API de novo |

## 1. Jogadores (F01 a F04)

| # | Faça | Esperado |
| --- | --- | --- |
| 1.1 | Cadastrar jogador com nome `Al` e idade `15` → Salvar | Mensagens **junto aos campos** ("Nome: de 3 a 100 caracteres.", "Idade: de 16 a 45."); nenhum POST na aba Network |
| 1.2 | Cadastrar **Meia Lua**: MEI, agilidade 85, idade 25, velocidade 70, finalização 68, passe 82, drible 79, defesa 55, físico 64, potencial 86. Clique **duas vezes** em Salvar | Aviso "Jogador cadastrado."; a janela mostra **overall 75**, **valor base 40,00**, valor de mercado 40,00; na Network, **um só** `POST /players` |
| 1.3 | Feche a janela | Meia Lua aparece na tabela, com "Livre" no clube, sem dar F5 |
| 1.4 | Cadastre mais jogadores até passar de 10 (para escalar depois, faça para cada clube: 1 GOL, 2 ZAG ou LAT, 1 MEI, 1 ATA) | Tabela com 10 por página, "Página 1 de 2", total "N jogadores encontrados"; "Próxima" leva à página 2 |
| 1.5 | Condição do Meia Lua → Mal condicionado → Salvar | Aviso de sucesso; valor de mercado passa a **37,00** |
| 1.6 | Condição de um jogador → Doente → Salvar; depois Doente → Apto | Na segunda, aviso vermelho com o `message` da API (409) |
| 1.7 | Editar um jogador livre: mude nome, posição, agilidade e idade (para mais) → Salvar | Aviso de sucesso; a tabela mostra os novos dados e o overall recalculado pela nova posição (a agilidade não entra no overall); o valor base **não** muda |
| 1.8 | Editar e diminuir a idade → Salvar | Aviso vermelho com o `message` da API (409) |
| 1.9 | Buscar `lua` → Filtrar | Só o Meia Lua |
| 1.10 | Combine filtros: posição, condição, idade mín./máx., valor mín./máx. → Filtrar | Só os jogadores que atendem a todos; volta para a página 1 |
| 1.11 | Ordene por nome, valor (↑ e ↓), idade (↑ e ↓) e posição | A ordem muda conforme a API; posição vai de GOL a ATA |
| 1.12 | Marque "Só livres" | O filtro de Clube fica desabilitado (e, com um clube escolhido, "Só livres" fica desabilitado) |
| 1.13 | Excluir um jogador livre → Cancelar; depois Excluir → confirmar (clique duplo) | Cancelar não faz nada; confirmar: aviso "Jogador excluído.", ele sai da lista, **um só** `DELETE` |
| 1.14 | Busque um jogador com clube (depois da compra, item 3) | Não aparece o botão Excluir nele |

## 2. Clubes (F05)

| # | Faça | Esperado |
| --- | --- | --- |
| 2.1 | Criar clube com nome `FC` e sigla `AG` | Mensagens junto aos campos; nenhum POST |
| 2.2 | Criar **Águias FC** / `AGU` (clique duplo em Criar) | Aviso de sucesso; aparece com caixa **300,00**, valor do elenco 0,00, patrimônio 300,00; **um só** POST |
| 2.3 | Criar **Delta FC** / `DEL` e **Gama SC** / `GAM` | Lista em ordem de nome |
| 2.4 | Criar `águias fc` / `AGU` de novo | Aviso vermelho com o `message` da API (409) |

## 3. Compra e venda (F06 a F08)

| # | Faça | Esperado |
| --- | --- | --- |
| 3.1 | Em Jogadores, **Comprar** no Meia Lua: clube Águias FC, fim da fidelidade daqui a 4 meses → Confirmar compra (clique duplo) | Resultado com valor 37,00, taxa 1,85, **custo total 38,85**, fim da fidelidade (dd/mm/aaaa hh:mm) e novo caixa **261,15**; na Network, **um só** `POST /players/{id}/buy` com `loyalty_until` terminando em **`-03:00`** |
| 3.2 | Feche e confira a tabela | O Meia Lua mostra "Águias FC (AGU)"; o filtro por Águias FC o encontra; "Só livres" não o mostra |
| 3.3 | Compre outros jogadores para Águias FC e Delta FC (5 cada, para escalar) | Cada compra mostra o resultado |
| 3.4 | Tente uma compra acima de 50% do caixa (um jogador caro num clube com pouco caixa) | Aviso vermelho com o `message` da API (409) |
| 3.5 | Clubes → ordenar por "Patrimônio (maior primeiro)" | Ordem pelo patrimônio, como devolvido pela API |
| 3.6 | Clique em **Águias FC** | Caixa, valor do elenco e patrimônio; aba Elenco com os jogadores (GOL → ATA), valor de mercado, valor de compra, fim da fidelidade, dias restantes e % de multa |
| 3.7 | **Vender** um jogador → Cancelar; depois Vender → confirmar (clique duplo) | Resultado com valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito e novo caixa; **um só** `POST /players/{id}/sell`; o jogador sai do elenco e o caixa muda |

## 4. Histórico (F09 a F11)

| # | Faça | Esperado |
| --- | --- | --- |
| 4.1 | Página do Águias FC → aba Histórico | Data e hora em Brasília, tipo, jogador, valor, taxa ou comissão, multa, lucro e variação do caixa **com sinal** (`-38,85`, `+35,70`); mais recente primeiro |
| 4.2 | Abaixo da tabela | Totais do `summary`: total pago, total recebido, taxas e comissões, multas e lucro |
| 4.3 | Marque só "Venda"; depois "Compra" e "Venda" | A tabela e os **totais** mudam com o filtro; na Network, `type=VENDA` e depois `type=COMPRA%2CVENDA` |
| 4.4 | Filtre por um jogador | Só as transações dele; totais filtrados |
| 4.5 | **Exportar CSV** (com um filtro ativo) | Baixa `historico-AGU.csv`; na Network, o export leva os mesmos filtros |
| 4.6 | Exclua (em Jogadores) um jogador que já foi vendido pelo Águias FC; volte ao histórico e filtre por ele | Mensagem de erro com o `message` da API (404) no lugar da tabela |

## 5. Liga (F12 a F14)

| # | Faça | Esperado |
| --- | --- | --- |
| 5.1 | Página do Águias FC → aba Escalação | Aviso "Escalação incompleta: o clube não pode jogar…" |
| 5.2 | Escolha a formação `2-1-1` | Aparecem 5 vagas: Goleiro, Defesa 1 e 2, Meio 1, Ataque 1; cada uma só com jogadores do elenco daquela posição e sem DOENTE |
| 5.3 | Salvar com uma vaga vazia | Mensagem junto à vaga; nenhum PUT |
| 5.4 | Preencha as 5 vagas → Salvar escalação (clique duplo) | Aviso de sucesso; "Escalação atual · 2-1-1" com os 5 titulares devolvidos pela API; o aviso de incompleta some; **um só** PUT |
| 5.5 | Partidas → Águias FC × Gama SC (sem escalação) → Jogar partida | Aviso vermelho com o `message` da API (409) |
| 5.6 | Escale o Delta FC; Partidas → Águias FC × Delta FC → Jogar partida (clique duplo) | Placar e os **6 duelos** (atacante, defensor, atributos, valores e gol); **um só** `POST /matches` |
| 5.7 | Histórico de partidas | Data e hora, mandante, placar, visitante; mais recente primeiro |
| 5.8 | Filtre por clube; clique numa partida | Só as partidas do clube; a janela abre com os 6 duelos |
| 5.9 | Classificação | Posição, clube, J, V, E, D, GM, GS, SG e Pts, na ordem da API; Gama SC aparece com 0 jogos |
| 5.10 | Venda um titular do Águias FC; volte à aba Escalação | Formação mantida, 4 titulares e o aviso de incompleta |

## 6. Celular, 375 px (F5)

| # | Faça | Esperado |
| --- | --- | --- |
| 6.1 | DevTools → modo dispositivo → largura 375 | Jogadores e página do clube (com o Histórico) **sem rolagem horizontal da página**; as tabelas rolam dentro do próprio quadro |
| 6.2 | Nessa largura, abra Cadastrar, Comprar, Vender e o Histórico | Todos os botões e campos acessíveis |

## 7. Comandos dos diferenciais

```bash
# Na pasta backend
npm test
npm run test:e2e
npm run lint
npm run format:check

# Na pasta frontend
npm test
npm run lint
npm run format:check
```

Todos precisam terminar sozinhos e sem erros. Com a API no ar, o Swagger abre em `http://localhost:3000/api/docs`.
