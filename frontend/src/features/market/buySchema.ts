import { z } from 'zod';
import { toApiDateTime } from '../../utils/format';
import { requiredChoice } from '../../utils/validation';

export const buySchema = z.object({
  club_id: requiredChoice('Escolha o clube comprador.').transform(Number),
  loyalty_until: requiredChoice('Informe o fim da fidelidade.').transform(
    toApiDateTime,
  ),
});

export type BuyForm = z.input<typeof buySchema>;
