import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, TestClock } from './support/create-test-app';
import { expectJsonError } from './support/expect-json-error';
import { clearDatabase } from './support/test-database';

const NOW = new Date('2026-11-12T18:00:00.000Z');
const LOYALTY_UNTIL = '2027-03-02T10:15-03:00';

type Attributes = Partial<
  Record<'shooting' | 'passing' | 'dribbling' | 'defending', number>
>;

interface Team {
  club: number;
  gol: number;
  zag: number;
  lat: number;
  mei: number;
  ata: number;
}

interface LineupBody {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: { id: number; position: string }[];
}

describe('Liga: escalação, partidas e classificação (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let clock: TestClock;

  beforeAll(async () => {
    ({ app, prisma, clock } = await createTestApp(NOW));
  });

  beforeEach(async () => {
    clock.set(NOW);
    await clearDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  async function createClub(name: string, acronym: string): Promise<number> {
    const response = await api()
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return (response.body as { id: number }).id;
  }

  async function signPlayer(
    club: number | null,
    name: string,
    position: string,
    attributes: Attributes = {},
  ): Promise<number> {
    const stats = {
      pace: 40,
      shooting: 40,
      passing: 40,
      dribbling: 40,
      defending: 40,
      physical: 40,
      ...attributes,
    };
    const response = await api()
      .post('/api/v1/players')
      .send({
        name,
        position,
        agility: 60,
        age: 25,
        ...stats,
        potential: Math.max(...Object.values(stats)),
      })
      .expect(201);
    const id = (response.body as { id: number }).id;
    if (club !== null) {
      await api()
        .post(`/api/v1/players/${id}/buy`)
        .send({ club_id: club, loyalty_until: LOYALTY_UNTIL })
        .expect(200);
    }
    return id;
  }

  async function aguiasFc(): Promise<Team> {
    const club = await createClub('Águias FC', 'AGU');
    const team = {
      club,
      gol: await signPlayer(club, 'Rui Prado', 'GOL', { defending: 77 }),
      lat: await signPlayer(club, 'Davi Lins', 'LAT', {
        dribbling: 74,
        defending: 66,
      }),
      zag: await signPlayer(club, 'Téo Brandão', 'ZAG', { defending: 84 }),
      mei: await signPlayer(club, 'Lauro Neves', 'MEI', { passing: 82 }),
      ata: await signPlayer(club, 'Otto Rangel', 'ATA', { shooting: 75 }),
    };
    await setCondition(team.lat, 'MAL_CONDICIONADO');
    return team;
  }

  async function deltaFc(): Promise<Team> {
    const club = await createClub('Delta FC', 'DFC');
    return {
      club,
      gol: await signPlayer(club, 'Ivo Teles', 'GOL', { defending: 72 }),
      zag: await signPlayer(club, 'Hugo Vaz', 'ZAG', { defending: 84 }),
      lat: await signPlayer(club, 'Lino Matos', 'LAT', {
        dribbling: 79,
        defending: 63,
      }),
      mei: await signPlayer(club, 'Nei Soares', 'MEI', { passing: 70 }),
      ata: await signPlayer(club, 'Ugo Falcão', 'ATA', { shooting: 81 }),
    };
  }

  async function setCondition(player: number, condition: string) {
    await api()
      .patch(`/api/v1/players/${player}/condition`)
      .send({ condition })
      .expect(200);
  }

  function putLineup(club: number, body: object) {
    return api().put(`/api/v1/clubs/${club}/lineup`).send(body);
  }

  async function saveLineup(team: Team) {
    await putLineup(team.club, {
      formation: '2-1-1',
      player_ids: [team.ata, team.lat, team.gol, team.mei, team.zag],
    }).expect(200);
  }

  async function lineupOf(club: number): Promise<LineupBody> {
    return (await api().get(`/api/v1/clubs/${club}/lineup`).expect(200))
      .body as LineupBody;
  }

  async function savedLineups() {
    return {
      clubs: await prisma.club.findMany({ orderBy: { id: 'asc' } }),
      lineups: await prisma.lineup.findMany({
        select: { clubId: true, playerId: true },
        orderBy: { playerId: 'asc' },
      }),
    };
  }

  describe('PUT e GET /clubs/{id}/lineup', () => {
    it('clube sem escalação: formation null, complete false e players vazio', async () => {
      const club = await createClub('Águias FC', 'AGU');
      expect(await lineupOf(club)).toEqual({
        club_id: club,
        formation: null,
        complete: false,
        players: [],
      });
    });

    it('escala os 5 em qualquer ordem e devolve na ordem do elenco (2.4.1)', async () => {
      const team = await aguiasFc();
      const cashBefore = (
        await prisma.club.findUniqueOrThrow({ where: { id: team.club } })
      ).cash;
      const response = await putLineup(team.club, {
        formation: '2-1-1',
        player_ids: [team.ata, team.lat, team.gol, team.mei, team.zag],
      }).expect(200);
      const body = response.body as LineupBody;
      expect(body).toMatchObject({
        club_id: team.club,
        formation: '2-1-1',
        complete: true,
      });
      expect(body.players.map(({ id }) => id)).toEqual([
        team.gol,
        team.zag,
        team.lat,
        team.mei,
        team.ata,
      ]);
      expect(body.players[2]).toMatchObject({
        name: 'Davi Lins',
        condition: 'MAL_CONDICIONADO',
        dribbling: 74,
        defending: 66,
        market_value: expect.any(Number) as number,
        club_id: team.club,
      });
      expect(await lineupOf(team.club)).toEqual(body);
      const club = await prisma.club.findUniqueOrThrow({
        where: { id: team.club },
      });
      expect(club.cash).toEqual(cashBefore);
    });

    it('substitui a escalação inteira', async () => {
      const team = await aguiasFc();
      await saveLineup(team);
      const reserveLat = await signPlayer(team.club, 'Zico Reserva', 'LAT');
      await putLineup(team.club, {
        formation: '3-1',
        player_ids: [team.gol, team.zag, team.lat, reserveLat, team.ata],
      }).expect(200);
      const lineup = await lineupOf(team.club);
      expect(lineup.formation).toBe('3-1');
      expect(lineup.players.map(({ id }) => id)).toEqual([
        team.gol,
        team.zag,
        team.lat,
        reserveLat,
        team.ata,
      ]);
      expect(await prisma.lineup.count()).toBe(5);
    });

    it('titular vendido ou DOENTE sai, a formação fica e complete vira false (RN19 item 5)', async () => {
      const team = await aguiasFc();
      await saveLineup(team);
      await api().post(`/api/v1/players/${team.ata}/sell`).expect(200);
      await setCondition(team.mei, 'DOENTE');
      const lineup = await lineupOf(team.club);
      expect(lineup).toMatchObject({ formation: '2-1-1', complete: false });
      expect(lineup.players.map(({ id }) => id)).toEqual([
        team.gol,
        team.zag,
        team.lat,
      ]);
      await setCondition(team.mei, 'MAL_CONDICIONADO');
      expect((await lineupOf(team.club)).players).toHaveLength(3);
    });

    it.each([
      ['sem formation', { formation: undefined }],
      ['formation nula', { formation: null }],
      ['formation fora da lista', { formation: '4-0' }],
      ['formation com espaço', { formation: '2-1-1 ' }],
      ['sem player_ids', { player_ids: undefined }],
      ['player_ids nulo', { player_ids: null }],
      ['player_ids que não é lista', { player_ids: '1,2,3,4,5' }],
      ['player_ids com 4', { player_ids: [1, 2, 3, 4] }],
      ['player_ids com 6', { player_ids: [1, 2, 3, 4, 5, 6] }],
      ['player_ids repetido', { player_ids: [1, 2, 3, 4, 4] }],
      ['player_ids com zero', { player_ids: [0, 1, 2, 3, 4] }],
      ['player_ids com negativo', { player_ids: [-1, 1, 2, 3, 4] }],
      ['player_ids com texto', { player_ids: ['1', 2, 3, 4, 5] }],
      ['player_ids fracionário', { player_ids: [1.5, 2, 3, 4, 5] }],
    ])('recusa %s (400), sem gravar', async (_, change) => {
      const team = await aguiasFc();
      await saveLineup(team);
      const before = await savedLineups();
      const body = {
        formation: '2-1-1',
        player_ids: [team.ata, team.lat, team.gol, team.mei, team.zag],
        ...change,
      };
      expectJsonError(await putLineup(team.club, body), 400);
      expect(await savedLineups()).toEqual(before);
    });

    it('clube inexistente ou jogador inexistente/excluído → 404', async () => {
      const team = await aguiasFc();
      const ids = [team.ata, team.lat, team.gol, team.mei, team.zag];
      expectJsonError(
        await putLineup(999, { formation: '2-1-1', player_ids: ids }),
        404,
      );
      expectJsonError(await api().get('/api/v1/clubs/999/lineup'), 404);
      const deleted = await signPlayer(null, 'Ex Jogador', 'ATA');
      await api().delete(`/api/v1/players/${deleted}`).expect(204);
      for (const missing of [999, deleted]) {
        expectJsonError(
          await putLineup(team.club, {
            formation: '2-1-1',
            player_ids: [missing, ...ids.slice(1)],
          }),
          404,
        );
      }
      expect(await prisma.lineup.count()).toBe(0);
    });

    it('recusa jogador de outro clube, livre, DOENTE ou que não fecha a formação (409), sem gravar', async () => {
      const team = await aguiasFc();
      const delta = await deltaFc();
      await saveLineup(team);
      const free = await signPlayer(null, 'Livre Atacante', 'ATA');
      const sick = await signPlayer(team.club, 'Zeca Doente', 'ATA');
      await setCondition(sick, 'DOENTE');
      const before = await savedLineups();
      const base = [team.gol, team.zag, team.lat, team.mei];
      for (const body of [
        { formation: '2-1-1', player_ids: [...base, delta.ata] },
        { formation: '2-1-1', player_ids: [...base, free] },
        { formation: '2-1-1', player_ids: [...base, sick] },
        { formation: '2-2', player_ids: [...base, team.ata] },
        { formation: '1-2-1', player_ids: [...base, team.ata] },
      ]) {
        expectJsonError(await putLineup(team.club, body), 409);
      }
      expect(await savedLineups()).toEqual(before);
    });
  });

  describe('POST /matches', () => {
    it('joga Águias FC × Delta FC: 1 × 2, VISITANTE, com os 6 duelos (RN20)', async () => {
      const home = await aguiasFc();
      const away = await deltaFc();
      await saveLineup(home);
      await saveLineup(away);
      const before = {
        clubs: await prisma.club.findMany({ orderBy: { id: 'asc' } }),
        players: await prisma.player.findMany({ orderBy: { id: 'asc' } }),
        lineups: await prisma.lineup.count(),
      };

      const response = await api()
        .post('/api/v1/matches')
        .send({ home_club_id: home.club, away_club_id: away.club })
        .expect(201);
      const body = response.body as { id: number };
      expect(response.headers.location).toBe(`/api/v1/matches/${body.id}`);

      const side = (club: number, name: string, goals: number) => ({
        club_id: club,
        club_name: name,
        formation: '2-1-1',
        goals,
      });
      const player = (
        id: number,
        name: string,
        position: string,
        attribute: string,
        value: number,
        condition = 'APTO',
      ) => ({
        player_id: id,
        player_name: name,
        position,
        condition,
        attribute,
        value,
      });
      const expected = {
        id: body.id,
        played_at: '2026-11-12T15:00:00-03:00',
        home: side(home.club, 'Águias FC', 1),
        away: side(away.club, 'Delta FC', 2),
        result: 'VISITANTE',
        duels: [
          {
            order: 1,
            attacking_club_id: home.club,
            attacker: player(home.ata, 'Otto Rangel', 'ATA', 'shooting', 75),
            defender: player(away.gol, 'Ivo Teles', 'GOL', 'defending', 72),
            goal: true,
          },
          {
            order: 2,
            attacking_club_id: home.club,
            attacker: player(home.mei, 'Lauro Neves', 'MEI', 'passing', 82),
            defender: player(away.zag, 'Hugo Vaz', 'ZAG', 'defending', 84),
            goal: false,
          },
          {
            order: 3,
            attacking_club_id: home.club,
            attacker: player(
              home.lat,
              'Davi Lins',
              'LAT',
              'dribbling',
              63,
              'MAL_CONDICIONADO',
            ),
            defender: player(away.lat, 'Lino Matos', 'LAT', 'defending', 63),
            goal: false,
          },
          {
            order: 4,
            attacking_club_id: away.club,
            attacker: player(away.ata, 'Ugo Falcão', 'ATA', 'shooting', 81),
            defender: player(home.gol, 'Rui Prado', 'GOL', 'defending', 77),
            goal: true,
          },
          {
            order: 5,
            attacking_club_id: away.club,
            attacker: player(away.mei, 'Nei Soares', 'MEI', 'passing', 70),
            defender: player(home.zag, 'Téo Brandão', 'ZAG', 'defending', 84),
            goal: false,
          },
          {
            order: 6,
            attacking_club_id: away.club,
            attacker: player(away.lat, 'Lino Matos', 'LAT', 'dribbling', 79),
            defender: player(
              home.lat,
              'Davi Lins',
              'LAT',
              'defending',
              56,
              'MAL_CONDICIONADO',
            ),
            goal: true,
          },
        ],
      };
      expect(body).toEqual(expected);

      expect({
        clubs: await prisma.club.findMany({ orderBy: { id: 'asc' } }),
        players: await prisma.player.findMany({ orderBy: { id: 'asc' } }),
        lineups: await prisma.lineup.count(),
      }).toEqual(before);

      await api()
        .put(`/api/v1/players/${home.ata}`)
        .send({ name: 'Otto Novo', position: 'ATA', agility: 60, age: 26 })
        .expect(200);
      await setCondition(home.lat, 'APTO');
      const saved = await api().get(`/api/v1/matches/${body.id}`).expect(200);
      expect(saved.body).toEqual(expected);
    });

    it('clube com escalação incompleta ou sem escalação não joga (409)', async () => {
      const home = await aguiasFc();
      const away = await deltaFc();
      await saveLineup(home);
      expectJsonError(
        await api()
          .post('/api/v1/matches')
          .send({ home_club_id: home.club, away_club_id: away.club }),
        409,
      );
      await saveLineup(away);
      await api().post(`/api/v1/players/${away.ata}/sell`).expect(200);
      expectJsonError(
        await api()
          .post('/api/v1/matches')
          .send({ home_club_id: home.club, away_club_id: away.club }),
        409,
      );
      expect(await prisma.match.count()).toBe(0);
    });

    it.each([
      ['mandante igual ao visitante', { away_club_id: 'HOME' }],
      ['sem home_club_id', { home_club_id: undefined }],
      ['away_club_id nulo', { away_club_id: null }],
      ['home_club_id 0', { home_club_id: 0 }],
      ['away_club_id negativo', { away_club_id: -2 }],
      ['home_club_id texto', { home_club_id: '1' }],
      ['away_club_id fracionário', { away_club_id: 2.5 }],
      ['homeClubId em camelCase', { home_club_id: undefined, homeClubId: 1 }],
    ])('recusa %s (400)', async (_, change) => {
      const home = await createClub('Águias FC', 'AGU');
      const away = await createClub('Delta FC', 'DFC');
      const body: Record<string, unknown> = {
        home_club_id: home,
        away_club_id: away,
        ...change,
      };
      if (body.away_club_id === 'HOME') {
        body.away_club_id = home;
      }
      expectJsonError(await api().post('/api/v1/matches').send(body), 400);
      expect(await prisma.match.count()).toBe(0);
    });

    it('clube inexistente → 404', async () => {
      const home = await createClub('Águias FC', 'AGU');
      expectJsonError(
        await api()
          .post('/api/v1/matches')
          .send({ home_club_id: home, away_club_id: 999 }),
        404,
      );
    });
  });

  describe('GET /matches, GET /matches/{id} e GET /standings', () => {
    async function play(home: number, away: number, at: Date) {
      clock.set(at);
      const response = await api()
        .post('/api/v1/matches')
        .send({ home_club_id: home, away_club_id: away })
        .expect(201);
      return (response.body as { id: number }).id;
    }

    it('lista da mais recente para a mais antiga, sem duels, com filtro club_id (RN21)', async () => {
      const aguias = await aguiasFc();
      const delta = await deltaFc();
      const gama = await createClub('Gama SC', 'GSC');
      await saveLineup(aguias);
      await saveLineup(delta);
      const first = await play(aguias.club, delta.club, NOW);
      const second = await play(
        delta.club,
        aguias.club,
        new Date(NOW.getTime() + 60_000),
      );
      const third = await play(
        aguias.club,
        delta.club,
        new Date(NOW.getTime() + 60_000),
      );

      const all = (await api().get('/api/v1/matches').expect(200)).body as {
        id: number;
        duels?: unknown;
        result: string;
      }[];
      expect(all.map(({ id }) => id)).toEqual([third, second, first]);
      expect(all.every((match) => match.duels === undefined)).toBe(true);
      expect(all[1]).toMatchObject({
        home: { club_id: delta.club, goals: 2 },
        away: { club_id: aguias.club, goals: 1 },
        result: 'MANDANTE',
      });

      const ofAguias = await api()
        .get(`/api/v1/matches?club_id=${aguias.club}`)
        .expect(200);
      expect(ofAguias.body).toHaveLength(3);
      const ofGama = await api()
        .get(`/api/v1/matches?club_id=${gama}`)
        .expect(200);
      expect(ofGama.body).toEqual([]);

      const standings = await api().get('/api/v1/standings').expect(200);
      expect(standings.body).toEqual([
        {
          position: 1,
          club_id: delta.club,
          club_name: 'Delta FC',
          played: 3,
          wins: 3,
          draws: 0,
          losses: 0,
          goals_for: 6,
          goals_against: 3,
          goal_difference: 3,
          points: 9,
        },
        {
          position: 2,
          club_id: gama,
          club_name: 'Gama SC',
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0,
        },
        {
          position: 3,
          club_id: aguias.club,
          club_name: 'Águias FC',
          played: 3,
          wins: 0,
          draws: 0,
          losses: 3,
          goals_for: 3,
          goals_against: 6,
          goal_difference: -3,
          points: 0,
        },
      ]);
    });

    it('reproduz a classificação de exemplo com 6 clubes (RN21)', async () => {
      const ids: Record<string, number> = {};
      for (const [name, acronym] of [
        ['Águias FC', 'AGU'],
        ['Delta FC', 'DFC'],
        ['Gama SC', 'GSC'],
        ['Épsilon EC', 'EEC'],
        ['Mangue FC', 'MFC'],
        ['Tubarões EC', 'TEC'],
      ]) {
        ids[name] = await createClub(name, acronym);
      }
      const results: [string, number, number, string][] = [
        ['Águias FC', 1, 2, 'Delta FC'],
        ['Gama SC', 2, 1, 'Épsilon EC'],
        ['Épsilon EC', 3, 2, 'Águias FC'],
        ['Delta FC', 0, 1, 'Gama SC'],
      ];
      for (const [home, homeGoals, awayGoals, away] of results) {
        await prisma.match.create({
          data: {
            homeClubId: ids[home],
            awayClubId: ids[away],
            homeGoals,
            awayGoals,
            homeFormation: '2-1-1',
            awayFormation: '2-1-1',
            playedAt: NOW,
          },
        });
      }
      const response = await api().get('/api/v1/standings').expect(200);
      const rows = response.body as {
        position: number;
        club_name: string;
        points: number;
        goal_difference: number;
        goals_for: number;
      }[];
      expect(
        rows.map((row) => [
          row.position,
          row.club_name,
          row.points,
          row.goal_difference,
          row.goals_for,
        ]),
      ).toEqual([
        [1, 'Gama SC', 6, 2, 3],
        [2, 'Épsilon EC', 3, 0, 4],
        [3, 'Delta FC', 3, 0, 2],
        [4, 'Mangue FC', 0, 0, 0],
        [5, 'Tubarões EC', 0, 0, 0],
        [6, 'Águias FC', 0, -2, 3],
      ]);
    });

    it('sem clubes nem partidas, listas vazias', async () => {
      expect((await api().get('/api/v1/matches').expect(200)).body).toEqual([]);
      expect((await api().get('/api/v1/standings').expect(200)).body).toEqual(
        [],
      );
    });

    it('erros: partida inexistente (404), club_id inexistente (404) ou inválido (400)', async () => {
      expectJsonError(await api().get('/api/v1/matches/999'), 404);
      expectJsonError(await api().get('/api/v1/matches/abc'), 404);
      expectJsonError(await api().get('/api/v1/matches?club_id=999'), 404);
      for (const value of ['', 'abc', '0', '01', '-1']) {
        expectJsonError(
          await api().get(`/api/v1/matches?club_id=${value}`),
          400,
        );
      }
    });
  });
});
