import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { findClub, findClubForUpdate } from '../clubs/club.queries';
import { ClockService } from '../common/clock/clock.service';
import { fitsFormation } from '../domain/lineup';
import { Position } from '../domain/types';
import { lockPlayers } from '../players/player.queries';
import { sortByRosterOrder } from '../players/roster';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLineupDto } from './dto/update-lineup.dto';
import { LineupResponse, toLineupResponse } from './lineup.mapper';

@Injectable()
export class LineupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async findOne(clubId: number): Promise<LineupResponse> {
    const club = await findClub(this.prisma, clubId);
    const starters = await this.prisma.player.findMany({
      where: { lineup: { is: { clubId } } },
    });
    return toLineupResponse(club, sortByRosterOrder(starters));
  }

  async update(clubId: number, dto: UpdateLineupDto): Promise<LineupResponse> {
    const now = this.clock.now();
    await this.prisma.$transaction(async (tx) => {
      const club = await findClubForUpdate(tx, clubId);
      await lockPlayers(tx, dto.player_ids);
      const players = await tx.player.findMany({
        where: { id: { in: dto.player_ids }, deletedAt: null },
      });
      if (players.length !== dto.player_ids.length) {
        throw new NotFoundException('Jogador não encontrado.');
      }
      if (players.some((player) => player.clubId !== club.id)) {
        throw new ConflictException(
          'Todos os titulares precisam ser do elenco do clube.',
        );
      }
      if (players.some((player) => player.condition === 'DOENTE')) {
        throw new ConflictException('Jogador DOENTE não pode ser escalado.');
      }
      const positions = players.map((player) => player.position as Position);
      if (!fitsFormation(positions, dto.formation)) {
        throw new ConflictException(
          `As posições não fecham a formação ${dto.formation}: é preciso 1 GOL e os jogadores de linha de cada setor.`,
        );
      }

      await tx.club.update({
        where: { id: clubId },
        data: { formation: dto.formation },
      });
      await tx.lineup.deleteMany({ where: { clubId } });
      await tx.lineup.createMany({
        data: dto.player_ids.map((playerId) => ({
          clubId,
          playerId,
          createdAt: now,
        })),
      });
    });
    return this.findOne(clubId);
  }
}
