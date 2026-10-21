import {
  calculateNetWorth,
  calculateSquadValue,
  ClubSort,
  compareClubs,
  RankedClub,
} from './club-value';
import { Decimal } from './money';

function club(id: number, name: string, netWorth: string): RankedClub {
  return { id, name, netWorth: new Decimal(netWorth) };
}

describe('valor do elenco e patrimônio (RN11)', () => {
  it('soma os valores de mercado do elenco', () => {
    const values = ['37.00', '44.40', '1.00'].map(
      (value) => new Decimal(value),
    );
    expect(calculateSquadValue(values).toFixed(2)).toBe('82.40');
  });

  it('elenco vazio vale 0,00', () => {
    expect(calculateSquadValue([]).toFixed(2)).toBe('0.00');
  });

  it('patrimônio = caixa + elenco (exemplo 2.2.2)', () => {
    expect(
      calculateNetWorth(new Decimal('261.15'), new Decimal('37.00')).toFixed(2),
    ).toBe('298.15');
  });
});

describe('compareClubs', () => {
  const clubs = [
    club(1, 'Águias FC', '300.00'),
    club(2, 'Delta FC', '298.15'),
    club(3, 'Aguias FC', '300.00'),
    club(4, 'Épsilon EC', '310.00'),
    club(5, 'Beta FC', '300.00'),
  ];

  it.each<[ClubSort, number[]]>([
    ['name', [1, 3, 5, 2, 4]],
    ['net_worth_asc', [2, 1, 3, 5, 4]],
    ['net_worth_desc', [4, 1, 3, 5, 2]],
  ])('sort=%s → ids %j (empate pelo nome e depois pelo id)', (sort, ids) => {
    expect([...clubs].sort(compareClubs(sort)).map(({ id }) => id)).toEqual(
      ids,
    );
  });
});
