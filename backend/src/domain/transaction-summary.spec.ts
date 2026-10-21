import { Decimal } from './money';
import {
  RecordedTransaction,
  summarizeTransactions,
} from './transaction-summary';

function transaction(
  type: RecordedTransaction['type'],
  values: [string, string, string, string | null, string],
): RecordedTransaction {
  const [value, fee, penalty, profit, cashChange] = values;
  return {
    type,
    value: new Decimal(value),
    fee: new Decimal(fee),
    penalty: new Decimal(penalty),
    profit: profit === null ? null : new Decimal(profit),
    cashChange: new Decimal(cashChange),
  };
}

const PURCHASE = transaction('COMPRA', [
  '37.00',
  '1.85',
  '0.00',
  null,
  '-38.85',
]);
const SALE = transaction('VENDA', ['40.00', '0.30', '4.00', '3.00', '35.70']);
const LOSS = transaction('VENDA', ['42.50', '0.00', '8.50', '-7.50', '34.00']);

function summaryOf(transactions: RecordedTransaction[]) {
  const summary = summarizeTransactions(transactions);
  return {
    spent: summary.totalSpent.toFixed(2),
    received: summary.totalReceived.toFixed(2),
    fees: summary.totalFees.toFixed(2),
    penalties: summary.totalPenalties.toFixed(2),
    profit: summary.totalProfit.toFixed(2),
  };
}

describe('summarizeTransactions (RN17)', () => {
  it('compra e venda do Meia Lua (observação de 2.3.3)', () => {
    expect(summaryOf([SALE, PURCHASE])).toEqual({
      spent: '38.85',
      received: '35.70',
      fees: '2.15',
      penalties: '4.00',
      profit: '3.00',
    });
  });

  it('só a VENDA (exemplo de 2.3.3): total_spent 0,00', () => {
    expect(summaryOf([SALE])).toEqual({
      spent: '0.00',
      received: '35.70',
      fees: '0.30',
      penalties: '4.00',
      profit: '3.00',
    });
  });

  it('soma o lucro com sinal', () => {
    expect(summaryOf([SALE, LOSS]).profit).toBe('-4.50');
  });

  it('sem transações, tudo 0,00', () => {
    expect(summaryOf([])).toEqual({
      spent: '0.00',
      received: '0.00',
      fees: '0.00',
      penalties: '0.00',
      profit: '0.00',
    });
  });
});
