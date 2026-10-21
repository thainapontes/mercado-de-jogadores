import { Injectable } from '@nestjs/common';
import { findClub } from '../clubs/club.queries';
import { summarizeTransactions } from '../domain/transaction-summary';
import { TransactionType } from '../domain/types';
import { Transaction } from '../generated/prisma/client';
import { findActivePlayer } from '../players/player.queries';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionFilter } from './dto/list-transactions.query';
import {
  TransactionHistoryResponse,
  toTransactionHistoryResponse,
} from './transaction.mapper';
import { toTransactionsCsv } from './transactions-csv';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async history(
    clubId: number,
    filter: TransactionFilter,
  ): Promise<TransactionHistoryResponse> {
    const transactions = await this.find(clubId, filter);
    const summary = summarizeTransactions(
      transactions.map((transaction) => ({
        ...transaction,
        type: transaction.type as TransactionType,
      })),
    );
    return toTransactionHistoryResponse(transactions, summary);
  }

  async exportCsv(clubId: number, filter: TransactionFilter): Promise<string> {
    return toTransactionsCsv(await this.find(clubId, filter));
  }

  private async find(
    clubId: number,
    filter: TransactionFilter,
  ): Promise<Transaction[]> {
    await findClub(this.prisma, clubId);
    if (filter.playerId !== undefined) {
      await findActivePlayer(this.prisma, filter.playerId);
    }
    return this.prisma.transaction.findMany({
      where: {
        clubId,
        playerId: filter.playerId,
        type: filter.types ? { in: filter.types } : undefined,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }
}
