import { NotFoundException } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe (V8)', () => {
  const pipe = new ParseIdPipe();

  it.each([
    ['1', 1],
    ['25', 25],
    ['2147483647', 2147483647],
  ])('aceita %s', (input, expected) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it.each([
    'abc',
    '0',
    '-1',
    '1.5',
    '01',
    '+1',
    '1e3',
    ' 1',
    '',
    '2147483648',
    '99999999999999999999',
  ])('recusa %j com 404', (input) => {
    expect(() => pipe.transform(input)).toThrow(NotFoundException);
  });
});
