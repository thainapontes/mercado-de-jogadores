import { compareNames, compareRosterOrder, RosterEntry } from './ordering';

function sortNames(names: string[]): string[] {
  return [...names].sort(compareNames);
}

describe('compareNames (Premissas: ordem alfabética)', () => {
  it('"Épsilon" fica entre "Delta" e "Gama"', () => {
    expect(sortNames(['Gama', 'Épsilon', 'Delta'])).toEqual([
      'Delta',
      'Épsilon',
      'Gama',
    ]);
  });

  it('"Ana Lima" vem antes de "Ana-Maria" (espaço antes do hífen)', () => {
    expect(sortNames(['Ana-Maria', 'Ana Lima'])).toEqual([
      'Ana Lima',
      'Ana-Maria',
    ]);
  });

  it('o hífen vem antes das letras', () => {
    expect(sortNames(['Anabela', 'Ana-Maria'])).toEqual([
      'Ana-Maria',
      'Anabela',
    ]);
  });

  it('maiúsculas não mudam a ordem', () => {
    expect(sortNames(['beto', 'Alice', 'carla'])).toEqual([
      'Alice',
      'beto',
      'carla',
    ]);
  });

  it('nome mais curto vem antes quando é início do outro', () => {
    expect(sortNames(['Ana Lima', 'Ana'])).toEqual(['Ana', 'Ana Lima']);
  });

  it.each([
    ['Águias FC', 'Aguias FC'],
    ['Conceição', 'CONCEICAO'],
  ])('"%s" e "%s" empatam', (a, b) => {
    expect(compareNames(a, b)).toBe(0);
  });
});

describe('compareRosterOrder (RN11: posição, nome e id)', () => {
  it('ordena GOL, ZAG, LAT, MEI, ATA; depois nome; depois id', () => {
    const players: RosterEntry[] = [
      { id: 7, name: 'Zeca Alves', position: 'ATA' },
      { id: 3, name: 'Bruno Lima', position: 'MEI' },
      { id: 9, name: 'Águias Neto', position: 'MEI' },
      { id: 2, name: 'Aguias Neto', position: 'MEI' },
      { id: 5, name: 'Caio Rocha', position: 'LAT' },
      { id: 4, name: 'Davi Souza', position: 'ZAG' },
      { id: 8, name: 'Rui Prado', position: 'GOL' },
    ];
    expect([...players].sort(compareRosterOrder).map(({ id }) => id)).toEqual([
      8, 4, 5, 2, 9, 3, 7,
    ]);
  });
});
