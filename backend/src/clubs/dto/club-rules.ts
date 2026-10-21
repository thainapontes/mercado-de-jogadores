import { hasControlCharacter } from '../../common/text/normalize-name';
import { toComparableText } from '../../domain/ordering';

export const CLUB_NAME_MIN_LENGTH = 3;
export const CLUB_NAME_MAX_LENGTH = 60;
export const CLUB_NAME_MIN_WORDS = 2;
export const CLUB_NAME_MAX_WORDS = 5;

const ALLOWED_CHARACTERS = /^[\p{L} .-]*$/u;
const LETTER = /\p{L}/u;
const ACRONYM = /^[A-Z]{3}$/;

export type ClubNameProblem =
  'control-character' | 'length' | 'characters' | 'words' | null;

export function clubNameProblem(name: string): ClubNameProblem {
  if (hasControlCharacter(name)) {
    return 'control-character';
  }
  const length = Array.from(name).length;
  if (length < CLUB_NAME_MIN_LENGTH || length > CLUB_NAME_MAX_LENGTH) {
    return 'length';
  }
  if (!ALLOWED_CHARACTERS.test(name)) {
    return 'characters';
  }
  const words = name.split(' ').filter((part) => LETTER.test(part)).length;
  return words >= CLUB_NAME_MIN_WORDS && words <= CLUB_NAME_MAX_WORDS
    ? null
    : 'words';
}

export function isAcronymFormat(acronym: string): boolean {
  return ACRONYM.test(acronym);
}

export function hasDistinctLetters(acronym: string): boolean {
  return new Set(acronym).size > 1;
}

export function isAcronymOfName(acronym: string, name: string): boolean {
  const letters = Array.from(toComparableText(name)).filter((character) =>
    LETTER.test(character),
  );
  const [first, ...rest] = Array.from(acronym.toLowerCase());
  if (letters[0] !== first) {
    return false;
  }
  let found = 0;
  for (const letter of letters.slice(1)) {
    if (found < rest.length && letter === rest[found]) {
      found++;
    }
  }
  return found === rest.length;
}
