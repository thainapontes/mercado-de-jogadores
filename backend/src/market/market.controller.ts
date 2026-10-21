import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { BuyPlayerDto, toPurchaseOrder } from './dto/buy-player.dto';
import { MarketService } from './market.service';
import { PurchaseResponse, SaleResponse } from './transaction.mapper';

@ApiTags('market')
@Controller('players')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return this.market.buy(id, toPurchaseOrder(dto));
  }

  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  sell(@Param('id', ParseIdPipe) id: number): Promise<SaleResponse> {
    return this.market.sell(id);
  }
}
