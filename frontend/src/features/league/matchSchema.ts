import { z } from 'zod';
import { requiredChoice } from '../../utils/validation';

export const matchSchema = z
  .object({
    home_club_id: requiredChoice('Escolha o mandante.').transform(Number),
    away_club_id: requiredChoice('Escolha o visitante.').transform(Number),
  })
  .refine(
    (match) => !match.home_club_id || match.home_club_id !== match.away_club_id,
    {
      error: 'O visitante precisa ser diferente do mandante.',
      path: ['away_club_id'],
    },
  );

export type MatchForm = z.input<typeof matchSchema>;
