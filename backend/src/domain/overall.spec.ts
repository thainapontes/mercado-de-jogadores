import { calculateOverall } from './overall';
import { Position } from './types';

describe('calculateOverall (RN06, tabela de exemplos do overall)', () => {
  it.each<[Position, number, number, number, number, number, number, number]>([
    ['MEI', 68, 65, 80, 78, 52, 60, 73],
    ['ATA', 78, 75, 73, 82, 48, 68, 76],
    ['LAT', 72, 70, 78, 76, 70, 66, 72],
    ['ZAG', 50, 90, 60, 40, 80, 75, 73],
    ['GOL', 55, 30, 65, 40, 72, 68, 68],
  ])(
    '%s (%i, %i, %i, %i, %i, %i) tem overall %i',
    (
      position,
      pace,
      shooting,
      passing,
      dribbling,
      defending,
      physical,
      expected,
    ) => {
      expect(
        calculateOverall(position, {
          pace,
          shooting,
          passing,
          dribbling,
          defending,
          physical,
        }),
      ).toBe(expected);
    },
  );

  it('arredonda 72,45 para baixo', () => {
    expect(
      calculateOverall('MEI', {
        pace: 70,
        shooting: 70,
        passing: 75,
        dribbling: 75,
        defending: 59,
        physical: 70,
      }),
    ).toBe(72);
  });
});
