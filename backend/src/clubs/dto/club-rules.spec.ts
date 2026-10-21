import {
  clubNameProblem,
  hasDistinctLetters,
  isAcronymFormat,
  isAcronymOfName,
} from './club-rules';

describe('clubNameProblem', () => {
  it.each([
    'Águias FC',
    'Aguias FC',
    'Ana B',
    'São-Paulo F.C.',
    'Clube Atlético Mineiro de Ouro',
    `Clube ${'a'.repeat(54)}`,
  ])('aceita %j', (name) => {
    expect(clubNameProblem(name)).toBeNull();
  });

  it.each([
    ['Ab', 'length'],
    [`Clube ${'a'.repeat(55)}`, 'length'],
    ['Águias', 'words'],
    ['Um Dois Três Quatro Cinco Seis', 'words'],
    ['Águias - . FC', null],
    ['- .', 'words'],
    ['Clube 1 FC', 'characters'],
    ['Clube_FC Sul', 'characters'],
    ['Clube & Cia', 'characters'],
    ["Clube D'Ouro", 'characters'],
    ['Águias\tFC', 'control-character'],
  ])('%j → %s', (name, problem) => {
    expect(clubNameProblem(name)).toBe(problem);
  });
});

describe('sigla', () => {
  it.each(['AGU', 'XYZ'])('aceita o formato %s', (acronym) => {
    expect(isAcronymFormat(acronym)).toBe(true);
  });

  it.each(['agu', 'AG', 'AGUA', 'ÁGU', 'A1U', ' AG'])(
    'recusa o formato %j',
    (acronym) => {
      expect(isAcronymFormat(acronym)).toBe(false);
    },
  );

  it('recusa as três letras iguais', () => {
    expect(hasDistinctLetters('AAA')).toBe(false);
    expect(hasDistinctLetters('AAF')).toBe(true);
  });

  it.each([
    ['Águias FC', 'AGU', true],
    ['Águias FC', 'AFC', true],
    ['Águias FC', 'AAF', true],
    ['Águias FC', 'GUA', false],
    ['Águias FC', 'XYZ', false],
    ['Águias FC', 'AUG', false],
    ['Aguias FC', 'AGU', true],
    ['Épsilon EC', 'EEC', true],
    ['Épsilon EC', 'ECE', false],
    ['Gonçalo Sport', 'GCS', true],
    ['.Delta FC', 'DFC', true],
  ])('%s com a sigla %s → %s', (name, acronym, expected) => {
    expect(isAcronymOfName(acronym, name)).toBe(expected);
  });
});
