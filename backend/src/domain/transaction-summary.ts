import { Decimal } from './money';
import { TransactionType } from './types';

export interface RecordedTransaction {
  type: TransactionType;
  value: Decimal;
  fee: Decimal;
  penalty: Decimal;
  profit: Decimal | null;
  cashChange: Decimal;
}

export interface TransactionSummary {
  totalSpent: Decimal;
  totalReceived: Decimal;
  totalFees: Decimal;
  totalPenalties: Decimal;
  totalProfit: Decimal;
}

export function summarizeTransactions(
  transactions: RecordedTransaction[],
): TransactionSummary {
  const purchases = transactions.filter(({ type }) => type === 'COMPRA');
  const sales = transactions.filter(({ type }) => type === 'VENDA');
  return {
    totalSpent: sum(purchases.map(({ value, fee }) => value.plus(fee))),
    totalReceived: sum(sales.map(({ cashChange }) => cashChange)),
    totalFees: sum(transactions.map(({ fee }) => fee)),
    totalPenalties: sum(sales.map(({ penalty }) => penalty)),
    totalProfit: sum(sales.map(({ profit }) => profit ?? new Decimal(0))),
  };
}

function sum(values: Decimal[]): Decimal {
  return values.reduce((total, value) => total.plus(value), new Decimal(0));
}
