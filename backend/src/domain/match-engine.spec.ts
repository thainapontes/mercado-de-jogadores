import { playMatch, Starter } from './match-engine';
import { Condition, Position } from './types';

function starter(
  id: number,
  name: string,
  position: Position,
  values: Partial<
    Pick<Starter, 'shooting' | 'passing' | 'dribbling' | 'defending'>
  >,
  condition: Condition = 'APTO',
): Starter {
  return {
    id,
    name,
    position,
    condition,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    ...values,
  };
}

const AGUIAS: Starter[] = [
  starter(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
  starter(
    31,
    'Davi Lins',
    'LAT',
    { dribbling: 74, defending: 66 },
    'MAL_CONDICIONADO',
  ),
  starter(30, 'Rui Prado', 'GOL', { defending: 77 }),
  starter(33, 'Lauro Neves', 'MEI', { passing: 82 }),
  starter(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
];

const DELTA: Starter[] = [
  starter(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  starter(43, 'Nei Soares', 'MEI', { passing: 70 }),
  starter(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
  starter(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
  starter(40, 'Ivo Teles', 'GOL', { defending: 72 }),
];

describe('playMatch (RN20, exemplo Águias FC × Delta FC)', () => {
  const match = playMatch(AGUIAS, DELTA);

  it.each([
    [1, 'HOME', 34, 'shooting', 75, 40, 72, true],
    [2, 'HOME', 33, 'passing', 82, 41, 84, false],
    [3, 'HOME', 31, 'dribbling', 63, 42, 63, false],
    [4, 'AWAY', 44, 'shooting', 81, 30, 77, true],
    [5, 'AWAY', 43, 'passing', 70, 32, 84, false],
    [6, 'AWAY', 42, 'dribbling', 79, 31, 56, true],
  ])(
    'duelo %i: %s ataca com o id %i (%s %i) contra o id %i (defesa %i), gol? %s',
    (order, side, attackerId, attribute, attack, defenderId, defense, goal) => {
      const duel = match.duels[order - 1];
      expect(duel.order).toBe(order);
      expect(duel.attackingSide).toBe(side);
      expect(duel.attacker.player.id).toBe(attackerId);
      expect(duel.attacker.attribute).toBe(attribute);
      expect(duel.attacker.value).toBe(attack);
      expect(duel.defender.player.id).toBe(defenderId);
      expect(duel.defender.attribute).toBe('defending');
      expect(duel.defender.value).toBe(defense);
      expect(duel.goal).toBe(goal);
    },
  );

  it('placar 1 × 2 e result VISITANTE', () => {
    expect(match.duels).toHaveLength(6);
    expect(match.homeGoals).toBe(1);
    expect(match.awayGoals).toBe(2);
    expect(match.result).toBe('VISITANTE');
  });

  it('com os papéis trocados, o resultado se inverte', () => {
    const rematch = playMatch(DELTA, AGUIAS);
    expect(rematch.homeGoals).toBe(2);
    expect(rematch.awayGoals).toBe(1);
    expect(rematch.result).toBe('MANDANTE');
  });

  it('não altera os atributos dos jogadores', () => {
    expect(AGUIAS[1].dribbling).toBe(74);
    expect(AGUIAS[1].defending).toBe(66);
  });
});

describe('playMatch (RN20, casos-limite)', () => {
  const mirror = (id: number): Starter[] => [
    starter(id, 'Ana Goleira', 'GOL', { defending: 70 }),
    starter(id + 1, 'Bia Zagueira', 'ZAG', { defending: 70 }),
    starter(id + 2, 'Duda Meia', 'MEI', { passing: 70 }),
    starter(id + 3, 'Caca Meia', 'MEI', { passing: 70, defending: 70 }),
    starter(id + 4, 'Eva Atacante', 'ATA', { shooting: 70 }),
  ];

  it('valores iguais não dão gol, e 0 × 0 é EMPATE', () => {
    const match = playMatch(mirror(1), mirror(10));
    expect(match.duels.every((duel) => !duel.goal)).toBe(true);
    expect(match.result).toBe('EMPATE');
  });

  it('no 1-2-1, o MEI que vem antes pelo nome é o 2º e ataca no duelo 3', () => {
    const match = playMatch(mirror(1), mirror(10));
    expect(match.duels[2].attacker.player.name).toBe('Caca Meia');
    expect(match.duels[1].attacker.player.name).toBe('Duda Meia');
    expect(match.duels[2].defender.player.name).toBe('Caca Meia');
  });

  it.each([
    [74, 63],
    [50, 43],
    [66, 56],
  ])('MAL_CONDICIONADO: %i × 0,85 vira %i', (attribute, expected) => {
    const home = mirror(1);
    home[4] = starter(
      5,
      'Eva Atacante',
      'ATA',
      { shooting: attribute },
      'MAL_CONDICIONADO',
    );
    expect(playMatch(home, mirror(10)).duels[0].attacker.value).toBe(expected);
  });
});
