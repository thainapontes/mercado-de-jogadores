import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { isUniqueViolation } from '../src/prisma/prisma-errors';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './support/create-test-app';
import { expectJsonError } from './support/expect-json-error';
import { CHEAP_PLAYER, MEIA_LUA } from './support/fixtures';
import { clearDatabase } from './support/test-database';

const NOW = new Date('2026-11-02T13:15:00.000Z');

interface ClubBody {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

describe('Clubes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp(NOW));
  });

  beforeEach(async () => {
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
    return (response.body as ClubBody).id;
  }

  async function createPlayer(change: object = {}): Promise<number> {
    const response = await api()
      .post('/api/v1/players')
      .send({ ...MEIA_LUA, ...change })
      .expect(201);
    return (response.body as { id: number }).id;
  }

  async function sign(
    playerId: number,
    clubId: number,
    loyaltyUntil: Date,
  ): Promise<void> {
    await prisma.player.update({
      where: { id: playerId },
      data: { clubId },
    });
    await prisma.contract.create({
      data: {
        playerId,
        clubId,
        purchaseValue: '37.00',
        loyaltyUntil,
        status: 'ATIVO',
        startedAt: NOW,
      },
    });
  }

  describe('POST /clubs', () => {
    it('cria o Águias FC com 201, Location e caixa 300,00 (2.2.1)', async () => {
      const response = await api()
        .post('/api/v1/clubs')
        .send({ name: 'Águias FC', acronym: 'AGU' })
        .expect(201);
      const body = response.body as ClubBody;
      expect(body).toEqual({
        id: body.id,
        name: 'Águias FC',
        acronym: 'AGU',
        cash: 300,
        squad_value: 0,
        net_worth: 300,
      });
      expect(response.headers.location).toBe(`/api/v1/clubs/${body.id}`);
    });

    it('normaliza o nome e ignora cash, id e campos desconhecidos (V3, V4, V7)', async () => {
      const response = await api()
        .post('/api/v1/clubs')
        .send({
          name: '  Águias   FC ',
          acronym: 'AFC',
          cash: 1000,
          id: 99,
          extra: true,
        })
        .expect(201);
      const body = response.body as ClubBody;
      expect(body.name).toBe('Águias FC');
      expect(body.cash).toBe(300);
      const saved = await prisma.club.findUniqueOrThrow({
        where: { id: body.id },
      });
      expect(saved.cash.toFixed(2)).toBe('300.00');
    });

    it('recusa nome repetido sem diferenciar maiúsculas, mas aceita outro acento (RN10)', async () => {
      await createClub('Águias FC', 'AGU');
      expectJsonError(
        await api()
          .post('/api/v1/clubs')
          .send({ name: '  águias   fc ', acronym: 'AFC' }),
        409,
      );
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Aguias FC', acronym: 'AFC' })
        .expect(201);
      expect(await prisma.club.count()).toBe(2);
    });

    it('recusa sigla repetida (409)', async () => {
      await createClub('Águias FC', 'AGU');
      expectJsonError(
        await api()
          .post('/api/v1/clubs')
          .send({ name: 'Aguias Unidas', acronym: 'AGU' }),
        409,
      );
      expect(await prisma.club.count()).toBe(1);
    });

    it('com pedidos simultâneos do mesmo nome, só um é criado', async () => {
      const responses = await Promise.all(
        ['AGU', 'AFC', 'AGS'].map((acronym) =>
          api().post('/api/v1/clubs').send({ name: 'Águias FC', acronym }),
        ),
      );
      expect(responses.map(({ status }) => status).sort()).toEqual([
        201, 409, 409,
      ]);
      expect(await prisma.club.count()).toBe(1);
    });

    it('o banco também garante o nome (sem diferenciar maiúsculas) e a sigla', async () => {
      await createClub('Águias FC', 'AGU');
      const duplicates = [
        { name: 'águias fc', acronym: 'AFC' },
        { name: 'Outro Clube', acronym: 'AGU' },
      ];
      for (const data of duplicates) {
        const error: unknown = await prisma.club
          .create({ data })
          .catch((caught: unknown) => caught);
        expect(isUniqueViolation(error)).toBe(true);
      }
      await prisma.club.create({ data: { name: 'Aguias FC', acronym: 'AFC' } });
    });

    it('recusa o 21º clube (409)', async () => {
      for (const letter of 'BCDEFGHIJKLMNOPQRSTU') {
        await createClub(`Clube A${letter.toLowerCase()}`, `CA${letter}`);
      }
      const response = await api()
        .post('/api/v1/clubs')
        .send({ name: 'Clube Extra', acronym: 'CEX' });
      expectJsonError(response, 409);
      expect(await prisma.club.count()).toBe(20);
    });

    it.each([
      [
        'sigla que não corresponde ao nome',
        { name: 'Águias FC', acronym: 'XYZ' },
      ],
      [
        'sigla que não começa pela 1ª letra',
        { name: 'Águias FC', acronym: 'GUA' },
      ],
      ['sigla com letras iguais', { name: 'Aaa Bbb', acronym: 'AAA' }],
      ['sigla minúscula', { name: 'Águias FC', acronym: 'agu' }],
      ['sigla com acento', { name: 'Águias FC', acronym: 'ÁGU' }],
      ['sigla com 4 letras', { name: 'Águias FC', acronym: 'AGUI' }],
      ['sigla numérica', { name: 'Águias FC', acronym: 123 }],
      ['sem sigla', { name: 'Águias FC' }],
      ['sigla nula', { name: 'Águias FC', acronym: null }],
      ['sem nome', { acronym: 'AGU' }],
      ['nome só com espaços', { name: '   ', acronym: 'AGU' }],
      ['nome com uma palavra', { name: 'Águias', acronym: 'AGU' }],
      ['nome com seis palavras', { name: 'A B C D E F', acronym: 'ABC' }],
      ['nome com dígito', { name: 'Águias 1 FC', acronym: 'AGU' }],
      ['nome curto', { name: 'A B', acronym: 'ABA' }],
      [
        'nome com mais de 60',
        { name: `Águias ${'a'.repeat(54)}`, acronym: 'AGU' },
      ],
      ['nome com tabulação', { name: 'Águias\tFC', acronym: 'AGU' }],
      ['nome que não é texto', { name: 10, acronym: 'AGU' }],
      ['acronym em camelCase', { name: 'Águias FC', Acronym: 'AGU' }],
    ])('recusa %s (400)', async (_, body) => {
      expectJsonError(await api().post('/api/v1/clubs').send(body), 400);
      expect(await prisma.club.count()).toBe(0);
    });

    it('recusa corpo que não é objeto (V1)', async () => {
      expectJsonError(
        await api()
          .post('/api/v1/clubs')
          .set('Content-Type', 'application/json')
          .send('[]'),
        400,
      );
    });
  });

  describe('GET /clubs', () => {
    async function listIds(query = ''): Promise<number[]> {
      const response = await api().get(`/api/v1/clubs${query}`).expect(200);
      expect(response.headers['content-type']).toMatch(/^application\/json/);
      return (response.body as ClubBody[]).map(({ id }) => id);
    }

    it('sem clubes, devolve 200 com lista vazia', async () => {
      expect(await listIds()).toEqual([]);
    });

    it('ordena pelo nome (padrão) e pelo patrimônio, com desempate pelo nome e pelo id (RN11)', async () => {
      const delta = await createClub('Delta FC', 'DFC');
      const epsilon = await createClub('Épsilon EC', 'EEC');
      const aguiasWithAccent = await createClub('Águias FC', 'AGU');
      const aguias = await createClub('Aguias FC', 'AFC');
      const gama = await createClub('Gama SC', 'GSC');
      await prisma.club.update({
        where: { id: gama },
        data: { cash: '250.00' },
      });
      const player = await createPlayer();
      await sign(player, epsilon, new Date('2027-03-02T13:15:00.000Z'));

      expect(await listIds()).toEqual([
        aguiasWithAccent,
        aguias,
        delta,
        epsilon,
        gama,
      ]);
      expect(await listIds('?sort=name')).toEqual([
        aguiasWithAccent,
        aguias,
        delta,
        epsilon,
        gama,
      ]);
      expect(await listIds('?sort=net_worth_asc')).toEqual([
        gama,
        aguiasWithAccent,
        aguias,
        delta,
        epsilon,
      ]);
      expect(await listIds('?sort=net_worth_desc')).toEqual([
        epsilon,
        aguiasWithAccent,
        aguias,
        delta,
        gama,
      ]);

      const response = await api()
        .get('/api/v1/clubs?sort=net_worth_desc')
        .expect(200);
      expect((response.body as ClubBody[])[0]).toEqual({
        id: epsilon,
        name: 'Épsilon EC',
        acronym: 'EEC',
        cash: 300,
        squad_value: 40,
        net_worth: 340,
      });
    });

    it.each([
      'sort=',
      'sort=NAME',
      'sort=net_worth',
      'sort=name,net_worth_asc',
    ])('recusa %s (400)', async (query) => {
      expectJsonError(await api().get(`/api/v1/clubs?${query}`), 400);
    });
  });

  describe('GET /clubs/{id}', () => {
    it('traz o elenco na ordem GOL → ATA → nome → id, com o contrato e os valores (RN11)', async () => {
      const club = await createClub('Águias FC', 'AGU');
      const forward = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Ana Lima',
        position: 'ATA',
      });
      const midfielder = await createPlayer();
      const defender = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Zeca Souza',
        position: 'ZAG',
      });
      const goalkeeper = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Zé Goleiro',
        position: 'GOL',
      });
      const secondFullBack = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Ana-Maria Reis',
        position: 'LAT',
      });
      const firstFullBack = await createPlayer({
        ...CHEAP_PLAYER,
        name: 'Ana Lima',
        position: 'LAT',
      });
      for (const [player, days] of [
        [forward, 0],
        [midfielder, 120],
        [defender, 30],
        [goalkeeper, 181],
        [secondFullBack, 180],
        [firstFullBack, 1],
      ]) {
        await sign(player, club, new Date(NOW.getTime() + days * 86_400_000));
      }
      await api()
        .patch(`/api/v1/players/${midfielder}/condition`)
        .send({ condition: 'MAL_CONDICIONADO' })
        .expect(200);

      const response = await api().get(`/api/v1/clubs/${club}`).expect(200);
      const body = response.body as ClubBody & {
        players: {
          id: number;
          market_value: number;
          contract: { remaining_days: number; penalty_rate: number };
        }[];
      };
      expect(body.players.map(({ id }) => id)).toEqual([
        goalkeeper,
        defender,
        firstFullBack,
        secondFullBack,
        midfielder,
        forward,
      ]);
      expect(
        body.players.map(({ contract }) => [
          contract.remaining_days,
          contract.penalty_rate,
        ]),
      ).toEqual([
        [181, 20],
        [30, 5],
        [1, 5],
        [180, 10],
        [120, 10],
        [0, 0],
      ]);
      expect(body.players[4]).toMatchObject({
        id: midfielder,
        name: 'Meia Lua',
        condition: 'MAL_CONDICIONADO',
        base_value: 40,
        market_value: 37,
        overall: 75,
        club_id: club,
        contract: {
          purchase_value: 37,
          loyalty_until: '2027-03-02T10:15:00-03:00',
          remaining_days: 120,
          penalty_rate: 10,
        },
      });
      expect(body).toMatchObject({
        id: club,
        cash: 300,
        squad_value: 42,
        net_worth: 342,
      });
    });

    it('clube sem jogadores traz players vazio', async () => {
      const club = await createClub('Águias FC', 'AGU');
      const response = await api().get(`/api/v1/clubs/${club}`).expect(200);
      expect(response.body).toEqual({
        id: club,
        name: 'Águias FC',
        acronym: 'AGU',
        cash: 300,
        squad_value: 0,
        net_worth: 300,
        players: [],
      });
    });

    it.each(['999', 'abc', '0', '01'])('id %s → 404', async (id) => {
      expectJsonError(await api().get(`/api/v1/clubs/${id}`), 404);
    });
  });
});
