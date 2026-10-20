import { Decimal } from './money';
import { calculatePurchase, exceedsCashLimit } from './purchase';

describe('calculatePurchase (RN13, tabela de exemplos)', () => {
  it.each([
    ['300.00', '28.00', '0.00', '28.00', false],
    ['300.00', '30.00', '0.00', '30.00', false],
    ['300.00', '30.01', '1.50', '31.51', false],
    ['100.00', '47.62', '2.38', '50.00', false],
    ['100.00', '48.00', '2.40', '50.40', true],
  ])(
    'caixa %s, valor %s: taxa %s, custo %s, passa do limite? %s',
    (cash, marketValue, fee, totalCost, exceeds) => {
      const purchase = calculatePurchase(
        new Decimal(marketValue),
        new Decimal(cash),
      );
      expect(purchase.fee.toFixed(2)).toBe(fee);
      expect(purchase.totalCost.toFixed(2)).toBe(totalCost);
      expect(purchase.exceedsCashLimit).toBe(exceeds);
    },
  );
});

describe('exceedsCashLimit (RN13, limite sem arredondar)', () => {
  it.each([
    ['130.57', false],
    ['130.58', true],
  ])('caixa 261,15 (limite 130,575) e custo %s: passa? %s', (cost, exceeds) => {
    expect(exceedsCashLimit(new Decimal(cost), new Decimal('261.15'))).toBe(
      exceeds,
    );
  });
});
