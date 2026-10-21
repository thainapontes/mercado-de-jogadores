import { isLineupComplete } from '../domain/lineup';
import { Club, Player } from '../generated/prisma/client';
import { PlayerResponse, toPlayerResponse } from '../players/player.mapper';

export interface LineupResponse {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: PlayerResponse[];
}

export function toLineupResponse(
  club: Club,
  starters: Player[],
): LineupResponse {
  return {
    club_id: club.id,
    formation: club.formation,
    complete: isLineupComplete(club.formation, starters.length),
    players: starters.map(toPlayerResponse),
  };
}
