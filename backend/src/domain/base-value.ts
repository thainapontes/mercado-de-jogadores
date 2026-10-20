import { Decimal, roundMoney } from './money';

const OVERALL_BANDS = [
  { from: 41, to: 60, pricePerPoint: new Decimal('0.50') },
  { from: 61, to: 75, pricePerPoint: new Decimal('2.00') },
  { from: 76, to: 99, pricePerPoint: new Decimal('6.00') },
];
const YOUNG_PROSPECT_MAX_AGE = 21;
const MINIMUM_BASE_VALUE = new Decimal('1.00');

export function calculateBaseValue(
  overall: number,
  potential: number,
  ageAtRegistration: number,
): Decimal {
  let overallPart = new Decimal(0);
  for (const band of OVERALL_BANDS) {
    const pointsInBand = Math.min(overall, band.to) - band.from + 1;
    if (pointsInBand > 0) {
      overallPart = overallPart.plus(band.pricePerPoint.times(pointsInBand));
    }
  }

  if (ageAtRegistration <= YOUNG_PROSPECT_MAX_AGE) {
    overallPart = overallPart.times(100 + potential - overall).div(100);
  }

  return Decimal.max(roundMoney(overallPart), MINIMUM_BASE_VALUE);
}
