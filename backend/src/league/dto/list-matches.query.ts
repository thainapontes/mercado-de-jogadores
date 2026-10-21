import { QueryId } from '../../common/query/query-params';

export class ListMatchesQueryDto {
  @QueryId('club_id')
  club_id?: string;
}

export function toMatchClubFilter(
  query: ListMatchesQueryDto,
): number | undefined {
  return query.club_id === undefined ? undefined : Number(query.club_id);
}
