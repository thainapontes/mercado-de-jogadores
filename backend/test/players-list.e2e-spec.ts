import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './support/create-test-app';
import { expectJsonError } from './support/expect-json-error';
import { clearDatabase } from './support/test-database';

interface ListedPlayer {
  id: number;
  name: string;
  base_value: number;
  market_value: number;
}

interface PlayerPage {
  data: ListedPlayer[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

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

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

describe('Listagem de jogadores (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp(new Date()));
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  async function createPlayer(change: object = {}): Promise<number> {
    const response = await api()
      .post('/api/v1/players')
      .send({ ...MEIA_LUA, ...change })
      .expect(201);
    return (response.body as { id: number }).id;
  }

  async function list(query: string): Promise<PlayerPage> {
    const response = await api().get(`/api/v1/players${query}`).expect(200);
    return response.body as PlayerPage;
  }

  const names = (page: PlayerPage) => page.data.map(({ name }) => name);

  async function createClub(): Promise<number> {
    const club = await prisma.club.create({
      data: { name: 'Águias FC', acronym: 'AGF' },
    });
    return club.id;
  }

  describe('paginação (tabela da RN07)', () => {
    beforeEach(async () => {
      for (const letter of LETTERS.slice(0, 23)) {
        await createPlayer({ name: `Jogador ${letter}` });
      }
    });

    it.each([
      ['?limit=10&page=1', 10, 'Jogador a', 3],
      ['?limit=10&page=3', 3, 'Jogador u', 3],
      ['?limit=10&page=4', 0, undefined, 3],
      ['?limit=50&page=1', 23, 'Jogador a', 1],
    ])('%s', async (query, items, first, totalPages) => {
      const page = await list(query);
      expect(page.data).toHaveLength(items);
      expect(page.data[0]?.name).toBe(first);
      expect(page.meta).toEqual({
        page: Number(new URLSearchParams(query).get('page')),
        limit: Number(new URLSearchParams(query).get('limit')),
        total_items: 23,
        total_pages: totalPages,
      });
    });

    it('sem parâmetros: página 1, 10 por página, por nome', async () => {
      const page = await list('');
      expect(page.meta).toEqual({
        page: 1,
        limit: 10,
        total_items: 23,
        total_pages: 3,
      });
      expect(names(page).slice(0, 3)).toEqual([
        'Jogador a',
        'Jogador b',
        'Jogador c',
      ]);
    });
  });

  it('sem jogadores: data vazia e total_pages 0', async () => {
    expect(await list('')).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
    });
  });

  it('cada item tem os campos de GET /players/{id}', async () => {
    const id = await createPlayer();
    const detail = await api().get(`/api/v1/players/${id}`).expect(200);
    expect((await list('')).data).toEqual([detail.body]);
  });

  describe('busca (RN07)', () => {
    beforeEach(async () => {
      await createPlayer({ name: 'João Silva' });
      await createPlayer({ name: 'Meia Lua' });
      await createPlayer({ name: 'Conceição Neto' });
    });

    it.each([
      ['joao', ['João Silva']],
      ['LUA', ['Meia Lua']],
      ['  meia   lua ', ['Meia Lua']],
      ['conceicao', ['Conceição Neto']],
      ['si', ['João Silva']],
      ['zzz', []],
    ])('search=%j', async (search, expected) => {
      expect(
        names(await list(`?search=${encodeURIComponent(search)}`)),
      ).toEqual(expected);
    });
  });

