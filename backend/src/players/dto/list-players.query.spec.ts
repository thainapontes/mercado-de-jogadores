import { BadRequestException } from '@nestjs/common';
import { StrictValidationPipe } from '../../common/validation/strict-validation.pipe';
import { Decimal } from '../../domain/money';
import {
  ListPlayersQueryDto,
  toPlayerListCriteria,
} from './list-players.query';

const pipe = new StrictValidationPipe();

function parse(query: Record<string, unknown>): Promise<ListPlayersQueryDto> {
  return pipe.transform(query, {
    type: 'query',
    metatype: ListPlayersQueryDto,
  }) as Promise<ListPlayersQueryDto>;
}

describe('ListPlayersQueryDto', () => {
  it.each([
    { position: 'mei' },
    { position: '' },
    { condition: 'apto' },
    { free: 'TRUE' },
    { free: 'true', club_id: '1' },
    { min_age: '15' },
    { max_age: '46' },
    { min_age: '30', max_age: '29' },
    { min_value: '10.01', max_value: '10' },
    { max_value: '551' },
    { sort: 'POSITION' },
    { sort: 'value_asc,value_desc' },
    { sort: 'age_asc,age_desc' },
    { sort: 'name,value_asc,age_asc' },
    { page: '0' },
    { page: '01' },
    { page: '1.0' },
    { limit: '51' },
    { limit: '0' },
    { search: 'a' },
    { search: '   ' },
  ])('recusa %j com 400', async (query) => {
    await expect(parse(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    { free: 'false', club_id: '1' },
    { min_age: '30', max_age: '30' },
    { min_value: '10', max_value: '10.00' },
    { sort: 'position,value_desc' },
    { limit: '50' },
    { page: '999' },
  ])('aceita %j', async (query) => {
    await expect(parse(query)).resolves.toEqual(query);
  });
});

describe('toPlayerListCriteria', () => {
  it('sem parâmetros: ordem por nome, página 1 e 10 por página', () => {
    expect(toPlayerListCriteria({})).toEqual({
      search: undefined,
      position: undefined,
      condition: undefined,
      free: undefined,
      clubId: undefined,
      minAge: undefined,
      maxAge: undefined,
      minValue: undefined,
      maxValue: undefined,
      sorts: ['name'],
      page: 1,
      limit: 10,
    });
  });

  it('converte cada parâmetro para o tipo certo', () => {
    expect(
      toPlayerListCriteria({
        search: 'lua',
        position: 'MEI',
        condition: 'APTO',
        free: 'false',
        club_id: '3',
        min_age: '20',
        max_age: '30',
        min_value: '10.5',
        max_value: '40',
        sort: 'value_desc,age_asc',
        page: '2',
        limit: '5',
      }),
    ).toEqual({
      search: 'lua',
      position: 'MEI',
      condition: 'APTO',
      free: false,
      clubId: 3,
      minAge: 20,
      maxAge: 30,
      minValue: new Decimal('10.5'),
      maxValue: new Decimal('40'),
      sorts: ['value_desc', 'age_asc'],
      page: 2,
      limit: 5,
    });
  });
});
