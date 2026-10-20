import { Decimal, roundMoney } from './money';

const FEE_THRESHOLD = new Decimal('30.00');
const FEE_PERCENTAGE = 5;

export interface Purchase {
  fee: Decimal;
  totalCost: Decimal;
  exceedsCashLimit: boolean;
}

export function calculatePurchaseFee(marketValue: Decimal): Decimal {
  if (marketValue.lte(FEE_THRESHOLD)) {
    return new Decimal(0);
  }
  return roundMoney(marketValue.times(FEE_PERCENTAGE).div(100));
}

export function exceedsCashLimit(totalCost: Decimal, cash: Decimal): boolean {
  return totalCost.gt(cash.div(2));
}

export function calculatePurchase(
  marketValue: Decimal,
  cash: Decimal,
): Purchase {
  const fee = calculatePurchaseFee(marketValue);
  const totalCost = marketValue.plus(fee);
  return {
    fee,
    totalCost,
    exceedsCashLimit: exceedsCashLimit(totalCost, cash),
  };
}
