import { apiClient } from './client';

export interface BuyInput {
  club_id: number;
  loyalty_until: string;
}

interface TransactionFields {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  value: number;
  fee: number;
  penalty: number;
  cash_change: number;
  created_at: string;
  club_cash: number;
}

export interface Purchase extends TransactionFields {
  type: 'COMPRA';
  profit: null;
  contract: { purchase_value: number; loyalty_until: string; status: string };
}

export interface Sale extends TransactionFields {
  type: 'VENDA';
  profit: number;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
}

export function buyPlayer(playerId: number, input: BuyInput) {
  return apiClient.post<Purchase>(`/players/${playerId}/buy`, input);
}

export function sellPlayer(playerId: number) {
  return apiClient.post<Sale>(`/players/${playerId}/sell`);
}
