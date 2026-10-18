import type { NestApplicationOptions } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { jsonBody } from './common/body/json-body.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { requestLogger } from './common/logging/request-logger.middleware';
import { ObjectBodyPipe } from './common/pipes/object-body.pipe';
import { StrictValidationPipe } from './common/validation/strict-validation.pipe';
import type { AppEnv } from './config/env';

export const appOptions: NestApplicationOptions = { bodyParser: false };

export function setupApp(
  app: NestExpressApplication,
  env: Pick<AppEnv, 'corsOrigins'>,
): void {
  app.use(requestLogger);
  app.enableCors({ origin: env.corsOrigins, exposedHeaders: ['Location'] });
  app.use(jsonBody);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ObjectBodyPipe(), new StrictValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Mercado de Jogadores')
      .setDescription('API REST do mercado de jogadores da liga.')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);
}
