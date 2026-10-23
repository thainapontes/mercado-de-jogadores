import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatMoney,
  formatSignedMoney,
  toApiDateTime,
} from './format';

describe('formatMoney', () => {
  it.each([
    [37, '37,00'],
    [1.85, '1,85'],
    [1234.56, '1.234,56'],
    [0, '0,00'],
  ])('%s → %s', (value, expected) => {
    expect(formatMoney(value)).toBe(expected);
  });
});

describe('formatSignedMoney', () => {
  it.each([
    [35.7, '+35,70'],
    [-38.85, '-38,85'],
    [0, '0,00'],
  ])('%s → %s', (value, expected) => {
    expect(formatSignedMoney(value)).toBe(expected);
  });
});

describe('formatDateTime', () => {
  it('mostra a data da API no horário de Brasília', () => {
    expect(formatDateTime('2026-11-05T16:40:00-03:00')).toBe(
      '05/11/2026 16:40',
    );
  });

  it('converte um instante em UTC para o horário de Brasília', () => {
    expect(formatDateTime('2026-11-06T01:15:00Z')).toBe('05/11/2026 22:15');
  });
});

describe('toApiDateTime', () => {
  it('acrescenta o fuso de Brasília ao valor do campo datetime-local', () => {
    expect(toApiDateTime('2027-03-02T10:15')).toBe('2027-03-02T10:15-03:00');
  });

  it('descarta os segundos, que a API não aceita', () => {
    expect(toApiDateTime('2027-03-02T10:15:30')).toBe('2027-03-02T10:15-03:00');
  });
});
