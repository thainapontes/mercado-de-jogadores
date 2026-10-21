import { applyDecorators } from '@nestjs/common';
import { IsDefined, IsInt, Max, Min } from 'class-validator';
import { MAX_ID } from '../ids/max-id';

export function Required(field: string): PropertyDecorator {
  return IsDefined({ message: `O campo ${field} é obrigatório.` });
}

export function BodyId(field: string): PropertyDecorator {
  const message = `O campo ${field} deve ser um id: inteiro positivo.`;
  return applyDecorators(
    Required(field),
    IsInt({ message }),
    Min(1, { message }),
    Max(MAX_ID, { message }),
  );
}
