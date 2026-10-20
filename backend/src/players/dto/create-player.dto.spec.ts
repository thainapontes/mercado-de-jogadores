import { BadRequestException } from '@nestjs/common';
import { StrictValidationPipe } from '../../common/validation/strict-validation.pipe';
import { CreatePlayerDto } from './create-player.dto';

const MEIA_LUA = {
  name: 'Meia Lua',
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

const pipe = new StrictValidationPipe();

function validate(body: Record<string, unknown>): Promise<CreatePlayerDto> {
  return pipe.transform(body, {
    type: 'body',
    metatype: CreatePlayerDto,
  }) as Promise<CreatePlayerDto>;
}

async function rejectionOf(body: Record<string, unknown>): Promise<string> {
  try {
    await validate(body);
  } catch (error) {
    if (error instanceof BadRequestException) {
      return error.message;
    }
    throw error;
  }
  throw new Error('O corpo deveria ter sido recusado.');
}

describe('CreatePlayerDto', () => {
  it('aceita o Meia Lua do exemplo 2.1.3', async () => {
    await expect(validate(MEIA_LUA)).resolves.toEqual(MEIA_LUA);
  });

  it('ignora campos calculados, controlados e desconhecidos (V7)', async () => {
    const dto = await validate({
      ...MEIA_LUA,
      id: 99,
      base_value: 999,
      market_value: 1,
      overall: 99,
      condition: 'DOENTE',
      club_id: 1,
    });
    expect(dto).toEqual(MEIA_LUA);
  });

  it('normaliza os espaços do nome antes de validar (V4)', async () => {
    const dto = await validate({ ...MEIA_LUA, name: '  Meia   Lua ' });
    expect(dto.name).toBe('Meia Lua');
  });

  it.each([
    ['nome de uma palavra', { name: 'Ana' }, 'pelo menos duas palavras'],
    ['nome com dígito', { name: 'Ana 2' }, 'números'],
    ['nome com dígito colado', { name: 'Ana Lima2' }, 'números'],
    ['nome com só uma palavra com letra', { name: 'Ana .' }, 'duas palavras'],
    ['nome com tabulação', { name: 'Ana\tLima' }, 'tabulação'],
    [
      'nome com 101 caracteres',
      { name: `Ana ${'a'.repeat(97)}` },
      'de 3 a 100',
    ],
    ['nome só de espaços', { name: '   ' }, 'name é obrigatório'],
    ['nome nulo', { name: null }, 'name é obrigatório'],
    ['nome que não é texto', { name: 10 }, 'name deve ser um texto'],
    ['posição em minúsculas', { position: 'mei' }, 'position deve ser'],
    [
      'agilidade como texto',
      { agility: '15' },
      'agility deve ser um número inteiro',
    ],
    [
      'agilidade fracionária',
      { agility: 50.5 },
      'agility deve ser um número inteiro',
    ],
    ['agilidade 0', { agility: 0 }, 'agility deve estar entre 1 e 100'],
    ['agilidade 101', { agility: 101 }, 'agility deve estar entre 1 e 100'],
    [
      'agilidade 86 com 35 anos',
      { age: 35, agility: 86, potential: 82 },
      'no máximo 85',
    ],
    ['idade 15', { age: 15 }, 'age deve estar entre 16 e 45'],
    ['idade 46', { age: 46 }, 'age deve estar entre 16 e 45'],
    ['atributo 0', { pace: 0 }, 'pace deve estar entre 1 e 99'],
    ['atributo 100', { shooting: 100 }, 'shooting deve estar entre 1 e 99'],
    [
      'soma dos atributos 481',
      {
        pace: 81,
        shooting: 80,
        passing: 80,
        dribbling: 80,
        defending: 80,
        physical: 80,
        potential: 81,
      },
      'não pode passar de 480',
    ],
    [
      'potencial menor que o maior atributo',
      { potential: 81 },
      'não pode ser menor',
    ],
    [
      'potencial 34 anos acima do maior atributo',
      { age: 34, potential: 83 },
      'deve ser igual',
    ],
    [
      'potencial 33 anos acima do maior atributo',
      { age: 33, potential: 83 },
      'deve ser igual',
    ],
    [
      'potencial como texto',
      { potential: '86' },
      'potential deve ser um número inteiro',
    ],
    [
      'físico como texto',
      { physical: '64' },
      'physical deve ser um número inteiro',
    ],
    ['potencial 100', { potential: 100 }, 'potential deve estar entre 1 e 99'],
  ])('recusa %s', async (_, change, message) => {
    expect(await rejectionOf({ ...MEIA_LUA, ...change })).toContain(message);
  });

  it('recusa Agility no lugar de agility, como campo ausente', async () => {
    const { agility, ...withoutAgility } = MEIA_LUA;
    expect(
      await rejectionOf({ ...withoutAgility, Agility: agility }),
    ).toContain('agility é obrigatório');
  });

  it.each([
    ['agilidade 85 com 35 anos', { age: 35, agility: 85, potential: 82 }],
    ['agilidade 100 com 34 anos', { age: 34, agility: 100, potential: 82 }],
    [
      'potencial igual ao maior atributo com 33 anos',
      { age: 33, potential: 82 },
    ],
    [
      'potencial acima do maior atributo com 32 anos',
      { age: 32, potential: 90 },
    ],
    [
      'soma dos atributos 480',
      {
        pace: 80,
        shooting: 80,
        passing: 80,
        dribbling: 80,
        defending: 80,
        physical: 80,
        potential: 80,
      },
    ],
    ['nome com 100 caracteres', { name: `Ana ${'a'.repeat(96)}` }],
    ['nome de 3 caracteres com duas palavras', { name: 'A B' }],
    ['nome com hífen e apóstrofo', { name: "Ana-Maria D'Ávila" }],
    ['limites mínimos', { agility: 1, age: 16 }],
    ['inteiro escrito 50.0', { agility: 50.0 }],
  ])('aceita %s', async (_, change) => {
    await expect(validate({ ...MEIA_LUA, ...change })).resolves.toBeInstanceOf(
      CreatePlayerDto,
    );
  });
});
