import { calculateMarketValue } from './market-value';
import { Decimal } from './money';
import { Condition } from './types';

describe('calculateMarketValue (RN02 a RN05, tabela de exemplos)', () => {
  it.each<[string, Condition, number, number, string]>([
    ['82.00', 'APTO', 20, 25, '82.00'],
    ['82.00', 'APTO', 50, 19, '90.20'],
    ['82.00', 'MAL_CONDICIONADO', 50, 25, '69.70'],
    ['82.00', 'MAL_CONDICIONADO', 80, 21, '84.05'],
    ['82.00', 'MAL_CONDICIONADO', 30, 33, '53.30'],
    ['82.00', 'DOENTE', 90, 25, '69.70'],
    ['82.00', 'DOENTE', 30, 25, '49.20'],
    ['82.00', 'DOENTE', 10, 40, '49.20'],
    ['9.50', 'MAL_CONDICIONADO', 85, 25, '8.79'],
    ['1.00', 'MAL_CONDICIONADO', 50, 35, '1.00'],
  ])(
    'base %s, %s, agilidade %i, %i anos: %s',
    (baseValue, condition, agility, age, expected) => {
      expect(
        calculateMarketValue(
          new Decimal(baseValue),
          condition,
          agility,
          age,
        ).toFixed(2),
      ).toBe(expected);
    },
  );

  it.each<[Condition, number, number, string]>([
    ['MAL_CONDICIONADO', 31, 22, '85.00'],
    ['MAL_CONDICIONADO', 79, 31, '85.00'],
    ['APTO', 100, 32, '90.00'],
  ])(
    'limites das faixas: %s, agilidade %i, %i anos sobre base 100,00 dá %s',
    (condition, agility, age, expected) => {
      expect(
        calculateMarketValue(
          new Decimal('100.00'),
          condition,
          agility,
          age,
        ).toFixed(2),
      ).toBe(expected);
    },
  );
});
