import { describe, expect, it } from 'vitest';
import { buySchema } from './buySchema';

describe('buySchema', () => {
  it('envia o clube como número e a data com -03:00', () => {
    expect(
      buySchema.parse({ club_id: '1', loyalty_until: '2027-03-02T10:15' }),
    ).toEqual({ club_id: 1, loyalty_until: '2027-03-02T10:15-03:00' });
  });

  it('exige o clube e o fim da fidelidade', () => {
    const result = buySchema.safeParse({ club_id: '', loyalty_until: '' });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Escolha o clube comprador.',
      'Informe o fim da fidelidade.',
    ]);
  });
});
