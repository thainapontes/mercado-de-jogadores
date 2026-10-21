import {
  QueryId,
  QueryList,
  splitQueryList,
} from '../../common/query/query-params';
import { TRANSACTION_TYPES, TransactionType } from '../../domain/types';

export class ListTransactionsQueryDto {
  @QueryList('type', TRANSACTION_TYPES, {
    maxItems: TRANSACTION_TYPES.length,
    keyOf: (type) => type,
  })
  type?: string;

  @QueryId('player_id')
  player_id?: string;
}

export interface TransactionFilter {
  types?: TransactionType[];
  playerId?: number;
}

export function toTransactionFilter(
  query: ListTransactionsQueryDto,
): TransactionFilter {
  return {
    types: query.type
      ? (splitQueryList(query.type) as TransactionType[])
      : undefined,
    playerId:
      query.player_id === undefined ? undefined : Number(query.player_id),
  };
}
