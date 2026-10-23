import type { Formation } from '../../api/league';
import type { Position } from '../../api/players';

export interface LineupSlot {
  label: string;
  positions: Position[];
}

const SECTOR_SIZES: Record<Formation, [number, number, number]> = {
  '3-1': [3, 0, 1],
  '2-2': [2, 0, 2],
  '2-1-1': [2, 1, 1],
  '1-2-1': [1, 2, 1],
};

const SECTORS: { label: string; positions: Position[] }[] = [
  { label: 'Defesa (ZAG ou LAT)', positions: ['ZAG', 'LAT'] },
  { label: 'Meio (MEI)', positions: ['MEI'] },
  { label: 'Ataque (ATA)', positions: ['ATA'] },
];

export function lineupSlots(formation: Formation): LineupSlot[] {
  const fieldSlots = SECTORS.flatMap((sector, index) =>
    Array.from({ length: SECTOR_SIZES[formation][index] }, (_, slot) => ({
      label: `${sector.label} ${slot + 1}`,
      positions: sector.positions,
    })),
  );
  return [{ label: 'Goleiro (GOL)', positions: ['GOL'] }, ...fieldSlots];
}
