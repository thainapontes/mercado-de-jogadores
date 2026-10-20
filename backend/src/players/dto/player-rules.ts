import { hasControlCharacter } from '../../common/text/normalize-name';
import { Attributes } from '../../domain/overall';

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 100;
export const AGILITY_MIN = 1;
export const AGILITY_MAX = 100;
export const AGE_MIN = 16;
export const AGE_MAX = 45;
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 99;
export const ATTRIBUTES_SUM_MAX = 480;
export const SENIOR_AGE = 35;
export const SENIOR_AGILITY_MAX = 85;
export const VETERAN_REGISTRATION_AGE = 33;

const DIGIT = /[0-9]/;
const LETTER = /\p{L}/u;

export type NameProblem =
  'control-character' | 'length' | 'digit' | 'words' | null;

export function playerNameProblem(name: string): NameProblem {
  if (hasControlCharacter(name)) {
    return 'control-character';
  }
  const length = Array.from(name).length;
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) {
    return 'length';
  }
  if (DIGIT.test(name)) {
    return 'digit';
  }
  const words = name.split(' ').filter((part) => LETTER.test(part));
  return words.length >= 2 ? null : 'words';
}

export function isAgilityAllowedForAge(agility: number, age: unknown): boolean {
  return !(isInteger(age) && age >= SENIOR_AGE && agility > SENIOR_AGILITY_MAX);
}

export function attributesSum(attributes: Attributes): number {
  return (
    attributes.pace +
    attributes.shooting +
    attributes.passing +
    attributes.dribbling +
    attributes.defending +
    attributes.physical
  );
}

export function highestAttribute(attributes: Attributes): number {
  return Math.max(
    attributes.pace,
    attributes.shooting,
    attributes.passing,
    attributes.dribbling,
    attributes.defending,
    attributes.physical,
  );
}

export function hasValidAttributes(
  object: Partial<Attributes>,
): object is Attributes {
  return [
    object.pace,
    object.shooting,
    object.passing,
    object.dribbling,
    object.defending,
    object.physical,
  ].every(
    (value) =>
      isInteger(value) && value >= ATTRIBUTE_MIN && value <= ATTRIBUTE_MAX,
  );
}

export function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}
