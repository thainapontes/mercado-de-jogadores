import { MAX_ID } from '../../common/ids/max-id';
import {
  isQueryDecimal,
  isQueryInteger,
  QueryDecimal,
  QueryEnum,
  QueryId,
  QueryInteger,
  QueryList,
  QuerySearch,
  splitQueryList,
} from '../../common/query/query-params';
import { Satisfies } from '../../common/validation/satisfies';
import { Decimal } from '../../domain/money';
import {
  PLAYER_SORTS,
  PlayerSort,
  sortField,
} from '../../domain/player-listing';
import { Condition, CONDITIONS, Position, POSITIONS } from '../../domain/types';
import { AGE_MAX, AGE_MIN } from './player-rules';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;
const VALUE_FILTER_MAX = 550;
const LIMIT_MAX = 50;
const DEFAULT_SORT: PlayerSort = 'name';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_SORTS = 2;

export class ListPlayersQueryDto {
  @QuerySearch('search', SEARCH_MIN_LENGTH, SEARCH_MAX_LENGTH)
  search?: string;

  @QueryEnum('position', POSITIONS)
  position?: string;

  @QueryEnum('condition', CONDITIONS)
  condition?: string;

  @QueryEnum('free', ['true', 'false'])
  free?: string;

  @QueryId('club_id')
  @Satisfies<ListPlayersQueryDto>(
    'clubWithoutFree',
    (_, query) => query.free !== 'true',
    'Use free=true ou club_id, não os dois: jogador livre não tem clube.',
  )
  club_id?: string;

  @QueryInteger('min_age', AGE_MIN, AGE_MAX)
  min_age?: string;

  @QueryInteger('max_age', AGE_MIN, AGE_MAX)
  @Satisfies<ListPlayersQueryDto>(
    'ageRange',
    (maxAge, query) =>
      !isQueryInteger(maxAge) ||
      !isQueryInteger(query.min_age) ||
      Number(query.min_age) <= Number(maxAge),
    'O min_age não pode ser maior que o max_age.',
  )
  max_age?: string;

  @QueryDecimal('min_value', VALUE_FILTER_MAX)
  min_value?: string;

  @QueryDecimal('max_value', VALUE_FILTER_MAX)
  @Satisfies<ListPlayersQueryDto>(
    'valueRange',
    (maxValue, query) =>
      !isQueryDecimal(maxValue) ||
      !isQueryDecimal(query.min_value) ||
      new Decimal(query.min_value).lte(maxValue),
    'O min_value não pode ser maior que o max_value.',
  )
  max_value?: string;

  @QueryList('sort', PLAYER_SORTS, { maxItems: MAX_SORTS, keyOf: sortField })
  sort?: string;

  @QueryInteger('page', 1, MAX_ID)
  page?: string;

  @QueryInteger('limit', 1, LIMIT_MAX)
  limit?: string;
}

export interface PlayerListCriteria {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
  minValue?: Decimal;
  maxValue?: Decimal;
  sorts: PlayerSort[];
  page: number;
  limit: number;
}

export function toPlayerListCriteria(
  query: ListPlayersQueryDto,
): PlayerListCriteria {
  return {
    search: query.search,
    position: query.position as Position | undefined,
    condition: query.condition as Condition | undefined,
    free: query.free === undefined ? undefined : query.free === 'true',
    clubId: optionalNumber(query.club_id),
    minAge: optionalNumber(query.min_age),
    maxAge: optionalNumber(query.max_age),
    minValue: optionalDecimal(query.min_value),
    maxValue: optionalDecimal(query.max_value),
    sorts: query.sort
      ? (splitQueryList(query.sort) as PlayerSort[])
      : [DEFAULT_SORT],
    page: optionalNumber(query.page) ?? DEFAULT_PAGE,
    limit: optionalNumber(query.limit) ?? DEFAULT_LIMIT,
  };
}

function optionalNumber(value: string | undefined): number | undefined {
  return value === undefined ? undefined : Number(value);
}

function optionalDecimal(value: string | undefined): Decimal | undefined {
  return value === undefined ? undefined : new Decimal(value);
}
