import { formatApiDateTime, parseApiDateTime } from './api-date-time';

describe('parseApiDateTime (RN01)', () => {
  it.each([
    ['2027-03-02T10:15-03:00', '2027-03-02T13:15:00.000Z'],
    ['2026-11-02T22:30-03:00', '2026-11-03T01:30:00.000Z'],
    ['2028-02-29T00:00-03:00', '2028-02-29T03:00:00.000Z'],
    ['2027-12-31T23:59-03:00', '2028-01-01T02:59:00.000Z'],
  ])('aceita %s', (input, utc) => {
    expect(parseApiDateTime(input)?.toISOString()).toBe(utc);
  });

  it.each([
    '2027-02-30T10:15-03:00',
    '2027-02-29T10:15-03:00',
    '2027-04-31T10:15-03:00',
    '2027-13-01T10:15-03:00',
    '2027-00-10T10:15-03:00',
    '2027-03-00T10:15-03:00',
    '2027-03-02T24:00-03:00',
    '2027-03-02T10:60-03:00',
    '2027-03-02T10:15',
    '2027-03-02T10:15Z',
    '2027-03-02T10:15-02:00',
    '2027-03-02T10:15:00-03:00',
    '2027-03-02 10:15-03:00',
    '2027-3-2T10:15-03:00',
    '02/03/2027 10:15',
    ' 2027-03-02T10:15-03:00',
    '',
  ])('recusa %j', (input) => {
    expect(parseApiDateTime(input)).toBeNull();
  });
});

describe('formatApiDateTime (RN01)', () => {
  it('escreve no horário de Brasília com segundos e -03:00', () => {
    expect(formatApiDateTime(new Date('2026-11-02T13:15:42.381Z'))).toBe(
      '2026-11-02T10:15:42-03:00',
    );
  });

  it('volta para o dia anterior quando passa da meia-noite em UTC', () => {
    expect(formatApiDateTime(new Date('2026-11-03T01:30:00.000Z'))).toBe(
      '2026-11-02T22:30:00-03:00',
    );
  });

  it('desfaz o parse', () => {
    const date = parseApiDateTime('2027-03-02T10:15-03:00');
    expect(date && formatApiDateTime(date)).toBe('2027-03-02T10:15:00-03:00');
  });
});
