import { calculateBaseValue } from './base-value';

describe('calculateBaseValue (RN06, tabela de exemplos do valor base)', () => {
  it.each([
    [75, 86, 25, '40.00'],
    [60, 70, 30, '10.00'],
    [61, 70, 30, '12.00'],
    [76, 80, 22, '46.00'],
    [85, 92, 27, '100.00'],
    [70, 84, 21, '34.20'],
    [70, 84, 22, '30.00'],
    [45, 90, 18, '3.63'],
    [40, 66, 36, '1.00'],
  ])(
    'overall %i, potencial %i, %i anos: valor base %s',
    (overall, potential, age, expected) => {
      expect(calculateBaseValue(overall, potential, age).toFixed(2)).toBe(
        expected,
      );
    },
  );
});
