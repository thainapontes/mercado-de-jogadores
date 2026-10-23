import { apiClient, type QueryParams } from './client';

export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;
export type Position = (typeof POSITIONS)[number];

export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const PLAYER_SORTS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;
export type PlayerSort = (typeof PLAYER_SORTS)[number];

export interface Player {
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

export interface PlayerPage {
  data: Player[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface PlayerFilters {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: 'true';
  club_id?: string;
  min_age?: string;
  max_age?: string;
  min_value?: string;
  max_value?: string;
  sort?: PlayerSort;
}

export interface CreatePlayerInput {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export type UpdatePlayerInput = Pick<
  CreatePlayerInput,
  'name' | 'position' | 'agility' | 'age'
>;

export const PLAYERS_PAGE_SIZE = 10;

export function listPlayers(filters: PlayerFilters, page: number) {
  const params: QueryParams = { ...filters, page, limit: PLAYERS_PAGE_SIZE };
  return apiClient.get<PlayerPage>('/players', params);
}

export function createPlayer(input: CreatePlayerInput) {
  return apiClient.post<Player>('/players', input);
}

export function updatePlayer(id: number, input: UpdatePlayerInput) {
  return apiClient.put<Player>(`/players/${id}`, input);
}

export function updatePlayerCondition(id: number, condition: Condition) {
  return apiClient.patch<Player>(`/players/${id}/condition`, { condition });
}

export function deletePlayer(id: number) {
  return apiClient.delete(`/players/${id}`);
}
