import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Decimal } from '../../domain/money';
import { MAX_ID } from '../ids/max-id';
import { hasControlCharacter, normalizeName } from '../text/normalize-name';
import { Satisfies } from '../validation/satisfies';

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const DECIMAL = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
const LIST_SEPARATOR = ',';

export function isQueryInteger(value: unknown): value is string {
  return typeof value === 'string' && POSITIVE_INTEGER.test(value);
}

export function isQueryDecimal(value: unknown): value is string {
  return typeof value === 'string' && DECIMAL.test(value);
}

export function splitQueryList(value: string): string[] {
  return value.split(LIST_SEPARATOR);
}

export function QueryInteger(
  field: string,
  min: number,
  max: number,
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Satisfies(
      'queryInteger',
      (value) =>
        isQueryInteger(value) && Number(value) >= min && Number(value) <= max,
      `O parâmetro ${field} deve ser um inteiro de ${min} a ${max}, escrito só com dígitos.`,
    ),
  );
}

export function QueryId(field: string): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Satisfies(
      'queryId',
      (value) => isQueryInteger(value) && Number(value) <= MAX_ID,
      `O parâmetro ${field} deve ser um id: inteiro positivo, escrito só com dígitos.`,
    ),
  );
}

export function QueryDecimal(field: string, max: number): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Satisfies(
      'queryDecimal',
      (value) => isQueryDecimal(value) && new Decimal(value).lte(max),
      `O parâmetro ${field} deve ser um decimal de 0 a ${max}, com até 2 casas e ponto (ex.: 10.55).`,
    ),
  );
}

export function QueryEnum(
  field: string,
  values: readonly string[],
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Satisfies(
      'queryEnum',
      (value) => typeof value === 'string' && values.includes(value),
      `O parâmetro ${field} deve ser ${values.join(', ')}.`,
    ),
  );
}

export function QueryList(
  field: string,
  values: readonly string[],
  options: { maxItems: number; keyOf: (value: string) => string },
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Satisfies(
      'queryList',
      (value) => {
        if (typeof value !== 'string') {
          return false;
        }
        const items = splitQueryList(value);
        const keys = new Set(items.map(options.keyOf));
        return (
          items.length <= options.maxItems &&
          keys.size === items.length &&
          items.every((item) => values.includes(item))
        );
      },
      `O parâmetro ${field} aceita até ${options.maxItems} de ${values.join(', ')}, separados por vírgula, sem espaços e sem repetir.`,
    ),
  );
}

export function QuerySearch(
  field: string,
  minLength: number,
  maxLength: number,
): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? normalizeName(value) : value,
    ),
    IsOptional(),
    Satisfies(
      'querySearch',
      (value) => {
        if (typeof value !== 'string' || hasControlCharacter(value)) {
          return false;
        }
        const length = Array.from(value).length;
        return length >= minLength && length <= maxLength;
      },
      `O parâmetro ${field} deve ter de ${minLength} a ${maxLength} caracteres, sem tabulação nem quebra de linha.`,
    ),
  );
}
