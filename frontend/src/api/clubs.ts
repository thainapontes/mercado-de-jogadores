import { apiClient } from './client';
import type { Player } from './players';

export const CLUB_SORTS = ['name', 'net_worth_desc', 'net_worth_asc'] as const;
export type ClubSort = (typeof CLUB_SORTS)[number];

export interface Club {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface Contract {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayer extends Player {
  contract: Contract;
}

export interface ClubDetail extends Club {
  players: SquadPlayer[];
}

export interface CreateClubInput {
  name: string;
  acronym: string;
}

export function listClubs(sort: ClubSort) {
  return apiClient.get<Club[]>('/clubs', { sort });
}

export function getClub(id: string) {
  return apiClient.get<ClubDetail>(`/clubs/${id}`);
}

export function createClub(input: CreateClubInput) {
  return apiClient.post<Club>('/clubs', input);
}
