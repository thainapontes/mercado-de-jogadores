import { Decimal, roundMoney } from './money';

describe('roundMoney (Premissas: arredondamento)', () => {
  it.each([
    ['14.775', '14.78'],
    ['0.385', '0.39'],
    ['-14.775', '-14.78'],
    ['-0.385', '-0.39'],
    ['8.7875', '8.79'],
    ['1.5005', '1.50'],
    ['3.625', '3.63'],
    ['14.774', '14.77'],
    ['40', '40.00'],
  ])('%s vira %s', (input, expected) => {
    expect(roundMoney(new Decimal(input)).toFixed(2)).toBe(expected);
  });
});
