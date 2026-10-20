import { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { appOptions, setupApp } from '../src/app.setup';
import { ClockService } from '../src/common/clock/clock.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { expectJsonError } from './support/expect-json-error';
import { clearDatabase } from './support/test-database';

const NOW = new Date('2026-11-12T18:00:00.000Z');

const MEIA_LUA = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

const MEIA_LUA_RESPONSE = {
  ...MEIA_LUA,
  condition: 'APTO',
  base_value: 40,
  market_value: 40,
  overall: 75,
  club_id: null,
};

describe('Jogadores (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ClockService)
      .useValue({ now: () => NOW })
      .compile();
    const nestApp =
      moduleRef.createNestApplication<NestExpressApplication>(appOptions);
    nestApp.useLogger(false);
    setupApp(nestApp, { corsOrigins: ['http://localhost:5173'] });
    await nestApp.init();
    app = nestApp;
    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  async function createPlayer(body: object = MEIA_LUA): Promise<number> {
    const response = await api().post('/api/v1/players').send(body).expect(201);
    return (response.body as { id: number }).id;
  }

  async function signToNewClub(playerId: number): Promise<number> {
    const club = await prisma.club.create({
      data: { name: 'Águias FC', acronym: 'AGF', formation: '2-1-1' },
    });
    await prisma.player.update({
      where: { id: playerId },
      data: { clubId: club.id },
    });
    return club.id;
  }

  describe('POST /players', () => {
    it('cadastra o Meia Lua do exemplo 2.1.3 com 201 e Location', async () => {
      const response = await api()
        .post('/api/v1/players')
        .send(MEIA_LUA)
        .expect(201);
      const body = response.body as { id: number };
      expect(body).toEqual({ id: body.id, ...MEIA_LUA_RESPONSE });
      expect(response.headers.location).toBe(`/api/v1/players/${body.id}`);
    });

    it('ignora base_value, condition, club_id e campos desconhecidos', async () => {
      const response = await api()
        .post('/api/v1/players')
        .send({
          ...MEIA_LUA,
          base_value: 999,
          condition: 'DOENTE',
          club_id: 7,
          id: 50,
          overall: 99,
          apelido: 'Lua',
        })
        .expect(201);
      expect(response.body).toMatchObject({
        base_value: 40,
        condition: 'APTO',
        club_id: null,
        overall: 75,
      });
      const saved = await prisma.player.findFirstOrThrow();
      expect(saved.baseValue.toFixed(2)).toBe('40.00');
      expect(saved.id).not.toBe(50);
    });

    it('grava o nome normalizado (V4)', async () => {
      const response = await api()
        .post('/api/v1/players')
        .send({ ...MEIA_LUA, name: '  Meia   Lua ' })
        .expect(201);
      expect((response.body as { name: string }).name).toBe('Meia Lua');
      const saved = await prisma.player.findFirstOrThrow();
      expect(saved.name).toBe('Meia Lua');
    });

    it('calcula o valor base de jovem promessa (RN06)', async () => {
      const response = await api()
        .post('/api/v1/players')
        .send({ ...MEIA_LUA, age: 21 })
        .expect(201);
      expect(response.body).toMatchObject({ base_value: 44.4, overall: 75 });
    });

    it.each([
      ['nome de uma palavra', { name: 'Ana' }],
      ['nome com dígito', { name: 'Ana 2' }],
      ['agilidade como texto', { agility: '15' }],
      ['agilidade fracionária', { agility: 50.5 }],
      ['posição em minúsculas', { position: 'mei' }],
      [
        'soma dos atributos 481',
        {
          pace: 81,
          shooting: 80,
          passing: 80,
          dribbling: 80,
          defending: 80,
          physical: 80,
          potential: 81,
        },
      ],
      ['potencial acima do maior atributo com 34 anos', { age: 34 }],
    ])('recusa %s com 400, sem gravar', async (_, change) => {
      expectJsonError(
        await api()
          .post('/api/v1/players')
          .send({ ...MEIA_LUA, ...change }),
        400,
      );
      expect(await prisma.player.count()).toBe(0);
    });

    it('recusa Agility no lugar de agility com 400', async () => {
      const { agility, ...withoutAgility } = MEIA_LUA;
      expectJsonError(
        await api()
          .post('/api/v1/players')
          .send({ ...withoutAgility, Agility: agility }),
        400,
      );
    });
  });

  describe('GET /players/{id}', () => {
    it('devolve o jogador no formato de 2.1.2', async () => {
      const id = await createPlayer();
      await api()
        .get(`/api/v1/players/${id}`)
        .expect(200, { id, ...MEIA_LUA_RESPONSE });
    });

    it.each(['abc', '0', '01', '-1', '2147483648', '999'])(
      'GET /players/%s → 404',
      async (id) => {
        expectJsonError(await api().get(`/api/v1/players/${id}`), 404);
      },
    );
  });

  describe('PUT /players/{id}', () => {
    it('edita nome, posição, agilidade e idade, sem mudar o resto (RN08)', async () => {
      const id = await createPlayer();
      const response = await api()
        .put(`/api/v1/players/${id}`)
        .send({
          name: 'Davi Melo',
          position: 'ATA',
          agility: 70,
          age: 26,
          pace: 1,
          potential: 99,
          base_value: 1,
        })
        .expect(200);
      expect(response.body).toEqual({
        ...MEIA_LUA_RESPONSE,
        id,
        name: 'Davi Melo',
        position: 'ATA',
        agility: 70,
        age: 26,
        overall: 72,
      });
    });

    it('jogador com clube pode manter a posição', async () => {
      const id = await createPlayer();
      await signToNewClub(id);
      await api()
        .put(`/api/v1/players/${id}`)
        .send({ name: 'Meia Lua', position: 'MEI', agility: 80, age: 26 })
        .expect(200);
    });

    it('jogador com clube mudando de posição → 409, sem gravar', async () => {
      const id = await createPlayer();
      await signToNewClub(id);
      expectJsonError(
        await api()
          .put(`/api/v1/players/${id}`)
          .send({ name: 'Meia Lua', position: 'ATA', agility: 85, age: 25 }),
        409,
      );
      const saved = await prisma.player.findUniqueOrThrow({ where: { id } });
      expect(saved.position).toBe('MEI');
    });

    it('idade menor que a atual → 409', async () => {
      const id = await createPlayer();
      expectJsonError(
        await api()
          .put(`/api/v1/players/${id}`)
          .send({ name: 'Meia Lua', position: 'MEI', agility: 85, age: 24 }),
        409,
      );
    });

    it('exige os quatro campos (400)', async () => {
      const id = await createPlayer();
      expectJsonError(
        await api().put(`/api/v1/players/${id}`).send({ name: 'Meia Lua' }),
        400,
      );
    });

    it('agilidade 86 com 35 anos → 400', async () => {
      const id = await createPlayer();
      expectJsonError(
        await api()
          .put(`/api/v1/players/${id}`)
          .send({ name: 'Meia Lua', position: 'MEI', agility: 86, age: 35 }),
        400,
      );
    });

    it('jogador inexistente → 404', async () => {
      expectJsonError(
        await api()
          .put('/api/v1/players/999')
          .send({ name: 'Meia Lua', position: 'MEI', agility: 85, age: 25 }),
        404,
      );
    });
  });

  describe('PATCH /players/{id}/condition', () => {
    const patchCondition = (id: number, condition: unknown) =>
      api().patch(`/api/v1/players/${id}/condition`).send({ condition });

    it('MAL_CONDICIONADO muda o valor de mercado para 37,00 (exemplo 2.1.4)', async () => {
      const id = await createPlayer();
      const response = await patchCondition(id, 'MAL_CONDICIONADO').expect(200);
      expect(response.body).toMatchObject({
        condition: 'MAL_CONDICIONADO',
        market_value: 37,
      });
    });

    it('de DOENTE direto para APTO → 409', async () => {
      const id = await createPlayer();
      await patchCondition(id, 'DOENTE').expect(200);
      expectJsonError(await patchCondition(id, 'APTO'), 409);
    });

    it('de DOENTE para MAL_CONDICIONADO e depois APTO é aceito', async () => {
      const id = await createPlayer();
      await patchCondition(id, 'DOENTE').expect(200);
      await patchCondition(id, 'MAL_CONDICIONADO').expect(200);
      await patchCondition(id, 'APTO').expect(200);
    });

    it('enviar a condição atual → 200, sem mudança', async () => {
      const id = await createPlayer();
      await patchCondition(id, 'DOENTE').expect(200);
      const response = await patchCondition(id, 'DOENTE').expect(200);
      expect(response.body).toMatchObject({ condition: 'DOENTE' });
    });

    it('ignora outros campos, como name (V7)', async () => {
      const id = await createPlayer();
      const response = await api()
        .patch(`/api/v1/players/${id}/condition`)
        .send({ condition: 'MAL_CONDICIONADO', name: 'Outro Nome' })
        .expect(200);
      expect(response.body).toMatchObject({ name: 'Meia Lua' });
    });

    it.each([undefined, null, 'doente', 'LESIONADO'])(
      'condição %j → 400',
      async (condition) => {
        const id = await createPlayer();
        expectJsonError(await patchCondition(id, condition), 400);
      },
    );

    it('titular que passa a DOENTE sai da escalação, e a formação fica (RN19)', async () => {
      const id = await createPlayer();
      const clubId = await signToNewClub(id);
      await prisma.lineup.create({ data: { clubId, playerId: id } });

      await patchCondition(id, 'DOENTE').expect(200);

      expect(await prisma.lineup.count()).toBe(0);
      const club = await prisma.club.findUniqueOrThrow({
        where: { id: clubId },
      });
      expect(club.formation).toBe('2-1-1');
    });

    it('MAL_CONDICIONADO não tira o titular da escalação', async () => {
      const id = await createPlayer();
      const clubId = await signToNewClub(id);
      await prisma.lineup.create({ data: { clubId, playerId: id } });

      await patchCondition(id, 'MAL_CONDICIONADO').expect(200);

      expect(await prisma.lineup.count()).toBe(1);
    });
  });

  describe('DELETE /players/{id}', () => {
    it('exclui jogador livre com 204 sem corpo; depois, 404 em tudo (RN09)', async () => {
      const id = await createPlayer();
      const response = await api().delete(`/api/v1/players/${id}`).expect(204);
      expect(response.text).toBe('');

      const saved = await prisma.player.findUniqueOrThrow({ where: { id } });
      expect(saved.deletedAt).toEqual(NOW);

      expectJsonError(await api().get(`/api/v1/players/${id}`), 404);
      expectJsonError(
        await api()
          .put(`/api/v1/players/${id}`)
          .send({ name: 'Meia Lua', position: 'MEI', agility: 85, age: 25 }),
        404,
      );
      expectJsonError(
        await api()
          .patch(`/api/v1/players/${id}/condition`)
          .send({ condition: 'DOENTE' }),
        404,
      );
      expectJsonError(await api().delete(`/api/v1/players/${id}`), 404);
    });

    it('jogador com clube → 409, sem excluir', async () => {
      const id = await createPlayer();
      await signToNewClub(id);
      expectJsonError(await api().delete(`/api/v1/players/${id}`), 409);
      const saved = await prisma.player.findUniqueOrThrow({ where: { id } });
      expect(saved.deletedAt).toBeNull();
    });

    it('jogador inexistente → 404', async () => {
      expectJsonError(await api().delete('/api/v1/players/999'), 404);
    });
  });
});
