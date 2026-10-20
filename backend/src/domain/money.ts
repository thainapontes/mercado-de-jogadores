import { Decimal } from '@prisma/client/runtime/client';

export { Decimal };

const MONEY_DECIMAL_PLACES = 2;

export function roundMoney(value: Decimal): Decimal {
  return value.toDecimalPlaces(MONEY_DECIMAL_PLACES, Decimal.ROUND_HALF_UP);
}
