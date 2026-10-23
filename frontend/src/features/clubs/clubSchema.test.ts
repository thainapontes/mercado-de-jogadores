import { describe, expect, it } from 'vitest';
import { createClubSchema } from './clubSchema';

function firstError(input: unknown) {
  const result = createClubSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0].message;
}

describe('createClubSchema', () => {
  it('aceita o clube do enunciado', () => {
    expect(
      createClubSchema.parse({ name: 'Águias FC', acronym: 'AGU' }),
    ).toEqual({ name: 'Águias FC', acronym: 'AGU' });
  });

  it.each([
    [{ name: 'FC', acronym: 'AGU' }, 'Nome: de 3 a 60 caracteres.'],
    [{ name: 'A'.repeat(61), acronym: 'AGU' }, 'Nome: de 3 a 60 caracteres.'],
    [{ name: 'Águias FC', acronym: '' }, 'Informe a sigla.'],
    [{ name: 'Águias FC', acronym: 'AG' }, 'A sigla tem exatamente 3 letras.'],
    [
      { name: 'Águias FC', acronym: 'AGUI' },
      'A sigla tem exatamente 3 letras.',
    ],
  ])('recusa %j', (input, message) => {
    expect(firstError(input)).toBe(message);
  });
});
