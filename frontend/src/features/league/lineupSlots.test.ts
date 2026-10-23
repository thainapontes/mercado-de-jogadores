import { describe, expect, it } from 'vitest';
import { lineupSlots } from './lineupSlots';

const positionsOf = (formation: Parameters<typeof lineupSlots>[0]) =>
  lineupSlots(formation).map((slot) => slot.positions.join('/'));

describe('lineupSlots', () => {
  it.each([
    ['3-1', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'ZAG/LAT', 'ATA']],
    ['2-2', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG/LAT', 'MEI', 'MEI', 'ATA']],
  ] as const)('%s gera 1 goleiro e 4 vagas de linha', (formation, expected) => {
    expect(positionsOf(formation)).toEqual(expected);
  });
});
