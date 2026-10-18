import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { appOptions, setupApp } from './app.setup';
import { readEnv } from './config/env';

async function bootstrap() {
  const env = readEnv(process.env);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    appOptions,
  );
  setupApp(app, env);
  await app.listen(env.port);
}
void bootstrap();
