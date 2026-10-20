import { Decimal } from './money';
import { compareNames, POSITION_ORDER, toComparableText } from './ordering';
import { Position } from './types';

export const PLAYER_SORTS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;
export type PlayerSort = (typeof PLAYER_SORTS)[number];

export interface ListedPlayer {
  id: number;
  name: string;
  position: Position;
  age: number;
  marketValue: Decimal;
}

type Comparator = (a: ListedPlayer, b: ListedPlayer) => number;

const COMPARATORS: Record<PlayerSort, Comparator> = {
  name: (a, b) => compareNames(a.name, b.name),
  value_asc: (a, b) => a.marketValue.comparedTo(b.marketValue),
  value_desc: (a, b) => b.marketValue.comparedTo(a.marketValue),
  age_asc: (a, b) => a.age - b.age,
  age_desc: (a, b) => b.age - a.age,
  position: (a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position],
};

export function sortField(sort: string): string {
  return sort.replace(/_(asc|desc)$/, '');
}

export function matchesSearch(name: string, search: string): boolean {
  return toComparableText(name).includes(toComparableText(search));
}

export function isWithinValueRange(
  value: Decimal,
  min: Decimal | undefined,
  max: Decimal | undefined,
): boolean {
  return (!min || value.gte(min)) && (!max || value.lte(max));
}

export function comparePlayers(sorts: PlayerSort[]): Comparator {
  const comparators = [
    ...sorts.map((sort) => COMPARATORS[sort]),
    COMPARATORS.name,
    (a: ListedPlayer, b: ListedPlayer) => a.id - b.id,
  ];
  return (a, b) => {
    for (const compare of comparators) {
      const result = compare(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}
