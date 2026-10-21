import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, TestClock } from './support/create-test-app';
import { expectJsonError } from './support/expect-json-error';
import { MEIA_LUA } from './support/fixtures';
import { clearDatabase } from './support/test-database';

const PURCHASE_TIME = new Date('2026-11-02T13:15:00.000Z');
const SALE_TIME = new Date('2026-11-05T19:40:00.000Z');
const LATER = new Date('2026-11-06T12:00:00.000Z');
const LOYALTY_UNTIL = '2027-03-02T10:15-03:00';
const HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n';

interface History {
  data: {
    id: number;
    type: string;
    player_id: number;
    player_name: string;
    cash_change: number;
  }[];
  summary: Record<string, number>;
}

describe('Histórico de transações e CSV (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let clock: TestClock;
  let club: number;
  let meiaLua: number;
  let quotedName: number;
  let withoutTransactions: number;

  beforeAll(async () => {
    ({ app, prisma, clock } = await createTestApp(PURCHASE_TIME));
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

  function history(query = '', clubId = club) {
    return api().get(`/api/v1/clubs/${clubId}/transactions${query}`);
  }

  function exportCsv(query = '', clubId = club) {
    return api()
      .get(`/api/v1/clubs/${clubId}/transactions/export${query}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });
  }

  beforeEach(async () => {
    clock.set(PURCHASE_TIME);
    await clearDatabase(prisma);
    club = (
      (
        await api()
          .post('/api/v1/clubs')
          .send({ name: 'Águias FC', acronym: 'AGU' })
          .expect(201)
      ).body as { id: number }
    ).id;
    meiaLua = await createPlayer();
    quotedName = await createPlayer({ name: 'Zé "Foguete" Lima' });
    withoutTransactions = await createPlayer({ name: 'Sem Contrato' });
    await api()
      .patch(`/api/v1/players/${meiaLua}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    for (const player of [meiaLua, quotedName]) {
      await api()
        .post(`/api/v1/players/${player}/buy`)
        .send({ club_id: club, loyalty_until: LOYALTY_UNTIL })
        .expect(200);
    }
    await api()
      .patch(`/api/v1/players/${meiaLua}/condition`)
      .send({ condition: 'APTO' })
      .expect(200);
    clock.set(SALE_TIME);
    await api().post(`/api/v1/players/${meiaLua}/sell`).expect(200);
    clock.set(LATER);
  });

  describe('GET /clubs/{id}/transactions', () => {
    it('lista da mais recente para a mais antiga, com o resumo (2.3.3)', async () => {
      const response = await history().expect(200);
      const body = response.body as History;
      expect(body.data.map(({ type, player_id }) => [type, player_id])).toEqual(
        [
          ['VENDA', meiaLua],
          ['COMPRA', quotedName],
          ['COMPRA', meiaLua],
        ],
      );
      expect(body.data[0]).toEqual({
        id: body.data[0].id,
        club_id: club,
        player_id: meiaLua,
        player_name: 'Meia Lua',
        type: 'VENDA',
        value: 40,
        fee: 0.3,
        penalty: 4,
        profit: 3,
        cash_change: 35.7,
        created_at: '2026-11-05T16:40:00-03:00',
      });
      expect(body.summary).toEqual({
        total_spent: 80.85,
        total_received: 35.7,
        total_fees: 4.15,
        total_penalties: 4,
        total_profit: 3,
      });
    });

    it('no mesmo instante, o id maior vem primeiro', async () => {
      const ids = (
        (await history('?type=COMPRA').expect(200)).body as History
      ).data.map(({ id }) => id);
      expect(ids[0]).toBeGreaterThan(ids[1]);
    });

    it('filtra por tipo e por jogador, com o resumo das filtradas', async () => {
      const sales = (await history('?type=VENDA').expect(200)).body as History;
      expect(sales.data).toHaveLength(1);
      expect(sales.summary).toEqual({
        total_spent: 0,
        total_received: 35.7,
        total_fees: 0.3,
        total_penalties: 4,
        total_profit: 3,
      });

      const both = (await history('?type=VENDA,COMPRA').expect(200))
        .body as History;
      expect(both.data).toHaveLength(3);

      const ofMeiaLua = (
        await history(`?player_id=${meiaLua}&type=COMPRA`).expect(200)
      ).body as History;
      expect(ofMeiaLua.data.map(({ player_id }) => player_id)).toEqual([
        meiaLua,
      ]);
      expect(ofMeiaLua.summary).toMatchObject({
        total_spent: 38.85,
        total_received: 0,
        total_fees: 1.85,
      });
    });

    it('jogador sem transações no clube → 200 com data vazio e summary zerado', async () => {
      const body = (
        await history(`?player_id=${withoutTransactions}`).expect(200)
      ).body as History;
      expect(body).toEqual({
        data: [],
        summary: {
          total_spent: 0,
          total_received: 0,
          total_fees: 0,
          total_penalties: 0,
          total_profit: 0,
        },
      });
    });

    it('mantém o nome do momento e as transações de jogador excluído', async () => {
      await api()
        .put(`/api/v1/players/${meiaLua}`)
        .send({ name: 'Lua Nova', position: 'MEI', agility: 85, age: 25 })
        .expect(200);
      await api().delete(`/api/v1/players/${meiaLua}`).expect(204);
      const body = (await history().expect(200)).body as History;
      expect(body.data.map(({ player_name }) => player_name)).toEqual([
        'Meia Lua',
        'Zé "Foguete" Lima',
        'Meia Lua',
      ]);
      expectJsonError(await history(`?player_id=${meiaLua}`), 404);
    });

    it('confere a conciliação: 300 + soma de cash_change = caixa', async () => {
      const body = (await history().expect(200)).body as History;
      const total = body.data.reduce(
        (sum, { cash_change }) => sum + Math.round(cash_change * 100),
        30_000,
      );
      const detail = await api().get(`/api/v1/clubs/${club}`).expect(200);
      expect(total).toBe(
        Math.round((detail.body as { cash: number }).cash * 100),
      );
    });

    it.each([
      'type=',
      'type=compra',
      'type=COMPRA,venda',
      'type=COMPRA,COMPRA',
      'type=COMPRA,%20VENDA',
      'type=COMPRA;VENDA',
      'player_id=',
      'player_id=0',
      'player_id=01',
      'player_id=-1',
      'player_id=1.0',
      'player_id=abc',
    ])('recusa %s (400)', async (query) => {
      expectJsonError(await history(`?${query}`), 400);
    });

    it('clube ou jogador inexistente → 404', async () => {
      expectJsonError(await history('', 999), 404);
      expectJsonError(await history('?player_id=999'), 404);
    });
  });

  describe('GET /clubs/{id}/transactions/export', () => {
    it('gera o CSV em UTF-8 sem BOM, com LF e na ordem do histórico (RN18)', async () => {
      const response = await exportCsv().expect(200);
      expect(response.headers['content-type']).toMatch(/^text\/csv/);
      const bytes = response.body as Buffer;
      expect([...bytes.subarray(0, 3)]).not.toEqual([0xef, 0xbb, 0xbf]);
      const text = bytes.toString('utf8');
      expect(text).not.toContain('\r');
      expect(text).toBe(
        HEADER +
          '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
          '2026-11-02T10:15:00-03:00;COMPRA;"Zé ""Foguete"" Lima";40,00;2,00;0,00;;-42,00\n' +
          '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
      );
    });

    it('aplica os mesmos filtros do histórico (2.3.4)', async () => {
      const sales = await exportCsv('?type=VENDA').expect(200);
      expect((sales.body as Buffer).toString('utf8')).toBe(
        HEADER +
          '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n',
      );
      const none = await exportCsv(`?player_id=${withoutTransactions}`).expect(
        200,
      );
      expect((none.body as Buffer).toString('utf8')).toBe(HEADER);
    });

    it('erros continuam em JSON', async () => {
      expectJsonError(
        await api().get(`/api/v1/clubs/${club}/transactions/export?type=venda`),
        400,
      );
      expectJsonError(
        await api().get('/api/v1/clubs/999/transactions/export'),
        404,
      );
      expectJsonError(
        await api().get(
          `/api/v1/clubs/${club}/transactions/export?player_id=999`,
        ),
        404,
      );
    });
  });
});
