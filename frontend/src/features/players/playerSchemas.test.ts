import { describe, expect, it } from 'vitest';
import { createPlayerSchema, updatePlayerSchema } from './playerSchemas';

const validPlayer = {
  name: '  Meia   Lua ',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

function errorsOf(input: unknown) {
  const result = createPlayerSchema.safeParse(input);
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      );
}

describe('createPlayerSchema', () => {
  it('aceita o jogador do enunciado e junta os espaços do nome', () => {
    expect(createPlayerSchema.parse(validPlayer).name).toBe('Meia Lua');
  });

  it.each([
    ['agility', 0, 'Agilidade: de 1 a 100.'],
    ['agility', 101, 'Agilidade: de 1 a 100.'],
    ['age', 15, 'Idade: de 16 a 45.'],
    ['age', 46, 'Idade: de 16 a 45.'],
    ['pace', 100, 'Velocidade: de 1 a 99.'],
    ['potential', 0, 'Potencial: de 1 a 99.'],
    ['age', Number.NaN, 'Informe idade.'],
    ['agility', 50.5, 'Agilidade precisa ser um número inteiro.'],
  ])('recusa %s = %s', (field, value, message) => {
    expect(errorsOf({ ...validPlayer, [field]: value })[field]).toBe(message);
  });

  it('aceita os limites das faixas', () => {
    expect(
      createPlayerSchema.safeParse({
        ...validPlayer,
        agility: 100,
        age: 16,
        pace: 1,
        potential: 99,
      }).success,
    ).toBe(true);
  });

  it.each([
    ['Al', 'Nome: de 3 a 100 caracteres.'],
    ['   ', 'Informe nome.'],
    ['A'.repeat(101), 'Nome: de 3 a 100 caracteres.'],
  ])('recusa o nome %j', (name, message) => {
    expect(errorsOf({ ...validPlayer, name }).name).toBe(message);
  });

  it('exige a posição', () => {
    expect(errorsOf({ ...validPlayer, position: '' }).position).toBe(
      'Escolha a posição.',
    );
  });
});

describe('updatePlayerSchema', () => {
  it('valida só nome, posição, agilidade e idade', () => {
    expect(
      updatePlayerSchema.parse({
        name: 'Davi Melo',
        position: 'MEI',
        agility: 70,
        age: 23,
      }),
    ).toEqual({ name: 'Davi Melo', position: 'MEI', agility: 70, age: 23 });
  });
});
