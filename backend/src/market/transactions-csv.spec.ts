import { Decimal } from '../domain/money';
import { Transaction } from '../generated/prisma/client';
import { toTransactionsCsv } from './transactions-csv';

const HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n';

function transaction(change: Partial<Transaction>): Transaction {
  return {
    id: 1,
    clubId: 1,
    playerId: 2,
    playerName: 'Meia Lua',
    type: 'COMPRA',
    value: new Decimal('37.00'),
    fee: new Decimal('1.85'),
    penalty: new Decimal('0.00'),
    profit: null,
    cashChange: new Decimal('-38.85'),
    createdAt: new Date('2026-11-02T13:15:00.000Z'),
    ...change,
  };
}

describe('toTransactionsCsv (RN18)', () => {
  it('reproduz o exemplo do Meia Lua no Águias FC', () => {
    const sale = transaction({
      id: 2,
      type: 'VENDA',
      value: new Decimal('40.00'),
      fee: new Decimal('0.30'),
      penalty: new Decimal('4.00'),
      profit: new Decimal('3.00'),
      cashChange: new Decimal('35.70'),
      createdAt: new Date('2026-11-05T19:40:00.000Z'),
    });
    expect(toTransactionsCsv([sale, transaction({})])).toBe(
      HEADER +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações, só a linha de cabeçalho', () => {
    expect(toTransactionsCsv([])).toBe(HEADER);
  });

  it.each([
    ['Zé "Foguete" Lima', '"Zé ""Foguete"" Lima"'],
    ['Ana;Lima Souza', '"Ana;Lima Souza"'],
    ['Ana, Lima', 'Ana, Lima'],
  ])('nome %j vira %s', (name, field) => {
    const [, line] = toTransactionsCsv([
      transaction({ playerName: name }),
    ]).split('\n');
    expect(line.split(';').length).toBeGreaterThanOrEqual(8);
    expect(line).toContain(`;COMPRA;${field};37,00;`);
  });

  it('lucro negativo com sinal e zero com duas casas', () => {
    const csv = toTransactionsCsv([
      transaction({ type: 'VENDA', profit: new Decimal('-7.50') }),
      transaction({ type: 'VENDA', profit: new Decimal('0') }),
    ]);
    expect(csv).toContain(';-7,50;');
    expect(csv).toContain(';0,00;');
  });
});
