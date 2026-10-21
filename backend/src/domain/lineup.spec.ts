import { Formation, fitsFormation, isLineupComplete } from './lineup';
import { Position } from './types';

describe('fitsFormation (RN19)', () => {
  it.each<[Formation, Position[]]>([
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
    ['3-1', ['ZAG', 'ZAG', 'ATA', 'ZAG', 'GOL']],
    ['2-1-1', ['ATA', 'MEI', 'LAT', 'LAT', 'GOL']],
  ])('%s fecha com %j', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(true);
  });

  it.each<[Formation, Position[]]>([
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['3-1', ['GOL', 'GOL', 'LAT', 'LAT', 'ATA']],
    ['1-2-1', ['ZAG', 'ZAG', 'MEI', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT']],
  ])('%s não fecha com %j', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(false);
  });
});

describe('isLineupComplete (RN19 item 6)', () => {
  it.each([
    ['2-1-1', 5, true],
    ['2-1-1', 4, false],
    [null, 0, false],
  ] as const)(
    'formação %s com %i titulares → %s',
    (formation, count, complete) => {
      expect(isLineupComplete(formation, count)).toBe(complete);
    },
  );
});
