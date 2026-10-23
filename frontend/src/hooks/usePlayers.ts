import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createPlayer,
  deletePlayer,
  listPlayers,
  updatePlayer,
  updatePlayerCondition,
  type Condition,
  type PlayerFilters,
  type UpdatePlayerInput,
} from '../api/players';
import { queryKeys } from './queryKeys';

export function usePlayers(filters: PlayerFilters, page: number) {
  return useQuery({
    queryKey: [...queryKeys.players, filters, page],
    queryFn: () => listPlayers(filters, page),
    placeholderData: keepPreviousData,
  });
}

function useRefreshAfterPlayerChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [
        queryKeys.players,
        queryKeys.clubs,
        queryKeys.club,
        queryKeys.lineups,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

export function useCreatePlayer() {
  const refresh = useRefreshAfterPlayerChange();
  return useMutation({ mutationFn: createPlayer, onSuccess: refresh });
}

export function useUpdatePlayer() {
  const refresh = useRefreshAfterPlayerChange();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePlayerInput }) =>
      updatePlayer(id, input),
    onSuccess: refresh,
  });
}

export function useUpdatePlayerCondition() {
  const refresh = useRefreshAfterPlayerChange();
  return useMutation({
    mutationFn: ({ id, condition }: { id: number; condition: Condition }) =>
      updatePlayerCondition(id, condition),
    onSuccess: refresh,
  });
}

export function useDeletePlayer() {
  const refresh = useRefreshAfterPlayerChange();
  return useMutation({ mutationFn: deletePlayer, onSuccess: refresh });
}
