import { applyDecorators } from '@nestjs/common';
import { IsString } from 'class-validator';
import { NormalizeName } from '../../common/validation/normalize-name.transform';
import { Required } from '../../common/validation/required';
import { Satisfies } from '../../common/validation/satisfies';
import {
  CLUB_NAME_MAX_LENGTH,
  CLUB_NAME_MAX_WORDS,
  CLUB_NAME_MIN_LENGTH,
  CLUB_NAME_MIN_WORDS,
  clubNameProblem,
  hasDistinctLetters,
  isAcronymFormat,
  isAcronymOfName,
} from './club-rules';

function ClubName(): PropertyDecorator {
  return applyDecorators(
    NormalizeName(),
    Required('name'),
    IsString({ message: 'O campo name deve ser um texto.' }),
    Satisfies(
      'noControlCharacter',
      (name: string) => clubNameProblem(name) !== 'control-character',
      'O nome não pode ter tabulação nem quebra de linha.',
    ),
    Satisfies(
      'clubNameLength',
      (name: string) => clubNameProblem(name) !== 'length',
      `O nome do clube deve ter de ${CLUB_NAME_MIN_LENGTH} a ${CLUB_NAME_MAX_LENGTH} caracteres.`,
    ),
    Satisfies(
      'clubNameCharacters',
      (name: string) => clubNameProblem(name) !== 'characters',
      'O nome do clube só aceita letras, espaços, hífen e ponto.',
    ),
    Satisfies(
      'clubNameWords',
      (name: string) => clubNameProblem(name) !== 'words',
      `O nome do clube deve ter de ${CLUB_NAME_MIN_WORDS} a ${CLUB_NAME_MAX_WORDS} palavras.`,
    ),
  );
}

function ClubAcronym(): PropertyDecorator {
  return applyDecorators(
    Required('acronym'),
    IsString({ message: 'O campo acronym deve ser um texto.' }),
    Satisfies(
      'acronymFormat',
      (acronym: string) => isAcronymFormat(acronym),
      'A sigla deve ter exatamente 3 letras maiúsculas de A a Z, sem acento.',
    ),
    Satisfies(
      'acronymDistinctLetters',
      (acronym: string) => hasDistinctLetters(acronym),
      'As três letras da sigla não podem ser todas iguais.',
    ),
    Satisfies<CreateClubDto>(
      'acronymOfName',
      (acronym, dto) =>
        typeof dto.name !== 'string' ||
        clubNameProblem(dto.name) !== null ||
        isAcronymOfName(acronym as string, dto.name),
      'A sigla deve começar pela primeira letra do nome e ter as outras duas letras no nome, nessa ordem.',
    ),
  );
}

export class CreateClubDto {
  @ClubName()
  name: string;

  @ClubAcronym()
  acronym: string;
}
