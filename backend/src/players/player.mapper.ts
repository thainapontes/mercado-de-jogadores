import { calculateMarketValue } from '../domain/market-value';
import { calculateOverall } from '../domain/overall';
import { Condition, Position } from '../domain/types';
import { Player } from '../generated/prisma/client';

export interface PlayerResponse {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export function toPlayerResponse(player: Player): PlayerResponse {
  const position = player.position as Position;
  const condition = player.condition as Condition;
  return {
    id: player.id,
    name: player.name,
    position,
    agility: player.agility,
    age: player.age,
    condition,
    base_value: player.baseValue.toNumber(),
    market_value: calculateMarketValue(
      player.baseValue,
      condition,
      player.agility,
      player.age,
    ).toNumber(),
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall: calculateOverall(position, player),
    club_id: player.clubId,
  };
}
