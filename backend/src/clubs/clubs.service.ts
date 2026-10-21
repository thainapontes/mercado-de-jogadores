import { ConflictException, Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { ClubSort, compareClubs } from '../domain/club-value';
import { sortByRosterOrder } from '../players/roster';
import { isUniqueViolation } from '../prisma/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClubDetailResponse,
  ClubResponse,
  clubValuesOf,
  toClubDetailResponse,
  toClubResponse,
} from './club.mapper';
import { findClub } from './club.queries';
import { CreateClubDto } from './dto/create-club.dto';

const MAX_CLUBS = 20;
const NAME_TAKEN = 'Já existe um clube com esse nome.';
const ACRONYM_TAKEN = 'Já existe um clube com essa sigla.';
const NAME_OR_ACRONYM_TAKEN = 'Já existe um clube com esse nome ou essa sigla.';

@Injectable()
export class ClubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async create(dto: CreateClubDto): Promise<ClubResponse> {
    try {
      const club = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`LOCK TABLE clubes IN SHARE ROW EXCLUSIVE MODE`;
        if ((await tx.club.count()) >= MAX_CLUBS) {
          throw new ConflictException(
            `A liga já tem o máximo de ${MAX_CLUBS} clubes.`,
          );
        }
        const sameName = await tx.club.findFirst({
          where: { name: { equals: dto.name, mode: 'insensitive' } },
        });
        if (sameName) {
          throw new ConflictException(NAME_TAKEN);
        }
        const sameAcronym = await tx.club.findUnique({
          where: { acronym: dto.acronym },
        });
        if (sameAcronym) {
          throw new ConflictException(ACRONYM_TAKEN);
        }
        return tx.club.create({
          data: { name: dto.name, acronym: dto.acronym },
        });
      });
      return toClubResponse(club, clubValuesOf(club, []));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(NAME_OR_ACRONYM_TAKEN);
      }
      throw error;
    }
  }

  async list(sort: ClubSort): Promise<ClubResponse[]> {
    const clubs = await this.prisma.club.findMany({
      include: { players: { where: { deletedAt: null } } },
    });
    return clubs
      .map((club) => {
        const values = clubValuesOf(club, club.players);
        return {
          id: club.id,
          name: club.name,
          netWorth: values.netWorth,
          response: toClubResponse(club, values),
        };
      })
      .sort(compareClubs(sort))
      .map(({ response }) => response);
  }

  async findOne(id: number): Promise<ClubDetailResponse> {
    const club = await findClub(this.prisma, id);
    const [roster, activeContracts] = await Promise.all([
      this.prisma.player.findMany({ where: { clubId: id, deletedAt: null } }),
      this.prisma.contract.findMany({ where: { clubId: id, status: 'ATIVO' } }),
    ]);
    return toClubDetailResponse(
      club,
      sortByRosterOrder(roster),
      activeContracts,
      this.clock.now(),
    );
  }
}
