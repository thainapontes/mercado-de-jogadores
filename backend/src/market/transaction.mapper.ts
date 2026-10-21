import { formatApiDateTime } from '../common/dates/api-date-time';
import { Decimal } from '../domain/money';
import { Sale } from '../domain/sale';
import { TransactionType } from '../domain/types';
import { Contract, Transaction } from '../generated/prisma/client';

export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface PurchaseResponse extends TransactionResponse {
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: string;
  };
  club_cash: number;
}

export interface SaleResponse extends TransactionResponse {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

export function toTransactionResponse(
  transaction: Transaction,
): TransactionResponse {
  return {
    id: transaction.id,
    club_id: transaction.clubId,
    player_id: transaction.playerId,
    player_name: transaction.playerName,
    type: transaction.type as TransactionType,
    value: transaction.value.toNumber(),
    fee: transaction.fee.toNumber(),
    penalty: transaction.penalty.toNumber(),
    profit: transaction.profit === null ? null : transaction.profit.toNumber(),
    cash_change: transaction.cashChange.toNumber(),
    created_at: formatApiDateTime(transaction.createdAt),
  };
}

export function toPurchaseResponse(
  transaction: Transaction,
  contract: Contract,
  clubCash: Decimal,
): PurchaseResponse {
  return {
    ...toTransactionResponse(transaction),
    contract: {
      purchase_value: contract.purchaseValue.toNumber(),
      loyalty_until: formatApiDateTime(contract.loyaltyUntil),
      status: contract.status,
    },
    club_cash: clubCash.toNumber(),
  };
}

export function toSaleResponse(
  transaction: Transaction,
  contract: Contract,
  sale: Sale,
  clubCash: Decimal,
): SaleResponse {
  return {
    ...toTransactionResponse(transaction),
    purchase_value: contract.purchaseValue.toNumber(),
    remaining_days: sale.remainingDays,
    penalty_rate: sale.penaltyRate,
    contract_status: sale.contractStatus,
    club_cash: clubCash.toNumber(),
  };
}
