import { describe, expect, it } from 'vitest';
import { matchSchema } from './matchSchema';

describe('matchSchema', () => {
  it('envia os ids dos clubes como números', () => {
    expect(matchSchema.parse({ home_club_id: '1', away_club_id: '2' })).toEqual(
      { home_club_id: 1, away_club_id: 2 },
    );
  });

  it('exige mandante e visitante', () => {
    const result = matchSchema.safeParse({
      home_club_id: '',
      away_club_id: '',
    });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Escolha o mandante.',
      'Escolha o visitante.',
    ]);
  });

  it('recusa o mesmo clube dos dois lados', () => {
    const result = matchSchema.safeParse({
      home_club_id: '1',
      away_club_id: '1',
    });
    expect(result.error?.issues[0]).toMatchObject({
      path: ['away_club_id'],
      message: 'O visitante precisa ser diferente do mandante.',
    });
  });
});
