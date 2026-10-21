import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import {
  ListTransactionsQueryDto,
  toTransactionFilter,
} from './dto/list-transactions.query';
import { TransactionHistoryResponse } from './transaction.mapper';
import { TransactionsService } from './transactions.service';

@ApiTags('market')
@Controller('clubs/:id/transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  history(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionHistoryResponse> {
    return this.transactions.history(id, toTransactionFilter(query));
  }

  @Get('export')
  @ApiProduces('text/csv')
  async export(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.transactions.exportCsv(
      id,
      toTransactionFilter(query),
    );
    response.type('text/csv');
    return csv;
  }
}
