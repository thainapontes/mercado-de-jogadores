import { Satisfies } from '../../common/validation/satisfies';
import { Attributes } from '../../domain/overall';
import type { Position } from '../../domain/types';
import {
  IntegerBetween,
  PlayerAgility,
  PlayerName,
  PlayerPosition,
} from './player-decorators';
import {
  AGE_MAX,
  AGE_MIN,
  ATTRIBUTE_MAX,
  ATTRIBUTE_MIN,
  ATTRIBUTES_SUM_MAX,
  attributesSum,
  hasValidAttributes,
  highestAttribute,
  isInteger,
  VETERAN_REGISTRATION_AGE,
} from './player-rules';

export class CreatePlayerDto implements Attributes {
  @PlayerName()
  name: string;

  @PlayerPosition()
  position: Position;

  @PlayerAgility()
  agility: number;

  @IntegerBetween('age', AGE_MIN, AGE_MAX)
  age: number;

  @IntegerBetween('pace', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  pace: number;

  @IntegerBetween('shooting', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  shooting: number;

  @IntegerBetween('passing', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  passing: number;

  @IntegerBetween('dribbling', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  dribbling: number;

  @IntegerBetween('defending', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  defending: number;

  @IntegerBetween('physical', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  @Satisfies<CreatePlayerDto>(
    'attributesSum',
    (_, dto) =>
      !hasValidAttributes(dto) || attributesSum(dto) <= ATTRIBUTES_SUM_MAX,
    `A soma dos seis atributos não pode passar de ${ATTRIBUTES_SUM_MAX}.`,
  )
  physical: number;

  @IntegerBetween('potential', ATTRIBUTE_MIN, ATTRIBUTE_MAX)
  @Satisfies<CreatePlayerDto>(
    'potentialAtLeastHighestAttribute',
    (potential, dto) =>
      !hasValidAttributes(dto) ||
      (potential as number) >= highestAttribute(dto),
    'O potencial não pode ser menor que o maior dos seis atributos.',
  )
  @Satisfies<CreatePlayerDto>(
    'veteranPotential',
    (potential, dto) =>
      !isInteger(potential) ||
      !hasValidAttributes(dto) ||
      !isInteger(dto.age) ||
      dto.age < VETERAN_REGISTRATION_AGE ||
      potential === highestAttribute(dto),
    `No cadastro com ${VETERAN_REGISTRATION_AGE} anos ou mais, o potencial deve ser igual ao maior dos seis atributos.`,
  )
  potential: number;
}
