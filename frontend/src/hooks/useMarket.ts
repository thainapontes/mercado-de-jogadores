import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buyPlayer, sellPlayer, type BuyInput } from '../api/market';
import { queryKeys } from './queryKeys';

function useRefreshAfterTrade() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [
        queryKeys.players,
        queryKeys.clubs,
        queryKeys.club,
        queryKeys.transactions,
        queryKeys.lineups,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

export function useBuyPlayer() {
  const refresh = useRefreshAfterTrade();
  return useMutation({
    mutationFn: ({ playerId, input }: { playerId: number; input: BuyInput }) =>
      buyPlayer(playerId, input),
    onSuccess: refresh,
  });
}

export function useSellPlayer() {
  const refresh = useRefreshAfterTrade();
  return useMutation({ mutationFn: sellPlayer, onSuccess: refresh });
}
