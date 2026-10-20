import { Transform } from 'class-transformer';
import { normalizeName } from '../text/normalize-name';

export function NormalizeName(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return normalizeName(value) || undefined;
  });
}
