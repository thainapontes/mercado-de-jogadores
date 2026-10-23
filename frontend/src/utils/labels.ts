import type { Condition, PlayerSort, Position } from '../api/players';

export const POSITION_LABELS: Record<Position, string> = {
  GOL: 'GOL · Goleiro',
  ZAG: 'ZAG · Zagueiro',
  LAT: 'LAT · Lateral',
  MEI: 'MEI · Meio-campo',
  ATA: 'ATA · Atacante',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
};

export const PLAYER_SORT_LABELS: Record<PlayerSort, string> = {
  name: 'Nome (A–Z)',
  value_asc: 'Valor de mercado (menor primeiro)',
  value_desc: 'Valor de mercado (maior primeiro)',
  age_asc: 'Idade (mais novo primeiro)',
  age_desc: 'Idade (mais velho primeiro)',
  position: 'Posição (GOL → ATA)',
};
