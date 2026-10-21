import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { findClub } from '../clubs/club.queries';
import { ClockService } from '../common/clock/clock.service';
import { isLineupComplete } from '../domain/lineup';
import { Duel, playMatch, Starter } from '../domain/match-engine';
import { calculateStandings } from '../domain/standings';
import { Condition, Position } from '../domain/types';
import { Club, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import {
  MatchResponse,
  MatchSummaryResponse,
  StandingResponse,
  toMatchResponse,
  toMatchSummaryResponse,
  toStandingResponse,
} from './match.mapper';

const WITH_CLUBS = { homeClub: true, awayClub: true } as const;
const WITH_DUELS = { ...WITH_CLUBS, duels: true } as const;

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async create(dto: CreateMatchDto): Promise<MatchResponse> {
    const now = this.clock.now();
    const match = await this.prisma.$transaction(async (tx) => {
      const home = await findClub(tx, dto.home_club_id);
      const away = await findClub(tx, dto.away_club_id);
      const homeStarters = await startersOf(tx, home);
      const awayStarters = await startersOf(tx, away);
      if (
        !isLineupComplete(home.formation, homeStarters.length) ||
        !isLineupComplete(away.formation, awayStarters.length)
      ) {
        throw new ConflictException(
          'Os dois clubes precisam ter a escalação completa, com os 5 titulares.',
        );
      }

      const outcome = playMatch(homeStarters, awayStarters);
      return tx.match.create({
        data: {
          homeClubId: home.id,
          awayClubId: away.id,
          homeGoals: outcome.homeGoals,
          awayGoals: outcome.awayGoals,
          homeFormation: home.formation as string,
          awayFormation: away.formation as string,
          playedAt: now,
          duels: {
            create: outcome.duels.map((duel) =>
              toDuelData(duel, home.id, away.id),
            ),
          },
        },
        include: WITH_DUELS,
      });
    });
    return toMatchResponse(match);
  }

  async list(clubId: number | undefined): Promise<MatchSummaryResponse[]> {
    if (clubId !== undefined) {
      await findClub(this.prisma, clubId);
    }
    const matches = await this.prisma.match.findMany({
      where:
        clubId === undefined
          ? undefined
          : { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      include: WITH_CLUBS,
      orderBy: [{ playedAt: 'desc' }, { id: 'desc' }],
    });
    return matches.map(toMatchSummaryResponse);
  }

  async findOne(id: number): Promise<MatchResponse> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: WITH_DUELS,
    });
    if (!match) {
      throw new NotFoundException('Partida não encontrada.');
    }
    return toMatchResponse(match);
  }

  async standings(): Promise<StandingResponse[]> {
    const [clubs, matches] = await Promise.all([
      this.prisma.club.findMany(),
      this.prisma.match.findMany(),
    ]);
    return calculateStandings(clubs, matches).map(toStandingResponse);
  }
}

async function startersOf(
  tx: Prisma.TransactionClient,
  club: Club,
): Promise<Starter[]> {
  const players = await tx.player.findMany({
    where: { lineup: { is: { clubId: club.id } } },
  });
  return players.map((player) => ({
    ...player,
    position: player.position as Position,
    condition: player.condition as Condition,
  }));
}

function toDuelData(
  duel: Duel,
  homeClubId: number,
  awayClubId: number,
): Prisma.MatchDuelCreateWithoutMatchInput {
  const { attacker, defender } = duel;
  return {
    order: duel.order,
    attackingClub: {
      connect: { id: duel.attackingSide === 'HOME' ? homeClubId : awayClubId },
    },
    attacker: { connect: { id: attacker.player.id } },
    defender: { connect: { id: defender.player.id } },
    attackerName: attacker.player.name,
    defenderName: defender.player.name,
    attackerPosition: attacker.player.position,
    defenderPosition: defender.player.position,
    attackerCondition: attacker.player.condition,
    defenderCondition: defender.player.condition,
    attackAttribute: attacker.attribute,
    defenseAttribute: defender.attribute,
    attackValue: attacker.value,
    defenseValue: defender.value,
    goal: duel.goal,
  };
}
