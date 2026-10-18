import { hasControlCharacter, normalizeName } from './normalize-name';

describe('normalizeName (V4)', () => {
  it.each([
    ['  Meia   Zeta ', 'Meia Zeta'],
    ['Ana Lima', 'Ana Lima'],
    ['   ', ''],
    ['', ''],
    ['Ana  Lima', 'Ana  Lima'],
  ])('"%s" vira "%s"', (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });
});

describe('hasControlCharacter (V4)', () => {
  it.each(['Ana\tLima', 'Ana\nLima', 'Ana\rLima', 'Ana\u0000Lima'])(
    'recusa %j',
    (input) => {
      expect(hasControlCharacter(input)).toBe(true);
    },
  );

  it.each(['Ana Lima', 'Épsilon Çá', 'Ana-Maria'])('aceita %j', (input) => {
    expect(hasControlCharacter(input)).toBe(false);
  });
});
