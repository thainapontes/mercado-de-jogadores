import { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { appOptions, setupApp } from '../../src/app.setup';
import { ClockService } from '../../src/common/clock/clock.service';
import { PrismaService } from '../../src/prisma/prisma.service';

export interface TestApp {
  app: INestApplication<App>;
  prisma: PrismaService;
}

export async function createTestApp(now: Date): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ClockService)
    .useValue({ now: () => now })
    .compile();
  const app =
    moduleRef.createNestApplication<NestExpressApplication>(appOptions);
  app.useLogger(false);
  setupApp(app, { corsOrigins: ['http://localhost:5173'] });
  await app.init();
  return { app, prisma: moduleRef.get(PrismaService) };
}
