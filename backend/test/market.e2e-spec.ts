import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Decimal } from '../src/domain/money';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, TestClock } from './support/create-test-app';
import { expectJsonError } from './support/expect-json-error';
import { CHEAP_PLAYER, MEIA_LUA } from './support/fixtures';
import { clearDatabase } from './support/test-database';

const PURCHASE_TIME = new Date('2026-11-02T13:15:00.000Z');
const SALE_TIME = new Date('2026-11-05T19:40:00.000Z');
const LOYALTY_UNTIL = '2027-03-02T10:15-03:00';
const DAY = 86_400_000;

interface ClubDetail {
  cash: number;
  squad_value: number;
  net_worth: number;
  players: {
    id: number;
    market_value: number;
    contract: {
      purchase_value: number;
      loyalty_until: string;
      remaining_days: number;
      penalty_rate: number;
    };
  }[];
}

function apiDate(date: Date): string {
  const brasilia = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return `${brasilia.toISOString().slice(0, 16)}-03:00`;
}

describe('Mercado: compra e venda (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let clock: TestClock;

  beforeAll(async () => {
    ({ app, prisma, clock } = await createTestApp(PURCHASE_TIME));
  });

  beforeEach(async () => {
    clock.set(PURCHASE_TIME);
    await clearDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  async function createClub(name = 'Águias FC', acronym = 'AGU') {
    const response = await api()
      .post('/api/v1/clubs')
      .send({ name, acronym })
      .expect(201);
    return (response.body as { id: number }).id;
  }

  async function createPlayer(change: object = {}): Promise<number> {
    const response = await api()
      .post('/api/v1/players')
      .send({ ...MEIA_LUA, ...change })
      .expect(201);
    return (response.body as { id: number }).id;
  }

  async function setCondition(playerId: number, condition: string) {
    await api()
      .patch(`/api/v1/players/${playerId}/condition`)
      .send({ condition })
      .expect(200);
  }

  function buy(playerId: number, body: object) {
    return api().post(`/api/v1/players/${playerId}/buy`).send(body);
  }

  function sell(playerId: number) {
    return api().post(`/api/v1/players/${playerId}/sell`);
  }

  async function snapshot() {
    return {
      clubs: await prisma.club.findMany({ orderBy: { id: 'asc' } }),
      players: await prisma.player.findMany({ orderBy: { id: 'asc' } }),
      contracts: await prisma.contract.count(),
      transactions: await prisma.transaction.count(),
    };
  }

  async function expectReconciled(clubId: number) {
    const club = await prisma.club.findUniqueOrThrow({ where: { id: clubId } });
    const transactions = await prisma.transaction.findMany({
      where: { clubId },
    });
    const total = transactions.reduce(
      (sum, { cashChange }) => sum.plus(cashChange),
      new Decimal('300.00'),
    );
    expect(total.toFixed(2)).toBe(club.cash.toFixed(2));
  }

  describe('cenário do Meia Lua (2.3.1, 2.2.2 e 2.3.2)', () => {
    it('compra MAL_CONDICIONADO por 37,00 e vende APTO por 40,00 com multa de 10%', async () => {
      const club = await createClub();
      const player = await createPlayer();
      await setCondition(player, 'MAL_CONDICIONADO');

      const purchase = await buy(player, {
        club_id: club,
        loyalty_until: LOYALTY_UNTIL,
      }).expect(200);
      expect(purchase.body).toEqual({
        id: (purchase.body as { id: number }).id,
        club_id: club,
        player_id: player,
        player_name: 'Meia Lua',
        type: 'COMPRA',
        value: 37,
        fee: 1.85,
        penalty: 0,
        profit: null,
        cash_change: -38.85,
        created_at: '2026-11-02T10:15:00-03:00',
        contract: {
          purchase_value: 37,
          loyalty_until: '2027-03-02T10:15:00-03:00',
          status: 'ATIVO',
        },
        club_cash: 261.15,
      });

      const detail = await api().get(`/api/v1/clubs/${club}`).expect(200);
      expect(detail.body).toMatchObject({
        id: club,
        cash: 261.15,
        squad_value: 37,
        net_worth: 298.15,
        players: [
          {
            id: player,
            condition: 'MAL_CONDICIONADO',
            market_value: 37,
            club_id: club,
            contract: {
              purchase_value: 37,
              loyalty_until: '2027-03-02T10:15:00-03:00',
              remaining_days: 120,
              penalty_rate: 10,
            },
          },
        ],
      });
      const listed = await api()
        .get(`/api/v1/players?club_id=${club}`)
        .expect(200);
      expect((listed.body as { data: { id: number }[] }).data).toHaveLength(1);

      await setCondition(player, 'APTO');
      clock.set(SALE_TIME);
      const sale = await sell(player).expect(200);
      expect(sale.body).toEqual({
        id: (sale.body as { id: number }).id,
        club_id: club,
        player_id: player,
        player_name: 'Meia Lua',
        type: 'VENDA',
        value: 40,
        fee: 0.3,
        penalty: 4,
        profit: 3,
        cash_change: 35.7,
        created_at: '2026-11-05T16:40:00-03:00',
        purchase_value: 37,
        remaining_days: 117,
        penalty_rate: 10,
        contract_status: 'RESCINDIDO',
        club_cash: 296.85,
      });

      const contract = await prisma.contract.findFirstOrThrow({
        where: { playerId: player },
      });
      expect(contract.status).toBe('RESCINDIDO');
      expect(contract.endedAt).toEqual(SALE_TIME);
      const free = await api().get('/api/v1/players?free=true').expect(200);
      expect((free.body as { data: { id: number }[] }).data).toEqual([
        expect.objectContaining({ id: player, club_id: null }),
      ]);
      await expectReconciled(club);
    });

    it('ignora o corpo enviado na venda (V1)', async () => {
      const club = await createClub();
      const player = await createPlayer();
      await buy(player, { club_id: club, loyalty_until: LOYALTY_UNTIL }).expect(
        200,
      );
      await api()
        .post(`/api/v1/players/${player}/sell`)
        .set('Content-Type', 'application/json')
        .send('{quebrado')
        .expect(200);
    });
  });

  describe('POST /players/{id}/buy', () => {
    it('aceita custo igual a 50% do caixa e recusa acima (RN13)', async () => {
      const accepted = await createClub();
      const refused = await createClub('Delta FC', 'DFC');
      await prisma.club.update({
        where: { id: accepted },
        data: { cash: '84.00' },
      });
      await prisma.club.update({
        where: { id: refused },
        data: { cash: '83.98' },
      });
      const first = await createPlayer();
      const second = await createPlayer({ name: 'Meia Sol' });

      const before = await snapshot();
      expectJsonError(
        await buy(second, { club_id: refused, loyalty_until: LOYALTY_UNTIL }),
        409,
      );
      expect(await snapshot()).toEqual(before);

      const response = await buy(first, {
        club_id: accepted,
        loyalty_until: LOYALTY_UNTIL,
      }).expect(200);
      expect(response.body).toMatchObject({
        value: 40,
        fee: 2,
        cash_change: -42,
        club_cash: 42,
      });
    });

    it('não cobra taxa até 30,00 (RN13)', async () => {
      const club = await createClub();
      const player = await createPlayer({ ...CHEAP_PLAYER });
      const response = await buy(player, {
        club_id: club,
        loyalty_until: LOYALTY_UNTIL,
      }).expect(200);
      expect(response.body).toMatchObject({
        value: 1,
        fee: 0,
        cash_change: -1,
        club_cash: 299,
      });
    });

    it('recusa jogador que já tem clube (409)', async () => {
      const club = await createClub();
      const other = await createClub('Delta FC', 'DFC');
      const player = await createPlayer();
      await buy(player, { club_id: club, loyalty_until: LOYALTY_UNTIL }).expect(
        200,
      );
      const before = await snapshot();
      expectJsonError(
        await buy(player, { club_id: other, loyalty_until: LOYALTY_UNTIL }),
        409,
      );
      expect(await snapshot()).toEqual(before);
    });

    it('recusa a 13ª compra do elenco (RN14)', async () => {
      const club = await createClub();
      for (let index = 0; index < 12; index++) {
        const player = await createPlayer({
          ...CHEAP_PLAYER,
          name: `Reserva ${'ABCDEFGHIJKL'[index]}`,
        });
        await buy(player, {
          club_id: club,
          loyalty_until: LOYALTY_UNTIL,
        }).expect(200);
      }
      const extra = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Reserva Extra',
      });
      const before = await snapshot();
      expectJsonError(
        await buy(extra, { club_id: club, loyalty_until: LOYALTY_UNTIL }),
        409,
      );
      expect(await snapshot()).toEqual(before);
    });

    it('com duas compras simultâneas do mesmo jogador, só uma passa', async () => {
      const first = await createClub();
      const second = await createClub('Delta FC', 'DFC');
      const player = await createPlayer();
      const responses = await Promise.all(
        [first, second].map((club) =>
          buy(player, { club_id: club, loyalty_until: LOYALTY_UNTIL }),
        ),
      );
      expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
      expect(await prisma.contract.count()).toBe(1);
      expect(await prisma.transaction.count()).toBe(1);
    });

    it('jogador excluído ou inexistente → 404; clube inexistente → 404', async () => {
      const club = await createClub();
      const player = await createPlayer();
      await api().delete(`/api/v1/players/${player}`).expect(204);
      expectJsonError(
        await buy(player, { club_id: club, loyalty_until: LOYALTY_UNTIL }),
        404,
      );
      expectJsonError(
        await buy(999, { club_id: club, loyalty_until: LOYALTY_UNTIL }),
        404,
      );
      const free = await createPlayer({ name: 'Meia Sol' });
      expectJsonError(
        await buy(free, { club_id: 999, loyalty_until: LOYALTY_UNTIL }),
        404,
      );
      expectJsonError(
        await api()
          .post('/api/v1/players/abc/buy')
          .send({ club_id: club, loyalty_until: LOYALTY_UNTIL }),
        404,
      );
      expect(await prisma.transaction.count()).toBe(0);
    });

    it.each([
      ['club_id 0', { club_id: 0 }],
      ['club_id negativo', { club_id: -1 }],
      ['club_id texto', { club_id: '1' }],
      ['club_id fracionário', { club_id: 1.5 }],
      ['club_id nulo', { club_id: null }],
      ['sem club_id', { club_id: undefined }],
      ['clubId em camelCase', { club_id: undefined, clubId: 1 }],
      ['sem loyalty_until', { loyalty_until: undefined }],
      ['loyalty_until nulo', { loyalty_until: null }],
      ['loyalty_until número', { loyalty_until: 20270302 }],
      ['loyalty_until sem -03:00', { loyalty_until: '2027-03-02T10:15' }],
      ['loyalty_until com Z', { loyalty_until: '2027-03-02T13:15Z' }],
      [
        'loyalty_until com segundos',
        { loyalty_until: '2027-03-02T10:15:00-03:00' },
      ],
      [
        'loyalty_until com outro fuso',
        { loyalty_until: '2027-03-02T10:15-02:00' },
      ],
      ['loyalty_until só a data', { loyalty_until: '2027-03-02' }],
      ['data inexistente', { loyalty_until: '2027-02-30T10:15-03:00' }],
      ['hora inexistente', { loyalty_until: '2027-03-02T24:00-03:00' }],
      [
        'fim da fidelidade no passado',
        { loyalty_until: '2026-11-01T10:15-03:00' },
      ],
      [
        'fim da fidelidade igual a agora',
        { loyalty_until: '2026-11-02T10:15-03:00' },
      ],
      [
        'fim da fidelidade a mais de 1.095 dias',
        { loyalty_until: '2029-11-01T10:16-03:00' },
      ],
    ])('recusa %s (400)', async (_, change) => {
      const club = await createClub();
      const player = await createPlayer();
      const before = await snapshot();
      const body = { club_id: club, loyalty_until: LOYALTY_UNTIL, ...change };
      expectJsonError(await buy(player, body), 400);
      expect(await snapshot()).toEqual(before);
    });

    it('aceita o fim da fidelidade a exatamente 1.095 dias (B12)', async () => {
      const club = await createClub();
      const player = await createPlayer();
      const response = await buy(player, {
        club_id: club,
        loyalty_until: '2029-11-01T10:15-03:00',
      }).expect(200);
      expect(response.body).toMatchObject({
        contract: { loyalty_until: '2029-11-01T10:15:00-03:00' },
      });
    });

    it('recusa corpo que não é objeto (V1)', async () => {
      const player = await createPlayer();
      expectJsonError(
        await api()
          .post(`/api/v1/players/${player}/buy`)
          .set('Content-Type', 'application/json')
          .send('10'),
        400,
      );
    });
  });

  describe('sequência de compras (B13)', () => {
    it('confere cada compra e o clube: elenco na ordem, contratos, elenco e patrimônio', async () => {
      const club = await createClub();
      const meiaLua = await createPlayer();
      await setCondition(meiaLua, 'MAL_CONDICIONADO');
      const youngPlayer = await createPlayer({
        name: 'Jovem Promessa',
        age: 20,
      });
      const veteran = await createPlayer({
        name: 'Velho Goleiro',
        position: 'GOL',
        agility: 70,
        age: 34,
        pace: 60,
        shooting: 60,
        passing: 60,
        dribbling: 60,
        defending: 60,
        physical: 60,
        potential: 60,
      });
      await setCondition(veteran, 'DOENTE');

      const purchases = [
        [
          meiaLua,
          120,
          { value: 37, fee: 1.85, cash_change: -38.85, club_cash: 261.15 },
        ],
        [
          youngPlayer,
          10,
          { value: 48.84, fee: 2.44, cash_change: -51.28, club_cash: 209.87 },
        ],
        [
          veteran,
          400,
          { value: 6, fee: 0, cash_change: -6, club_cash: 203.87 },
        ],
      ] as const;
      for (const [player, days, expected] of purchases) {
        const response = await buy(player, {
          club_id: club,
          loyalty_until: apiDate(
            new Date(PURCHASE_TIME.getTime() + days * DAY),
          ),
        }).expect(200);
        expect(response.body).toMatchObject(expected);
      }

      clock.set(new Date(PURCHASE_TIME.getTime() + 2 * DAY + 60_000));
      const detail = await api().get(`/api/v1/clubs/${club}`).expect(200);
      const body = detail.body as ClubDetail;
      expect(body).toMatchObject({
        cash: 203.87,
        squad_value: 91.84,
        net_worth: 295.71,
      });
      expect(
        body.players.map(({ id, market_value, contract }) => [
          id,
          market_value,
          contract.remaining_days,
          contract.penalty_rate,
        ]),
      ).toEqual([
        [veteran, 6, 398, 20],
        [youngPlayer, 48.84, 8, 5],
        [meiaLua, 37, 118, 10],
      ]);
      await expectReconciled(club);
    });
  });

  describe('POST /players/{id}/sell', () => {
    async function signed(change: object = {}, days = 200) {
      const club = await createClub();
      const player = await createPlayer(change);
      await buy(player, {
        club_id: club,
        loyalty_until: apiDate(new Date(PURCHASE_TIME.getTime() + days * DAY)),
      }).expect(200);
      return { club, player };
    }

    it('com a fidelidade vencida, multa 0 e contrato ENCERRADO (RN15)', async () => {
      const { club, player } = await signed({}, 1);
      clock.set(new Date(PURCHASE_TIME.getTime() + DAY));
      const response = await sell(player).expect(200);
      expect(response.body).toMatchObject({
        value: 40,
        penalty: 0,
        profit: 0,
        fee: 0,
        cash_change: 40,
        remaining_days: 0,
        penalty_rate: 0,
        contract_status: 'ENCERRADO',
        club_cash: 298,
      });
      await expectReconciled(club);
    });

    it('limita a multa a 10,00 (RN15)', async () => {
      const allEighty = {
        name: 'Craque Caro',
        agility: 50,
        pace: 80,
        shooting: 80,
        passing: 80,
        dribbling: 80,
        defending: 80,
        physical: 80,
        potential: 80,
      };
      const { player } = await signed(allEighty, 200);
      const response = await sell(player).expect(200);
      expect(response.body).toMatchObject({
        value: 70,
        remaining_days: 200,
        penalty_rate: 20,
        penalty: 10,
        profit: 0,
        fee: 0,
        cash_change: 60,
        contract_status: 'RESCINDIDO',
      });
    });

    it('com prejuízo, não cobra comissão (RN16)', async () => {
      const { club, player } = await signed({}, 200);
      await setCondition(player, 'DOENTE');
      const response = await sell(player).expect(200);
      expect(response.body).toMatchObject({
        value: 34,
        purchase_value: 40,
        profit: -6,
        fee: 0,
        penalty_rate: 20,
        penalty: 6.8,
        cash_change: 27.2,
        club_cash: 285.2,
      });
      await expectReconciled(club);
    });

    it('tira o titular da escalação e mantém a formação (RN19 item 5)', async () => {
      const { club, player } = await signed();
      await prisma.club.update({
        where: { id: club },
        data: { formation: '2-1-1' },
      });
      await prisma.lineup.create({ data: { clubId: club, playerId: player } });
      await sell(player).expect(200);
      expect(await prisma.lineup.count()).toBe(0);
      const saved = await prisma.club.findUniqueOrThrow({
        where: { id: club },
      });
      expect(saved.formation).toBe('2-1-1');
    });

    it('recusa jogador livre (409) e excluído ou inexistente (404)', async () => {
      const player = await createPlayer();
      const before = await snapshot();
      expectJsonError(await sell(player), 409);
      await api().delete(`/api/v1/players/${player}`).expect(204);
      expectJsonError(await sell(player), 404);
      expectJsonError(await sell(999), 404);
      expectJsonError(await api().post('/api/v1/players/01/sell'), 404);
      expect(await prisma.transaction.count()).toBe(before.transactions);
    });

    it('o clube que vendeu não recompra; outro clube pode (RN12)', async () => {
      const { club, player } = await signed();
      const other = await createClub('Delta FC', 'DFC');
      await sell(player).expect(200);
      const before = await snapshot();
      expectJsonError(
        await buy(player, { club_id: club, loyalty_until: LOYALTY_UNTIL }),
        409,
      );
      expect(await snapshot()).toEqual(before);
      await buy(player, {
        club_id: other,
        loyalty_until: LOYALTY_UNTIL,
      }).expect(200);
    });

    it('a mudança de nome depois da compra não muda a transação, e o jogador vendido pode ser excluído', async () => {
      const { club, player } = await signed();
      await api()
        .put(`/api/v1/players/${player}`)
        .send({ name: 'Lua Cheia', position: 'MEI', agility: 85, age: 25 })
        .expect(200);
      const response = await sell(player).expect(200);
      expect(response.body).toMatchObject({ player_name: 'Lua Cheia' });
      const purchase = await prisma.transaction.findFirstOrThrow({
        where: { clubId: club, type: 'COMPRA' },
      });
      expect(purchase.playerName).toBe('Meia Lua');
      await api().delete(`/api/v1/players/${player}`).expect(204);
    });
  });
});
