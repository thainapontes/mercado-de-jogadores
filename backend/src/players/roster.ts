import { compareRosterOrder } from '../domain/ordering';
import { Position } from '../domain/types';
import { Player } from '../generated/prisma/client';

export function sortByRosterOrder(players: Player[]): Player[] {
  return [...players].sort((a, b) =>
    compareRosterOrder(
      { ...a, position: a.position as Position },
      { ...b, position: b.position as Position },
    ),
  );
}
