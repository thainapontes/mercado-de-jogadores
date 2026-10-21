import { resultOf } from './match-engine';
import { compareNames } from './ordering';

const POINTS_PER_WIN = 3;
const POINTS_PER_DRAW = 1;

export interface LeagueClub {
  id: number;
  name: string;
}

export interface PlayedMatch {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface Standing {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

type ClubRecord = Omit<Standing, 'position'>;

export function calculateStandings(
  clubs: LeagueClub[],
  matches: PlayedMatch[],
): Standing[] {
  const records = new Map(clubs.map((club) => [club.id, emptyRecord(club)]));
  for (const match of matches) {
    const result = resultOf(match.homeGoals, match.awayGoals);
    addGame(records.get(match.homeClubId), match.homeGoals, match.awayGoals, {
      won: result === 'MANDANTE',
      drew: result === 'EMPATE',
    });
    addGame(records.get(match.awayClubId), match.awayGoals, match.homeGoals, {
      won: result === 'VISITANTE',
      drew: result === 'EMPATE',
    });
  }
  return [...records.values()]
    .sort(compareRecords)
    .map((record, index) => ({ position: index + 1, ...record }));
}

function emptyRecord(club: LeagueClub): ClubRecord {
  return {
    clubId: club.id,
    clubName: club.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function addGame(
  record: ClubRecord | undefined,
  goalsFor: number,
  goalsAgainst: number,
  { won, drew }: { won: boolean; drew: boolean },
): void {
  if (!record) {
    return;
  }
  record.played++;
  record.goalsFor += goalsFor;
  record.goalsAgainst += goalsAgainst;
  record.goalDifference = record.goalsFor - record.goalsAgainst;
  if (won) {
    record.wins++;
    record.points += POINTS_PER_WIN;
  } else if (drew) {
    record.draws++;
    record.points += POINTS_PER_DRAW;
  } else {
    record.losses++;
  }
}

function compareRecords(a: ClubRecord, b: ClubRecord): number {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    compareNames(a.clubName, b.clubName) ||
    a.clubId - b.clubId
  );
}
