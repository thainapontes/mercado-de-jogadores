import { apiClient } from './client';
import type { Condition, Player, Position } from './players';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formation = (typeof FORMATIONS)[number];

export interface Lineup {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
}

export interface LineupInput {
  formation: Formation;
  player_ids: number[];
}

export interface MatchSide {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

export interface DuelPlayer {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: string;
  value: number;
}

export interface Duel {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayer;
  defender: DuelPlayer;
  goal: boolean;
}

export interface Match {
  id: number;
  played_at: string;
  home: MatchSide;
  away: MatchSide;
  result: string;
  duels?: Duel[];
}

export interface MatchInput {
  home_club_id: number;
  away_club_id: number;
}

export interface Standing {
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

export function getLineup(clubId: string) {
  return apiClient.get<Lineup>(`/clubs/${clubId}/lineup`);
}

export function updateLineup(clubId: string, input: LineupInput) {
  return apiClient.put<Lineup>(`/clubs/${clubId}/lineup`, input);
}

export function createMatch(input: MatchInput) {
  return apiClient.post<Match>('/matches', input);
}

export function listMatches(clubId: string) {
  return apiClient.get<Match[]>('/matches', { club_id: clubId });
}

export function getMatch(id: number) {
  return apiClient.get<Match>(`/matches/${id}`);
}

export function getStandings() {
  return apiClient.get<Standing[]>('/standings');
}
