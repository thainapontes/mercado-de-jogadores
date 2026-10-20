import { Decimal, roundMoney } from './money';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PENALTY_BRACKETS = [
  { maxDays: 0, percentage: 0 },
  { maxDays: 30, percentage: 5 },
  { maxDays: 180, percentage: 10 },
];
const LONG_LOYALTY_PERCENTAGE = 20;
const MAXIMUM_PENALTY = new Decimal('10.00');
const COMMISSION_FIRST_BRACKET = new Decimal('10.00');
const COMMISSION_FIRST_PERCENTAGE = 10;
const COMMISSION_ABOVE_PERCENTAGE = 20;

export type ClosedContractStatus = 'RESCINDIDO' | 'ENCERRADO';

export interface SaleInput {
  marketValue: Decimal;
  purchaseValue: Decimal;
  loyaltyUntil: Date;
  now: Date;
}

export interface Sale {
  remainingDays: number;
  penaltyRate: number;
  penalty: Decimal;
  profit: Decimal;
  commission: Decimal;
  credit: Decimal;
  contractStatus: ClosedContractStatus;
}

export function remainingDays(loyaltyUntil: Date, now: Date): number {
  const days = Math.ceil((loyaltyUntil.getTime() - now.getTime()) / MS_PER_DAY);
  return Math.max(days, 0);
}

export function penaltyRate(days: number): number {
  const bracket = PENALTY_BRACKETS.find(({ maxDays }) => days <= maxDays);
  return bracket ? bracket.percentage : LONG_LOYALTY_PERCENTAGE;
}

export function calculatePenalty(marketValue: Decimal, rate: number): Decimal {
  const penalty = roundMoney(marketValue.times(rate).div(100));
  return Decimal.min(penalty, MAXIMUM_PENALTY);
}

export function calculateCommission(profit: Decimal): Decimal {
  if (profit.lte(0)) {
    return new Decimal(0);
  }
  const firstPart = Decimal.min(profit, COMMISSION_FIRST_BRACKET);
  const partAbove = Decimal.max(profit.minus(COMMISSION_FIRST_BRACKET), 0);
  return roundMoney(
    firstPart
      .times(COMMISSION_FIRST_PERCENTAGE)
      .plus(partAbove.times(COMMISSION_ABOVE_PERCENTAGE))
      .div(100),
  );
}

export function calculateSale({
  marketValue,
  purchaseValue,
  loyaltyUntil,
  now,
}: SaleInput): Sale {
  const days = remainingDays(loyaltyUntil, now);
  const rate = penaltyRate(days);
  const penalty = calculatePenalty(marketValue, rate);
  const profit = marketValue.minus(purchaseValue);
  const commission = calculateCommission(profit);
  return {
    remainingDays: days,
    penaltyRate: rate,
    penalty,
    profit,
    commission,
    credit: marketValue.minus(penalty).minus(commission),
    contractStatus: penalty.gt(0) ? 'RESCINDIDO' : 'ENCERRADO',
  };
}
