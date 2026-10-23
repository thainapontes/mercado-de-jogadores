import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMatch,
  getLineup,
  getMatch,
  getStandings,
  listMatches,
  updateLineup,
  type LineupInput,
} from '../api/league';
import { queryKeys } from './queryKeys';

export function useLineup(clubId: string) {
  return useQuery({
    queryKey: [...queryKeys.lineups, clubId],
    queryFn: () => getLineup(clubId),
  });
}

export function useUpdateLineup(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LineupInput) => updateLineup(clubId, input),
    onSuccess: (lineup) =>
      queryClient.setQueryData([...queryKeys.lineups, clubId], lineup),
  });
}

export function useMatches(clubId: string) {
  return useQuery({
    queryKey: [...queryKeys.matches, clubId],
    queryFn: () => listMatches(clubId),
  });
}

export function useMatch(id: number) {
  return useQuery({
    queryKey: [...queryKeys.matches, 'detail', id],
    queryFn: () => getMatch(id),
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.matches }),
        queryClient.invalidateQueries({ queryKey: queryKeys.standings }),
      ]),
  });
}

export function useStandings() {
  return useQuery({ queryKey: queryKeys.standings, queryFn: getStandings });
}
