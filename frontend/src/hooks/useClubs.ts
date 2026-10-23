import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClub, getClub, listClubs, type ClubSort } from '../api/clubs';
import { queryKeys } from './queryKeys';

export function useClubs(sort: ClubSort = 'name') {
  return useQuery({
    queryKey: [...queryKeys.clubs, sort],
    queryFn: () => listClubs(sort),
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: [...queryKeys.club, id],
    queryFn: () => getClub(id),
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClub,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.clubs }),
        queryClient.invalidateQueries({ queryKey: queryKeys.standings }),
      ]),
  });
}
