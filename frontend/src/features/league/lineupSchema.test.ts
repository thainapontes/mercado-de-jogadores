import { describe, expect, it } from 'vitest';
import { lineupSchema } from './lineupSchema';

describe('lineupSchema', () => {
  it('envia a formação e os 5 ids como números', () => {
    expect(
      lineupSchema.parse({
        formation: '2-1-1',
        player_ids: ['30', '32', '31', '33', '34'],
      }),
    ).toEqual({ formation: '2-1-1', player_ids: [30, 32, 31, 33, 34] });
  });

  it('exige a formação e as 5 vagas preenchidas', () => {
    const result = lineupSchema.safeParse({
      formation: '',
      player_ids: ['30', '', '31', '33', '34'],
    });
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual([
      'formation',
      'player_ids.1',
    ]);
  });

  it('não trata as vagas vazias como jogador repetido', () => {
    const result = lineupSchema.safeParse({
      formation: '2-1-1',
      player_ids: ['30', '', '', '', ''],
    });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      Array(4).fill('Escolha o titular desta vaga.'),
    );
  });

  it('não aceita o mesmo jogador em duas vagas', () => {
    const result = lineupSchema.safeParse({
      formation: '3-1',
      player_ids: ['30', '31', '31', '32', '34'],
    });
    expect(result.error?.issues[0].message).toBe(
      'O mesmo jogador não pode ocupar duas vagas.',
    );
  });
});
