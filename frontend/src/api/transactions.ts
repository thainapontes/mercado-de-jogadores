import { apiClient } from './client';

export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionHistory {
  data: Transaction[];
  summary: TransactionSummary;
}

export interface TransactionFilters {
  type?: string;
  player_id?: string;
}

export function listTransactions(clubId: string, filters: TransactionFilters) {
  return apiClient.get<TransactionHistory>(`/clubs/${clubId}/transactions`, {
    ...filters,
  });
}

export function exportTransactions(
  clubId: string,
  filters: TransactionFilters,
) {
  return apiClient.getBlob(`/clubs/${clubId}/transactions/export`, {
    ...filters,
  });
}
