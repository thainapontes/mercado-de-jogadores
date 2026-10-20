import { Decimal, roundMoney } from './money';
import { Condition } from './types';

const CONDITION_DISCOUNT: Record<Condition, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 15,
  DOENTE: 30,
};
const HIGH_AGILITY_MIN = 80;
const LOW_AGILITY_MAX = 30;
const LOW_AGILITY_EXTRA_DISCOUNT = 10;
const YOUNG_MAX_AGE = 21;
const VETERAN_MIN_AGE = 32;
const AGE_ADJUSTMENT = 10;
const MAXIMUM_TOTAL_DISCOUNT = -40;
const MINIMUM_MARKET_VALUE = new Decimal('1.00');

export function calculateMarketValue(
  baseValue: Decimal,
  condition: Condition,
  agility: number,
  age: number,
): Decimal {
  const totalPercentage = Decimal.max(
    ageAdjustment(age).minus(conditionDiscount(condition, agility)),
    MAXIMUM_TOTAL_DISCOUNT,
  );
  const marketValue = roundMoney(
    baseValue.times(totalPercentage.plus(100)).div(100),
  );
  return Decimal.max(marketValue, MINIMUM_MARKET_VALUE);
}

function conditionDiscount(condition: Condition, agility: number): Decimal {
  const discount = new Decimal(CONDITION_DISCOUNT[condition]);
  if (condition === 'APTO') {
    return discount;
  }
  if (agility >= HIGH_AGILITY_MIN) {
    return discount.div(2);
  }
  if (agility <= LOW_AGILITY_MAX) {
    return discount.plus(LOW_AGILITY_EXTRA_DISCOUNT);
  }
  return discount;
}

function ageAdjustment(age: number): Decimal {
  if (age <= YOUNG_MAX_AGE) {
    return new Decimal(AGE_ADJUSTMENT);
  }
  if (age >= VETERAN_MIN_AGE) {
    return new Decimal(-AGE_ADJUSTMENT);
  }
  return new Decimal(0);
}
