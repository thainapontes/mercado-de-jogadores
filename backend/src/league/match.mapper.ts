import { formatApiDateTime } from '../common/dates/api-date-time';
import { MatchResult, resultOf } from '../domain/match-engine';
import { Standing } from '../domain/standings';
import { Club, Match, MatchDuel } from '../generated/prisma/client';

export type MatchWithClubs = Match & { homeClub: Club; awayClub: Club };
export type MatchWithDuels = MatchWithClubs & { duels: MatchDuel[] };

export interface MatchSideResponse {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

export interface MatchSummaryResponse {
  id: number;
  played_at: string;
  home: MatchSideResponse;
  away: MatchSideResponse;
  result: MatchResult;
}

export interface DuelPlayerResponse {
  player_id: number;
  player_name: string;
  position: string;
  condition: string;
  attribute: string;
  value: number;
}

export interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayerResponse;
  defender: DuelPlayerResponse;
  goal: boolean;
}

export interface MatchResponse extends MatchSummaryResponse {
  duels: DuelResponse[];
}

export interface StandingResponse {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export function toMatchSummaryResponse(
  match: MatchWithClubs,
): MatchSummaryResponse {
  return {
    id: match.id,
    played_at: formatApiDateTime(match.playedAt),
    home: {
      club_id: match.homeClubId,
      club_name: match.homeClub.name,
      formation: match.homeFormation,
      goals: match.homeGoals,
    },
    away: {
      club_id: match.awayClubId,
      club_name: match.awayClub.name,
      formation: match.awayFormation,
      goals: match.awayGoals,
    },
    result: resultOf(match.homeGoals, match.awayGoals),
  };
}

export function toMatchResponse(match: MatchWithDuels): MatchResponse {
  return {
    ...toMatchSummaryResponse(match),
    duels: [...match.duels]
      .sort((a, b) => a.order - b.order)
      .map((duel) => ({
        order: duel.order,
        attacking_club_id: duel.attackingClubId,
        attacker: {
          player_id: duel.attackerId,
          player_name: duel.attackerName,
          position: duel.attackerPosition,
          condition: duel.attackerCondition,
          attribute: duel.attackAttribute,
          value: duel.attackValue,
        },
        defender: {
          player_id: duel.defenderId,
          player_name: duel.defenderName,
          position: duel.defenderPosition,
          condition: duel.defenderCondition,
          attribute: duel.defenseAttribute,
          value: duel.defenseValue,
        },
        goal: duel.goal,
      })),
  };
}

export function toStandingResponse(standing: Standing): StandingResponse {
  return {
    position: standing.position,
    club_id: standing.clubId,
    club_name: standing.clubName,
    played: standing.played,
    wins: standing.wins,
    draws: standing.draws,
    losses: standing.losses,
    goals_for: standing.goalsFor,
    goals_against: standing.goalsAgainst,
    goal_difference: standing.goalDifference,
    points: standing.points,
  };
}
