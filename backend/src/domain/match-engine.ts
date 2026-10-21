import { divideBy100RoundingHalfUp } from './integer-rounding';
import { compareRosterOrder } from './ordering';
import { Condition, Position } from './types';

const POOR_CONDITION_PERCENTAGE = 85;

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';
export type MatchSide = 'HOME' | 'AWAY';
export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export interface Starter {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
}

export interface DuelParticipant {
  player: Starter;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingSide: MatchSide;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface MatchOutcome {
  duels: Duel[];
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
}

interface Team {
  goalkeeper: Starter;
  outfield: Starter[];
}

export function playMatch(
  homeStarters: Starter[],
  awayStarters: Starter[],
): MatchOutcome {
  const home = toTeam(homeStarters);
  const away = toTeam(awayStarters);
  const duels = [
    ...attacksOf(home, away, 'HOME', 1),
    ...attacksOf(away, home, 'AWAY', 4),
  ];
  const homeGoals = countGoals(duels, 'HOME');
  const awayGoals = countGoals(duels, 'AWAY');
  return {
    duels,
    homeGoals,
    awayGoals,
    result: resultOf(homeGoals, awayGoals),
  };
}

function toTeam(starters: Starter[]): Team {
  const [goalkeeper, ...outfield] = [...starters].sort(compareRosterOrder);
  return { goalkeeper, outfield };
}

function attacksOf(
  attacking: Team,
  defending: Team,
  attackingSide: MatchSide,
  firstOrder: number,
): Duel[] {
  const [, second, third, fourth] = attacking.outfield;
  const [opponentFirst, opponentSecond] = defending.outfield;
  const pairs: [Starter, Starter][] = [
    [fourth, defending.goalkeeper],
    [third, opponentFirst],
    [second, opponentSecond],
  ];
  return pairs.map(([attacker, defender], index) => {
    const attack = participant(attacker, attackAttribute(attacker.position));
    const defense = participant(defender, 'defending');
    return {
      order: firstOrder + index,
      attackingSide,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value,
    };
  });
}

function attackAttribute(position: Position): DuelAttribute {
  if (position === 'ATA') {
    return 'shooting';
  }
  if (position === 'MEI') {
    return 'passing';
  }
  return 'dribbling';
}

function participant(
  player: Starter,
  attribute: DuelAttribute,
): DuelParticipant {
  const value =
    player.condition === 'MAL_CONDICIONADO'
      ? divideBy100RoundingHalfUp(player[attribute] * POOR_CONDITION_PERCENTAGE)
      : player[attribute];
  return { player, attribute, value };
}

function countGoals(duels: Duel[], side: MatchSide): number {
  return duels.filter((duel) => duel.attackingSide === side && duel.goal)
    .length;
}

export function resultOf(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) {
    return 'MANDANTE';
  }
  if (awayGoals > homeGoals) {
    return 'VISITANTE';
  }
  return 'EMPATE';
}
