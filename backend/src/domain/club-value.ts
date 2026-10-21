import { Decimal } from './money';
import { compareNames } from './ordering';

export const CLUB_SORTS = ['name', 'net_worth_asc', 'net_worth_desc'] as const;
export type ClubSort = (typeof CLUB_SORTS)[number];

export interface RankedClub {
  id: number;
  name: string;
  netWorth: Decimal;
}

type Comparator = (a: RankedClub, b: RankedClub) => number;

const COMPARATORS: Record<ClubSort, Comparator> = {
  name: () => 0,
  net_worth_asc: (a, b) => a.netWorth.comparedTo(b.netWorth),
  net_worth_desc: (a, b) => b.netWorth.comparedTo(a.netWorth),
};

export function calculateSquadValue(marketValues: Decimal[]): Decimal {
  return marketValues.reduce((sum, value) => sum.plus(value), new Decimal(0));
}

export function calculateNetWorth(cash: Decimal, squadValue: Decimal): Decimal {
  return cash.plus(squadValue);
}

export function compareClubs(sort: ClubSort): Comparator {
  return (a, b) =>
    COMPARATORS[sort](a, b) || compareNames(a.name, b.name) || a.id - b.id;
}
