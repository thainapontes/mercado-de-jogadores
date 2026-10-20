import { BadRequestException } from '@nestjs/common';
import { StrictValidationPipe } from '../validation/strict-validation.pipe';
import {
  QueryDecimal,
  QueryEnum,
  QueryId,
  QueryInteger,
  QueryList,
  QuerySearch,
} from './query-params';

class SampleQuery {
  @QueryInteger('page', 1, 50)
  page?: string;

  @QueryId('club_id')
  club_id?: string;

  @QueryDecimal('min_value', 550)
  min_value?: string;

  @QueryEnum('free', ['true', 'false'])
  free?: string;

  @QueryList('sort', ['name', 'value_asc', 'value_desc'], {
    maxItems: 2,
    keyOf: (value) => value.replace(/_(asc|desc)$/, ''),
  })
  sort?: string;

  @QuerySearch('search', 2, 100)
  search?: string;
}

const pipe = new StrictValidationPipe();

function parse(query: Record<string, unknown>): Promise<SampleQuery> {
  return pipe.transform(query, {
    type: 'query',
    metatype: SampleQuery,
  }) as Promise<SampleQuery>;
}

describe('query params estritos', () => {
  it('sem parâmetros, nada é exigido', async () => {
    await expect(parse({})).resolves.toEqual({});
  });

  it('ignora parâmetros desconhecidos', async () => {
    await expect(parse({ page: '2', outro: 'x' })).resolves.toEqual({
      page: '2',
    });
  });

  it.each([
    { page: '1' },
    { page: '50' },
    { club_id: '2147483647' },
    { min_value: '0' },
    { min_value: '0.5' },
    { min_value: '10.55' },
    { min_value: '550' },
    { free: 'false' },
    { sort: 'name' },
    { sort: 'value_desc,name' },
    { search: 'Lu' },
  ])('aceita %j', async (query) => {
    await expect(parse(query)).resolves.toEqual(query);
  });

  it.each([
    { page: '' },
    { page: '0' },
    { page: '01' },
    { page: '1.0' },
    { page: '-1' },
    { page: '+1' },
    { page: '1e1' },
    { page: ' 1' },
    { page: '51' },
    { page: ['1', '2'] },
    { club_id: '0' },
    { club_id: '2147483648' },
    { min_value: '' },
    { min_value: '-1' },
    { min_value: '01' },
    { min_value: '10.555' },
    { min_value: '10,5' },
    { min_value: '1e2' },
    { min_value: '.5' },
    { min_value: '10.' },
    { min_value: '550.01' },
    { free: 'TRUE' },
    { free: '' },
    { sort: '' },
    { sort: 'NAME' },
    { sort: 'value_asc,value_desc' },
    { sort: 'name,name' },
    { sort: 'name,value_asc,value_desc' },
    { sort: 'name,' },
    { sort: 'name, value_asc' },
    { search: '' },
    { search: '   ' },
    { search: ' a ' },
    { search: 'a\tb' },
    { search: 'a'.repeat(101) },
  ])('recusa %j com 400', async (query) => {
    await expect(parse(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('normaliza os espaços do search (V4)', async () => {
    await expect(parse({ search: '  meia   lua ' })).resolves.toEqual({
      search: 'meia lua',
    });
  });
});
