import { QueryEnum } from '../../common/query/query-params';
import { CLUB_SORTS, ClubSort } from '../../domain/club-value';

const DEFAULT_SORT: ClubSort = 'name';

export class ListClubsQueryDto {
  @QueryEnum('sort', CLUB_SORTS)
  sort?: string;
}

export function toClubSort(query: ListClubsQueryDto): ClubSort {
  return (query.sort as ClubSort | undefined) ?? DEFAULT_SORT;
}
