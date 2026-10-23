import { z } from 'zod';
import { FORMATIONS } from '../../api/league';
import { requiredChoice } from '../../utils/validation';

export const EMPTY_SLOTS = ['', '', '', '', ''];

export const lineupSchema = z.object({
  formation: z.enum(FORMATIONS, { error: 'Escolha a formação.' }),
  player_ids: z
    .array(requiredChoice('Escolha o titular desta vaga.').transform(Number))
    .length(EMPTY_SLOTS.length)
    .refine((ids) => new Set(ids).size === ids.length, {
      error: 'O mesmo jogador não pode ocupar duas vagas.',
    }),
});

export type LineupForm = z.input<typeof lineupSchema>;
