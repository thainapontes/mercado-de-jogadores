# Matriz de rastreabilidade — Desafio SENAI/PE

> 🌐 **Versão interativa (página web):** https://claude.ai/code/artifact/b5851511-70fe-404d-87d8-27b2f8a9b8eb
> Arquivo-fonte da página: [matriz-rastreabilidade.html](matriz-rastreabilidade.html). Na página, o botão “Copiar como Markdown” gera a tabela preenchida para colar aqui.

Uma linha por regra do enunciado. Vá preenchendo as colunas **Onde no código**, **Teste** e **Conferido** conforme cada bloco fica pronto.

**Legenda do status:** ⬜ não começou · 🟨 implementado, falta testar · ✅ implementado e testado

> **Regras gerais.** As V1–V9 valem para todos os endpoints. As RN01–RN21 valem cada uma para uma funcionalidade.

## Validação dos dados (V1–V9)

| Regra | O que diz (resumo) | Erro | Bloco do guia | Itens do barema | Onde no código | Teste automatizado | Conferido à mão | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V1 | Corpo tem que ser um objeto JSON; JSON inválido, `[]`, `"x"` ou `10` são recusados; corpo em GET, DELETE e venda é ignorado | 400 | 5 | B01, B02 | | | ☐ | ⬜ |
| V2 | Cada campo no tipo certo: `"15"` (texto) é recusado; inteiro não aceita `50.5`, mas aceita `50.0` | 400 | 5, 7 | B01 | | | ☐ | ⬜ |
| V3 | Valores em moedas não são enviados; se vierem no corpo (`base_value`, `cash`), são ignorados | — | 7 | B03 | | | ☐ | ⬜ |
| V4 | Nomes e `search`: tira espaços das pontas, junta espaços repetidos; tab e quebra de linha são recusados; vazio conta como ausente | 400 | 5 | B01, B07 | | | ☐ | ⬜ |
| V5 | Valores de lista exatamente como escritos (`ATA`, `true`); `"ata"` e `"TRUE"` são recusados | 400 | 5, 7 | B01 | | | ☐ | ⬜ |
| V6 | Campo obrigatório ausente ou `null` é recusado | 400 | 7 | B01 | | | ☐ | ⬜ |
| V7 | Campos calculados ou controlados pelo sistema e campos desconhecidos são ignorados, sem erro | — | 5, 7 | B03 | | | ☐ | ⬜ |
| V8 | Recurso inexistente → 404; id malformado na URL (`abc`, `0`, `01`, > 2147483647) → 404; jogador excluído conta como inexistente | 404 | 5 | B02, B08, B11, B16, B20, B21 | | | ☐ | ⬜ |
| V9 | Dado inválido → 400; não existe → 404; regra de negócio → 409 | 400/404/409 | 5 | B02 | | | ☐ | ⬜ |

## Regras de negócio (RN01–RN21)

| Regra | O que diz (resumo) | Erro | Bloco do guia | Itens do barema | Onde no código | Teste automatizado | Conferido à mão | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RN01 | Datas de entrada em `AAAA-MM-DDTHH:MM-03:00`; data inexistente é recusada; saída em `AAAA-MM-DDTHH:MM:SS-03:00` | 400 | 5, 10 | B12 | | | ☐ | ⬜ |
| RN02 | Desconto por condição: APTO 0%, MAL_CONDICIONADO 15%, DOENTE 30% | — | 6 | B05 | | | ☐ | ⬜ |
| RN03 | Agilidade mexe só no desconto e só fora de APTO: 80–100 → metade; 1–30 → +10 pontos | — | 6 | B05 | | | ☐ | ⬜ |
| RN04 | Idade: até 21 → +10%; 22–31 → 0%; 32+ → −10% | — | 6 | B05 | | | ☐ | ⬜ |
| RN05 | Valor de mercado = base × (100 + total) ÷ 100, com teto de −40% e piso de 1,00 | — | 6 | B05, B13 | | | ☐ | ⬜ |
| RN06 | Overall pelos pesos da posição (calculado a cada consulta); valor base progressivo, calculado uma vez no cadastro | — | 6, 7 | B06 | | | ☐ | ⬜ |
| RN07 | Listagem paginada com busca, filtros e ordenação; filtros de valor usam o valor de mercado | 400/404 | 8 | B07, B17 | | | ☐ | ⬜ |
| RN08 | `PUT` muda só nome, posição, agilidade e idade; quem tem clube não muda de posição; idade não diminui | 409 | 7 | B03, B04, B17 | | | ☐ | ⬜ |
| RN09 | Exclusão lógica (`excluido_em`), só de jogador livre; depois, 404 em tudo | 204/409 | 7 | B08, B11, B16, B17, B18 | | | ☐ | ⬜ |
| RN10 | Clube nasce com 300,00; nome único (sem diferenciar maiúsculas, com acentos); sigla única; máximo de 20 clubes | 409 | 4, 9 | B09 · B3 | | | ☐ | ⬜ |
| RN11 | Elenco ordenado (GOL→ATA, nome, id); contrato de cada jogador; valor do elenco e patrimônio calculados | 400 | 9 | B13, B17 | | | ☐ | ⬜ |
| RN12 | Só compra jogador livre, pelo valor de mercado; clube não recompra quem vendeu; compra grava tudo junto | 409 | 10 | B10, B11, B16 | | | ☐ | ⬜ |
| RN13 | Taxa de 5% só se o valor for > 30,00; custo total ≤ 50% do caixa, sem arredondar | 409 | 6, 10 | B10, B13 | | | ☐ | ⬜ |
| RN14 | No máximo 12 jogadores por clube | 409 | 10 | B11 | | | ☐ | ⬜ |
| RN15 | Dias restantes arredondados para cima; multa de 0/5/10/20% com teto de 10,00; contrato RESCINDIDO ou ENCERRADO | — | 6, 10 | B13, B14 | | | ☐ | ⬜ |
| RN16 | Lucro; comissão progressiva (10% até 10,00 + 20% acima); crédito = valor − multa − comissão; jogador livre não pode ser vendido | 409 | 6, 10 | B15, B16 | | | ☐ | ⬜ |
| RN17 | Histórico com valores do momento, ordem decrescente, filtros e `summary`; 300 + Σ `cash_change` = caixa | 400/404 | 11 | B18 | | | ☐ | ⬜ |
| RN18 | CSV com `;`, vírgula decimal, UTF-8 sem BOM, LF, aspas duplicadas; mesmos filtros do histórico | 400/404 | 11 | B19 | | | ☐ | ⬜ |
| RN19 | Escalação de 5 (1 GOL + 4 de linha) numa formação; venda ou DOENTE tiram o titular | 400/404/409 | 12 | B20 | | | ☐ | ⬜ |
| RN20 | Partida por 6 duelos, sem sorteio; MAL_CONDICIONADO × 0,85; gol se ataque > defesa; grava tudo | 400/404/409 | 6, 12 | B21 | | | ☐ | ⬜ |
| RN21 | Histórico de partidas e classificação (pontos → saldo → gols → nome), calculada a cada consulta | 400/404 | 12 | B22 | | | ☐ | ⬜ |

## Exemplo de linha preenchida

| Regra | O que diz (resumo) | Erro | Bloco do guia | Itens do barema | Onde no código | Teste automatizado | Conferido à mão | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RN05 | Valor de mercado = base × (100 + total) ÷ 100, com teto de −40% e piso de 1,00 | — | 6 | B05, B13 | `backend/src/domain/market-value.ts` | `market-value.spec.ts` (10 casos da tabela) | ☑ | ✅ |
