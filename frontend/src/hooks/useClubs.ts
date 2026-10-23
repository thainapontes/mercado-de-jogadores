import { useQuery } from '@tanstack/react-query';
import { listClubs, type ClubSort } from '../api/clubs';
import { queryKeys } from './queryKeys';

export function useClubs(sort: ClubSort = 'name') {
  return useQuery({
    queryKey: [...queryKeys.clubs, sort],
    queryFn: () => listClubs(sort),
  });
}
