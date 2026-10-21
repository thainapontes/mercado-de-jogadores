import { applyDecorators } from '@nestjs/common';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import { NormalizeName } from '../../common/validation/normalize-name.transform';
import { Required } from '../../common/validation/required';
import { Satisfies } from '../../common/validation/satisfies';
import { CONDITIONS, POSITIONS } from '../../domain/types';
import {
  AGILITY_MAX,
  AGILITY_MIN,
  isAgilityAllowedForAge,
  isInteger,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  playerNameProblem,
  SENIOR_AGE,
  SENIOR_AGILITY_MAX,
} from './player-rules';

export function IntegerBetween(
  field: string,
  min: number,
  max: number,
): PropertyDecorator {
  return applyDecorators(
    Required(field),
    IsInt({ message: `O campo ${field} deve ser um número inteiro.` }),
    Min(min, { message: `O campo ${field} deve estar entre ${min} e ${max}.` }),
    Max(max, { message: `O campo ${field} deve estar entre ${min} e ${max}.` }),
  );
}

export function PlayerName(): PropertyDecorator {
  return applyDecorators(
    NormalizeName(),
    Required('name'),
    IsString({ message: 'O campo name deve ser um texto.' }),
    Satisfies(
      'noControlCharacter',
      (name: string) => playerNameProblem(name) !== 'control-character',
      'O nome não pode ter tabulação nem quebra de linha.',
    ),
    Satisfies(
      'playerNameLength',
      (name: string) => playerNameProblem(name) !== 'length',
      `O nome deve ter de ${NAME_MIN_LENGTH} a ${NAME_MAX_LENGTH} caracteres.`,
    ),
    Satisfies(
      'playerNameWithoutDigits',
      (name: string) => playerNameProblem(name) !== 'digit',
      'O nome não pode ter números.',
    ),
    Satisfies(
      'playerNameWords',
      (name: string) => playerNameProblem(name) !== 'words',
      'O nome deve ter pelo menos duas palavras.',
    ),
  );
}

export function PlayerPosition(): PropertyDecorator {
  return applyDecorators(
    Required('position'),
    IsIn(POSITIONS, {
      message: `O campo position deve ser ${POSITIONS.join(', ')}.`,
    }),
  );
}

export function PlayerAgility(): PropertyDecorator {
  return applyDecorators(
    IntegerBetween('agility', AGILITY_MIN, AGILITY_MAX),
    Satisfies<{ age?: unknown }>(
      'agilityForAge',
      (agility, dto) =>
        !isInteger(agility) || isAgilityAllowedForAge(agility, dto.age),
      `Com ${SENIOR_AGE} anos ou mais, a agilidade é no máximo ${SENIOR_AGILITY_MAX}.`,
    ),
  );
}

export function PlayerCondition(): PropertyDecorator {
  return applyDecorators(
    Required('condition'),
    IsIn(CONDITIONS, {
      message: `O campo condition deve ser ${CONDITIONS.join(', ')}.`,
    }),
  );
}
