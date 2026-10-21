import { calculateStandings, LeagueClub, PlayedMatch } from './standings';

const CLUBS: LeagueClub[] = [
  { id: 1, name: 'Águias FC' },
  { id: 2, name: 'Delta FC' },
  { id: 3, name: 'Gama SC' },
  { id: 4, name: 'Épsilon EC' },
  { id: 5, name: 'Tubarões EC' },
  { id: 6, name: 'Mangue FC' },
];

function match(
  homeClubId: number,
  homeGoals: number,
  awayGoals: number,
  awayClubId: number,
): PlayedMatch {
  return { homeClubId, awayClubId, homeGoals, awayGoals };
}

describe('calculateStandings (RN21)', () => {
  it('reproduz a tabela de exemplo com 6 clubes e 4 partidas', () => {
    const standings = calculateStandings(CLUBS, [
      match(1, 1, 2, 2),
      match(3, 2, 1, 4),
      match(4, 3, 2, 1),
      match(2, 0, 1, 3),
    ]);
    expect(
      standings.map((row) => [
        row.position,
        row.clubName,
        row.points,
        row.goalDifference,
        row.goalsFor,
      ]),
    ).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
    expect(standings[0]).toEqual({
      position: 1,
      clubId: 3,
      clubName: 'Gama SC',
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 6,
    });
    expect(standings[5]).toMatchObject({ played: 2, wins: 0, losses: 2 });
  });

  it('empate vale 1 ponto para cada lado', () => {
    const [first, second] = calculateStandings(CLUBS.slice(0, 2), [
      match(2, 1, 1, 1),
    ]);
    expect([first.clubName, first.points, first.draws]).toEqual([
      'Águias FC',
      1,
      1,
    ]);
    expect([second.clubName, second.points, second.draws]).toEqual([
      'Delta FC',
      1,
      1,
    ]);
  });

  it('nomes iguais sem acento empatam e o id desempata', () => {
    const standings = calculateStandings(
      [
        { id: 9, name: 'Águias FC' },
        { id: 3, name: 'Aguias FC' },
      ],
      [],
    );
    expect(standings.map(({ clubId }) => clubId)).toEqual([3, 9]);
  });

  it('sem clubes, lista vazia', () => {
    expect(calculateStandings([], [])).toEqual([]);
  });
});