  describe('filtros (RN07)', () => {
    let clubId: number;

    beforeEach(async () => {
      clubId = await createClub();
      const ana = await createPlayer({
        name: 'Ana Goleira',
        position: 'GOL',
        age: 30,
      });
      await createPlayer({ name: 'Bia Atacante', position: 'ATA', age: 20 });
      const caio = await createPlayer({
        name: 'Caio Meia',
        age: 35,
        agility: 50,
        potential: 82,
      });
      await createPlayer({ name: 'Davi Zagueiro', position: 'ZAG', age: 25 });
      await prisma.player.updateMany({
        where: { id: { in: [ana, caio] } },
        data: { clubId },
      });
      await api()
        .patch(`/api/v1/players/${caio}/condition`)
        .send({ condition: 'DOENTE' })
        .expect(200);
    });

    it.each([
      ['?position=GOL', ['Ana Goleira']],
      ['?condition=DOENTE', ['Caio Meia']],
      ['?free=true', ['Bia Atacante', 'Davi Zagueiro']],
      ['?free=false', ['Ana Goleira', 'Caio Meia']],
      ['?min_age=25', ['Ana Goleira', 'Caio Meia', 'Davi Zagueiro']],
      ['?max_age=25', ['Bia Atacante', 'Davi Zagueiro']],
      ['?min_age=25&max_age=30', ['Ana Goleira', 'Davi Zagueiro']],
      ['?free=true&position=ATA', ['Bia Atacante']],
      ['?position=ZAG&min_age=30', []],
    ])('%s', async (query, expected) => {
      expect(names(await list(query))).toEqual(expected);
    });

    it('club_id traz o elenco do clube; free=false junto é aceito', async () => {
      expect(names(await list(`?club_id=${clubId}`))).toEqual([
        'Ana Goleira',
        'Caio Meia',
      ]);
      expect(names(await list(`?club_id=${clubId}&free=false`))).toEqual([
        'Ana Goleira',
        'Caio Meia',
      ]);
    });

    it('filtro de valor usa o valor de mercado, não o valor base', async () => {
      const caio = (await list('?condition=DOENTE')).data[0];
      expect(caio.base_value).toBeGreaterThanOrEqual(30);
      expect(caio.market_value).toBeLessThan(30);
      expect(names(await list('?min_value=30'))).not.toContain('Caio Meia');

      const cheap = await list(`?max_value=${caio.market_value}`);
      expect(names(cheap)).toContain('Caio Meia');
      expect(
        cheap.data.every(
          ({ market_value }) => market_value <= caio.market_value,
        ),
      ).toBe(true);
    });

    it('club_id inexistente → 404', async () => {
      expectJsonError(await api().get('/api/v1/players?club_id=999'), 404);
    });
  });

  describe('ordenação (RN07)', () => {
    beforeEach(async () => {
      await createPlayer({ name: 'Zeca Atacante', position: 'ATA', age: 30 });
      await createPlayer({ name: 'Ana Meia', position: 'MEI', age: 19 });
      await createPlayer({
        name: 'Bruno Goleiro',
        position: 'GOL',
        age: 33,
        potential: 82,
      });
      await createPlayer({ name: 'Caio Lateral', position: 'LAT', age: 25 });
      await createPlayer({ name: 'Davi Zagueiro', position: 'ZAG', age: 25 });
    });

    it('sort=position: GOL, ZAG, LAT, MEI, ATA', async () => {
      expect(names(await list('?sort=position'))).toEqual([
        'Bruno Goleiro',
        'Davi Zagueiro',
        'Caio Lateral',
        'Ana Meia',
        'Zeca Atacante',
      ]);
    });

    it('sort=age_desc desempata pelo nome', async () => {
      expect(names(await list('?sort=age_desc'))).toEqual([
        'Bruno Goleiro',
        'Zeca Atacante',
        'Caio Lateral',
        'Davi Zagueiro',
        'Ana Meia',
      ]);
    });

    it('sort=value_desc segue o valor de mercado', async () => {
      const values = (await list('?sort=value_desc')).data.map(
        ({ market_value }) => market_value,
      );
      expect(values).toEqual([...values].sort((a, b) => b - a));
    });
  });

  it('jogador excluído não aparece', async () => {
    const id = await createPlayer({ name: 'Ana Souza' });
    await createPlayer({ name: 'Bia Souza' });
    await api().delete(`/api/v1/players/${id}`).expect(204);
    expect(names(await list(''))).toEqual(['Bia Souza']);
  });

  it('ignora parâmetro desconhecido', async () => {
    await createPlayer();
    expect((await list('?cor=azul')).meta.total_items).toBe(1);
  });

  it.each([
    'position=mei',
    'position=',
    'free=true&club_id=1',
    'page=0',
    'page=01',
    'limit=51',
    'sort=value_asc,value_desc',
    'min_age=31&max_age=30',
    'min_value=10.555',
    'search=a',
    'position=GOL&position=ZAG',
  ])('?%s → 400', async (query) => {
    expectJsonError(await api().get(`/api/v1/players?${query}`), 400);
  });
});
