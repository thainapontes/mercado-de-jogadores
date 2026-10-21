import { Decimal } from '../../domain/money';

const MONEY_DECIMAL_PLACES = 2;

export function formatMoneyWithComma(value: Decimal): string {
  return value.toFixed(MONEY_DECIMAL_PLACES).replace('.', ',');
}
