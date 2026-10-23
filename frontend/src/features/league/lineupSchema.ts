import { z } from 'zod';
import { FORMATIONS } from '../../api/league';
import { requiredChoice } from '../../utils/validation';

export const EMPTY_SLOTS = ['', '', '', '', ''];

export const lineupSchema = z.object({
  formation: z.enum(FORMATIONS, { error: 'Escolha a formação.' }),
  player_ids: z
    .array(requiredChoice('Escolha o titular desta vaga.').transform(Number))
    .length(EMPTY_SLOTS.length)
    .refine(
      (ids) => {
        // Vaga vazia chega aqui como '' (já tem o próprio erro) e não conta como repetida.
        const chosen = ids.filter((id) => Number.isInteger(id));
        return new Set(chosen).size === chosen.length;
      },
      { error: 'O mesmo jogador não pode ocupar duas vagas.' },
    ),
});

export type LineupForm = z.input<typeof lineupSchema>;
