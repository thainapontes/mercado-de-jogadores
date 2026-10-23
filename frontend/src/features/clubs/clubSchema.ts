import { z } from 'zod';
import { nameField } from '../../utils/validation';

export const createClubSchema = z.object({
  name: nameField('Nome', 3, 60),
  acronym: z
    .string()
    .trim()
    .min(1, { error: 'Informe a sigla.', abort: true })
    .length(3, 'A sigla tem exatamente 3 letras.'),
});

export type CreateClubForm = z.input<typeof createClubSchema>;
