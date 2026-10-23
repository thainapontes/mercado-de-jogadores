import { useMutation, useQuery } from '@tanstack/react-query';
import {
  exportTransactions,
  listTransactions,
  type TransactionFilters,
} from '../api/transactions';
import { queryKeys } from './queryKeys';

export function useTransactions(clubId: string, filters: TransactionFilters) {
  return useQuery({
    queryKey: [...queryKeys.transactions, clubId, filters],
    queryFn: () => listTransactions(clubId, filters),
  });
}

export function useExportTransactions(clubId: string) {
  return useMutation({
    mutationFn: (filters: TransactionFilters) =>
      exportTransactions(clubId, filters),
  });
}
