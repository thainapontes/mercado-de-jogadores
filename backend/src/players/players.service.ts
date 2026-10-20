import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { calculateBaseValue } from '../domain/base-value';
import { calculateOverall } from '../domain/overall';
import { Player } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse, toPlayerResponse } from './player.mapper';

const PLAYER_NOT_FOUND = 'Jogador não encontrado.';
const CHANGED_MEANWHILE =
  'O jogador foi alterado por outra operação. Consulte de novo e tente outra vez.';

@Injectable()
export class PlayersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async create(dto: CreatePlayerDto): Promise<PlayerResponse> {
    const attributes = {
      pace: dto.pace,
      shooting: dto.shooting,
      passing: dto.passing,
      dribbling: dto.dribbling,
      defending: dto.defending,
      physical: dto.physical,
    };
    const overall = calculateOverall(dto.position, attributes);
    const player = await this.prisma.player.create({
      data: {
        name: dto.name,
        position: dto.position,
        agility: dto.agility,
        age: dto.age,
        condition: 'APTO',
        ...attributes,
        potential: dto.potential,
        baseValue: calculateBaseValue(overall, dto.potential, dto.age),
      },
    });
    return toPlayerResponse(player);
  }

  async findOne(id: number): Promise<PlayerResponse> {
    return toPlayerResponse(await this.findActive(id));
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<PlayerResponse> {
    const player = await this.findActive(id);
    if (player.clubId !== null && dto.position !== player.position) {
      throw new ConflictException(
        'Jogador com clube não pode mudar de posição.',
      );
    }
    if (dto.age < player.age) {
      throw new ConflictException(
        `A idade não pode diminuir: a atual é ${player.age}.`,
      );
    }

    const { count } = await this.prisma.player.updateMany({
      where: {
        id,
        deletedAt: null,
        age: { lte: dto.age },
        OR: [{ clubId: null }, { position: dto.position }],
      },
      data: {
        name: dto.name,
        position: dto.position,
        agility: dto.agility,
        age: dto.age,
      },
    });
    if (count === 0) {
      throw new ConflictException(CHANGED_MEANWHILE);
    }
    return this.findOne(id);
  }

  async updateCondition(
    id: number,
    dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    const player = await this.findActive(id);
    if (player.condition === 'DOENTE' && dto.condition === 'APTO') {
      throw new ConflictException(
        'Jogador DOENTE não pode passar direto para APTO: passe antes por MAL_CONDICIONADO.',
      );
    }
    if (dto.condition === player.condition) {
      return toPlayerResponse(player);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.player.updateMany({
        where: { id, deletedAt: null, condition: player.condition },
        data: { condition: dto.condition },
      });
      if (count === 0) {
        throw new ConflictException(CHANGED_MEANWHILE);
      }
      if (dto.condition === 'DOENTE') {
        await tx.lineup.deleteMany({ where: { playerId: id } });
      }
      return tx.player.findUniqueOrThrow({ where: { id } });
    });
    return toPlayerResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const player = await this.findActive(id);
    if (player.clubId !== null) {
      throw new ConflictException(
        'Só jogador livre pode ser excluído: venda-o antes.',
      );
    }

    const { count } = await this.prisma.player.updateMany({
      where: { id, deletedAt: null, clubId: null },
      data: { deletedAt: this.clock.now() },
    });
    if (count === 0) {
      throw new ConflictException(CHANGED_MEANWHILE);
    }
  }

  private async findActive(id: number): Promise<Player> {
    const player = await this.prisma.player.findFirst({
      where: { id, deletedAt: null },
    });
    if (!player) {
      throw new NotFoundException(PLAYER_NOT_FOUND);
    }
    return player;
  }
}
