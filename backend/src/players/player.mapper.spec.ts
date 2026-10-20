import { Decimal } from '../domain/money';
import { Player } from '../generated/prisma/client';
import { toPlayerResponse } from './player.mapper';

const MEIA_LUA: Player = {
  id: 2,
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  baseValue: new Decimal('40.00'),
  condition: 'APTO',
  clubId: null,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
  deletedAt: null,
  createdAt: new Date('2026-11-12T18:00:00.000Z'),
  updatedAt: new Date('2026-11-12T18:00:00.000Z'),
};

describe('toPlayerResponse', () => {
  it('monta o Meia Lua do exemplo 2.1.3, com overall e valor de mercado calculados', () => {
    expect(toPlayerResponse(MEIA_LUA)).toEqual({
      id: 2,
      name: 'Meia Lua',
      position: 'MEI',
      agility: 85,
      age: 25,
      condition: 'APTO',
      base_value: 40,
      market_value: 40,
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 64,
      potential: 86,
      overall: 75,
      club_id: null,
    });
  });

  it('MAL_CONDICIONADO muda o valor de mercado para 37,00 (exemplo 2.1.4)', () => {
    expect(
      toPlayerResponse({ ...MEIA_LUA, condition: 'MAL_CONDICIONADO' })
        .market_value,
    ).toBe(37);
  });

  it('o overall segue a posição atual, e o valor base não muda', () => {
    const response = toPlayerResponse({ ...MEIA_LUA, position: 'ATA' });
    expect(response.overall).not.toBe(75);
    expect(response.base_value).toBe(40);
  });
});
