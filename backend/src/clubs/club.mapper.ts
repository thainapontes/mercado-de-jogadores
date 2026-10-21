import { formatApiDateTime } from '../common/dates/api-date-time';
import { calculateNetWorth, calculateSquadValue } from '../domain/club-value';
import { Decimal } from '../domain/money';
import { penaltyRate, remainingDays } from '../domain/sale';
import { Club, Contract, Player } from '../generated/prisma/client';
import {
  marketValueOf,
  PlayerResponse,
  toPlayerResponse,
} from '../players/player.mapper';

export interface ClubValues {
  squadValue: Decimal;
  netWorth: Decimal;
}

export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ContractView {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface RosterPlayerResponse extends PlayerResponse {
  contract: ContractView | null;
}

export interface ClubDetailResponse extends ClubResponse {
  players: RosterPlayerResponse[];
}

export function clubValuesOf(club: Club, players: Player[]): ClubValues {
  const squadValue = calculateSquadValue(players.map(marketValueOf));
  return { squadValue, netWorth: calculateNetWorth(club.cash, squadValue) };
}

export function toClubResponse(club: Club, values: ClubValues): ClubResponse {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash.toNumber(),
    squad_value: values.squadValue.toNumber(),
    net_worth: values.netWorth.toNumber(),
  };
}

export function toClubDetailResponse(
  club: Club,
  roster: Player[],
  activeContracts: Contract[],
  now: Date,
): ClubDetailResponse {
  return {
    ...toClubResponse(club, clubValuesOf(club, roster)),
    players: roster.map((player) => {
      const contract = activeContracts.find(
        ({ playerId }) => playerId === player.id,
      );
      return {
        ...toPlayerResponse(player),
        contract: contract ? toContractView(contract, now) : null,
      };
    }),
  };
}

function toContractView(contract: Contract, now: Date): ContractView {
  const days = remainingDays(contract.loyaltyUntil, now);
  return {
    purchase_value: contract.purchaseValue.toNumber(),
    loyalty_until: formatApiDateTime(contract.loyaltyUntil),
    remaining_days: days,
    penalty_rate: penaltyRate(days),
  };
}
