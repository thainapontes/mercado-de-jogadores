import { Position } from './types';

export const POSITION_ORDER: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
};

const ACCENT_MARK = /\p{Mn}/gu;

export interface RosterEntry {
  id: number;
  name: string;
  position: Position;
}

export function compareNames(a: string, b: string): number {
  const left = toCodePoints(a);
  const right = toCodePoints(b);
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return left.length - right.length;
}

export function compareRosterOrder(a: RosterEntry, b: RosterEntry): number {
  return (
    POSITION_ORDER[a.position] - POSITION_ORDER[b.position] ||
    compareNames(a.name, b.name) ||
    a.id - b.id
  );
}

export function toComparableText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(ACCENT_MARK, '');
}

function toCodePoints(name: string): number[] {
  return Array.from(
    toComparableText(name),
    (character) => character.codePointAt(0) ?? 0,
  );
}
