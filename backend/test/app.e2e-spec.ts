import {
  Body,
  Controller,
  Delete,
  Get,
  INestApplication,
  Param,
  Post,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { IsInt, IsString } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';
import { appOptions, setupApp } from '../src/app.setup';
import { ParseIdPipe } from '../src/common/pipes/parse-id.pipe';
import { expectJsonError } from './support/expect-json-error';

const FRONTEND_ORIGIN = 'http://localhost:5173';

class SampleDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  name: string;

  @IsInt({ message: 'A idade deve ser um número inteiro.' })
  age: number;
}

@Controller('samples')
class SampleController {
  @Post()
  create(@Body() body: SampleDto) {
    return body;
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return { id };
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return { id };
  }

  @Get('broken/now')
  broken() {
    throw new Error('falha interna simulada');
  }
}

describe('Fundação da API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SampleController],
    }).compile();
    const nestApp =
      moduleRef.createNestApplication<NestExpressApplication>(appOptions);
    nestApp.useLogger(false);
    setupApp(nestApp, { corsOrigins: [FRONTEND_ORIGIN] });
    await nestApp.init();
    app = nestApp;
  });

  afterAll(async () => {
    await app.close();
  });

  const postRaw = (body: string) =>
    request(app.getHttpServer())
      .post('/api/v1/samples')
      .set('Content-Type', 'application/json')
      .send(body);

  describe('prefixo e rota inexistente', () => {
    it('responde nas rotas com /api/v1', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/samples/1')
        .expect(200, { id: 1 });
    });

    it('rota inexistente → 404 em JSON', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/inexistente',
      );
      expectJsonError(response, 404);
      expect(response.body).toEqual({ message: 'Recurso não encontrado.' });
    });

    it('rota sem o prefixo → 404', async () => {
      expectJsonError(
        await request(app.getHttpServer()).get('/samples/1'),
        404,
      );
    });
  });

  describe('V1: corpo precisa ser um objeto JSON', () => {
    it.each(['{ "name": "Ana', '[]', '"x"', '10', 'null', 'true'])(
      'recusa %j com 400',
      async (body) => {
        expectJsonError(await postRaw(body), 400);
      },
    );

    it('recusa corpo ausente com 400', async () => {
      expectJsonError(
        await request(app.getHttpServer()).post('/api/v1/samples'),
        400,
      );
    });

    it('recusa corpo que não é application/json com 400', async () => {
      expectJsonError(
        await request(app.getHttpServer())
          .post('/api/v1/samples')
          .set('Content-Type', 'text/plain')
          .send('{"name":"Ana","age":20}'),
        400,
      );
    });

    it('ignora corpo, mesmo quebrado, em pedido sem corpo', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/samples/1')
        .set('Content-Type', 'application/json')
        .send('{ "quebrado"')
        .expect(200, { id: 1 });
    });
  });

  describe('V2 e V7: tipos estritos e campos extras ignorados', () => {
    it('aceita o objeto válido e ignora campos extras', async () => {
      await postRaw('{"name":"Ana","age":20,"id":99,"cash":10}').expect(201, {
        name: 'Ana',
        age: 20,
      });
    });

    it('aceita 50.0 como inteiro', async () => {
      await postRaw('{"name":"Ana","age":50.0}').expect(201, {
        name: 'Ana',
        age: 50,
      });
    });

    it.each(['"15"', '50.5', 'null'])(
      'recusa idade %s com 400',
      async (age) => {
        const response = await postRaw(`{"name":"Ana","age":${age}}`);
        expectJsonError(response, 400);
        expect(response.body).toEqual({
          message: 'A idade deve ser um número inteiro.',
        });
      },
    );

    it('devolve uma única mensagem em texto', async () => {
      const response = await postRaw('{}');
      expectJsonError(response, 400);
      expect(response.body).toEqual({ message: 'O nome deve ser um texto.' });
    });
  });

  describe('V8: id malformado na URL → 404', () => {
    it.each(['abc', '0', '-1', '1.5', '01', '2147483648'])(
      'GET /samples/%s',
      async (id) => {
        expectJsonError(
          await request(app.getHttpServer()).get(`/api/v1/samples/${id}`),
          404,
        );
      },
    );
  });

  it('erro inesperado → 500 genérico, sem stack trace', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/samples/broken/now',
    );
    expectJsonError(response, 500);
    expect(JSON.stringify(response.body)).not.toContain('falha interna');
  });

  describe('CORS', () => {
    it('libera a origem do frontend e expõe o Location', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/samples/1')
        .set('Origin', FRONTEND_ORIGIN);
      expect(response.headers['access-control-allow-origin']).toBe(
        FRONTEND_ORIGIN,
      );
      expect(response.headers['access-control-expose-headers']).toBe(
        'Location',
      );
    });

    it('não libera outra origem', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/samples/1')
        .set('Origin', 'http://malicioso.example');
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  it('Swagger em /api/docs', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs');
    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger');
  });
});
