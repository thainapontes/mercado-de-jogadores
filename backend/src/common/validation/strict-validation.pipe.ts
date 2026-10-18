import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export class StrictValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new BadRequestException(firstMessage(errors) ?? 'Dados inválidos.'),
    });
  }

  protected transformPrimitive(value: unknown): unknown {
    return value;
  }
}

function firstMessage(errors: ValidationError[]): string | undefined {
  for (const error of errors) {
    const message =
      Object.values(error.constraints ?? {})[0] ??
      firstMessage(error.children ?? []);
    if (message) {
      return message;
    }
  }
  return undefined;
}
