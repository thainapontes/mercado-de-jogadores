import { Position } from './types';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formation = (typeof FORMATIONS)[number];

export const LINEUP_SIZE = 5;

interface Sectors {
  defense: number;
  midfield: number;
  attack: number;
}

const SECTORS: Record<Formation, Sectors> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export function fitsFormation(
  positions: Position[],
  formation: Formation,
): boolean {
  const count = (...wanted: Position[]) =>
    positions.filter((position) => wanted.includes(position)).length;
  const sectors = SECTORS[formation];
  return (
    positions.length === LINEUP_SIZE &&
    count('GOL') === 1 &&
    count('ZAG', 'LAT') === sectors.defense &&
    count('MEI') === sectors.midfield &&
    count('ATA') === sectors.attack
  );
}

export function isLineupComplete(
  formation: string | null,
  starters: number,
): boolean {
  return formation !== null && starters === LINEUP_SIZE;
}
