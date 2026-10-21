import { formatApiDateTime } from '../common/dates/api-date-time';
import { formatMoneyWithComma } from '../common/text/format-decimal';
import { Transaction } from '../generated/prisma/client';

const HEADER = [
  'data_hora',
  'tipo',
  'jogador',
  'valor',
  'taxa_ou_comissao',
  'multa',
  'lucro',
  'variacao_caixa',
];
const SEPARATOR = ';';
const LINE_END = '\n';
const NEEDS_QUOTES = /[;"]/;

export function toTransactionsCsv(transactions: Transaction[]): string {
  return [HEADER, ...transactions.map(toCsvFields)]
    .map((fields) => fields.join(SEPARATOR) + LINE_END)
    .join('');
}

function toCsvFields(transaction: Transaction): string[] {
  return [
    formatApiDateTime(transaction.createdAt),
    transaction.type,
    quoteIfNeeded(transaction.playerName),
    formatMoneyWithComma(transaction.value),
    formatMoneyWithComma(transaction.fee),
    formatMoneyWithComma(transaction.penalty),
    transaction.profit === null ? '' : formatMoneyWithComma(transaction.profit),
    formatMoneyWithComma(transaction.cashChange),
  ];
}

function quoteIfNeeded(text: string): string {
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
