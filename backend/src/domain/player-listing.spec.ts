import { Decimal } from './money';
import {
  comparePlayers,
  isWithinValueRange,
  ListedPlayer,
  matchesSearch,
  PlayerSort,
  sortField,
} from './player-listing';
import { Position } from './types';

function player(
  id: number,
  name: string,
  position: Position,
  age: number,
  marketValue: string,
): ListedPlayer {
  return { id, name, position, age, marketValue: new Decimal(marketValue) };
}

const PLAYERS = [
  player(1, 'Zeca Alves', 'ATA', 30, '45.00'),
  player(2, 'Bruno Lima', 'MEI', 21, '37.00'),
  player(3, 'Ana Souza', 'GOL', 30, '40.00'),
  player(4, 'Érico Dias', 'LAT', 19, '12.50'),
  player(5, 'Caio Rocha', 'ZAG', 35, '9.99'),
  player(6, 'Ana Souza', 'ZAG', 22, '37.00'),
];

function sortedIds(sorts: PlayerSort[]): number[] {
  return [...PLAYERS].sort(comparePlayers(sorts)).map(({ id }) => id);
}

describe('comparePlayers (RN07)', () => {
  it.each<[PlayerSort[], number[]]>([
    [['name'], [3, 6, 2, 5, 4, 1]],
    [['position'], [3, 6, 5, 4, 2, 1]],
    [['value_asc'], [5, 4, 6, 2, 3, 1]],
    [['value_desc'], [1, 3, 6, 2, 4, 5]],
    [['age_asc'], [4, 2, 6, 3, 1, 5]],
    [['age_desc'], [5, 3, 1, 6, 2, 4]],
    [
      ['value_desc', 'age_asc'],
      [1, 3, 2, 6, 4, 5],
    ],
    [
      ['age_asc', 'value_desc'],
      [4, 2, 6, 1, 3, 5],
    ],
    [
      ['position', 'age_desc'],
      [3, 5, 6, 4, 2, 1],
    ],
  ])('sort=%j', (sorts, expected) => {
    expect(sortedIds(sorts)).toEqual(expected);
  });

  it('empate em tudo é desfeito pelo id crescente', () => {
    const twins = [
      player(9, 'Ana Souza', 'ZAG', 22, '37.00'),
      player(6, 'Ana Souza', 'ZAG', 22, '37.00'),
    ];
    expect(
      twins.sort(comparePlayers(['value_desc'])).map(({ id }) => id),
    ).toEqual([6, 9]);
  });
});

describe('matchesSearch (RN07)', () => {
  it.each([
    ['João Silva', 'joao', true],
    ['Meia Lua', 'LUA', true],
    ['Meia Lua', 'meia lua', true],
    ['Conceição Neto', 'conceicao', true],
    ['Érico Dias', 'eri', true],
    ['Meia Lua', 'sol', false],
    ['Meia Lua', 'meialua', false],
  ])('"%s" contém "%s"? %s', (name, search, expected) => {
    expect(matchesSearch(name, search)).toBe(expected);
  });
});

describe('isWithinValueRange (RN07)', () => {
  const value = new Decimal('37.00');

  it.each([
    [undefined, undefined, true],
    ['37', undefined, true],
    [undefined, '37', true],
    ['37.01', undefined, false],
    [undefined, '36.99', false],
    ['30', '40', true],
  ])('min %s, max %s: %s', (min, max, expected) => {
    expect(
      isWithinValueRange(
        value,
        min === undefined ? undefined : new Decimal(min),
        max === undefined ? undefined : new Decimal(max),
      ),
    ).toBe(expected);
  });
});

describe('sortField', () => {
  it.each([
    ['value_asc', 'value'],
    ['age_desc', 'age'],
    ['name', 'name'],
    ['position', 'position'],
  ])('%s → %s', (sort, field) => {
    expect(sortField(sort)).toBe(field);
  });
});
