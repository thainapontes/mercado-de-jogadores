import { z } from 'zod';
import { CONDITIONS, POSITIONS } from '../../api/players';
import { integerField, nameField } from '../../utils/validation';

const position = z.enum(POSITIONS, { error: 'Escolha a posição.' });

const basicFields = {
  name: nameField('Nome', 3, 100),
  position,
  agility: integerField('Agilidade', 1, 100),
  age: integerField('Idade', 16, 45),
};

export const createPlayerSchema = z.object({
  ...basicFields,
  pace: integerField('Velocidade', 1, 99),
  shooting: integerField('Finalização', 1, 99),
  passing: integerField('Passe', 1, 99),
  dribbling: integerField('Drible', 1, 99),
  defending: integerField('Defesa', 1, 99),
  physical: integerField('Físico', 1, 99),
  potential: integerField('Potencial', 1, 99),
});

export const updatePlayerSchema = z.object(basicFields);

export const conditionSchema = z.object({
  condition: z.enum(CONDITIONS, { error: 'Escolha a condição.' }),
});

export type CreatePlayerForm = z.input<typeof createPlayerSchema>;
export type UpdatePlayerForm = z.input<typeof updatePlayerSchema>;
