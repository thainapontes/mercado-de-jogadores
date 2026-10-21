import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { findClubForUpdate } from '../clubs/club.queries';
import { ClockService } from '../common/clock/clock.service';
import { formatMoneyWithComma } from '../common/text/format-decimal';
import {
  calculatePurchase,
  isLoyaltyPeriodValid,
  MAX_LOYALTY_DAYS,
} from '../domain/purchase';
import { calculateSale } from '../domain/sale';
import { marketValueOf } from '../players/player.mapper';
import { findActivePlayer } from '../players/player.queries';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseOrder } from './dto/buy-player.dto';
import {
  PurchaseResponse,
  SaleResponse,
  toPurchaseResponse,
  toSaleResponse,
} from './transaction.mapper';

const MAX_SQUAD_SIZE = 12;
const CHANGED_MEANWHILE =
  'O jogador foi alterado por outra operação. Consulte de novo e tente outra vez.';

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async buy(playerId: number, order: PurchaseOrder): Promise<PurchaseResponse> {
    const now = this.clock.now();
    if (!isLoyaltyPeriodValid(order.loyaltyUntil, now)) {
      throw new BadRequestException(
        `O fim da fidelidade deve ser depois de agora e no máximo ${MAX_LOYALTY_DAYS} dias depois.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const player = await findActivePlayer(tx, playerId);
      const club = await findClubForUpdate(tx, order.clubId);
      if (player.clubId !== null) {
        throw new ConflictException(
          'O jogador não está livre: ele já tem clube.',
        );
      }
      const soldBefore = await tx.transaction.findFirst({
        where: { clubId: club.id, playerId, type: 'VENDA' },
      });
      if (soldBefore) {
        throw new ConflictException(
          'O clube não pode comprar de novo um jogador que ele já vendeu.',
        );
      }
      const squadSize = await tx.player.count({
        where: { clubId: club.id, deletedAt: null },
      });
      if (squadSize >= MAX_SQUAD_SIZE) {
        throw new ConflictException(
          `O elenco já tem o máximo de ${MAX_SQUAD_SIZE} jogadores.`,
        );
      }
      const value = marketValueOf(player);
      const purchase = calculatePurchase(value, club.cash);
      if (purchase.exceedsCashLimit) {
        throw new ConflictException(
          `O custo da compra (${formatMoneyWithComma(purchase.totalCost)}) passa da metade do caixa do clube (${formatMoneyWithComma(club.cash)}).`,
        );
      }

      const { count } = await tx.player.updateMany({
        where: { id: playerId, clubId: null, deletedAt: null },
        data: { clubId: club.id },
      });
      if (count === 0) {
        throw new ConflictException(CHANGED_MEANWHILE);
      }
      const updatedClub = await tx.club.update({
        where: { id: club.id },
        data: { cash: { decrement: purchase.totalCost } },
      });
      const contract = await tx.contract.create({
        data: {
          playerId,
          clubId: club.id,
          purchaseValue: value,
          loyaltyUntil: order.loyaltyUntil,
          status: 'ATIVO',
          startedAt: now,
        },
      });
      const transaction = await tx.transaction.create({
        data: {
          clubId: club.id,
          playerId,
          playerName: player.name,
          type: 'COMPRA',
          value,
          fee: purchase.fee,
          penalty: 0,
          profit: null,
          cashChange: purchase.totalCost.negated(),
          createdAt: now,
        },
      });
      return toPurchaseResponse(transaction, contract, updatedClub.cash);
    });
  }

  async sell(playerId: number): Promise<SaleResponse> {
    const now = this.clock.now();
    return this.prisma.$transaction(async (tx) => {
      const player = await findActivePlayer(tx, playerId);
      if (player.clubId === null) {
        throw new ConflictException(
          'Jogador livre não pode ser vendido: ele não tem clube.',
        );
      }
      const club = await findClubForUpdate(tx, player.clubId);
      const { count } = await tx.player.updateMany({
        where: { id: playerId, clubId: club.id, deletedAt: null },
        data: { clubId: null },
      });
      if (count === 0) {
        throw new ConflictException(CHANGED_MEANWHILE);
      }
      await tx.lineup.deleteMany({ where: { playerId } });

      const contract = await tx.contract.findFirstOrThrow({
        where: { playerId, clubId: club.id, status: 'ATIVO' },
      });
      const value = marketValueOf(player);
      const sale = calculateSale({
        marketValue: value,
        purchaseValue: contract.purchaseValue,
        loyaltyUntil: contract.loyaltyUntil,
        now,
      });
      await tx.contract.update({
        where: { id: contract.id },
        data: { status: sale.contractStatus, endedAt: now },
      });
      const updatedClub = await tx.club.update({
        where: { id: club.id },
        data: { cash: { increment: sale.credit } },
      });
      const transaction = await tx.transaction.create({
        data: {
          clubId: club.id,
          playerId,
          playerName: player.name,
          type: 'VENDA',
          value,
          fee: sale.commission,
          penalty: sale.penalty,
          profit: sale.profit,
          cashChange: sale.credit,
          createdAt: now,
        },
      });
      return toSaleResponse(transaction, contract, sale, updatedClub.cash);
    });
  }
}
