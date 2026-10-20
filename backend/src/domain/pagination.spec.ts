import { paginate } from './pagination';

function numbers(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

describe('paginate (RN07, tabela de paginação)', () => {
  it.each([
    [23, 10, 1, numbers(10), 3],
    [23, 10, 3, [21, 22, 23], 3],
    [23, 10, 4, [], 3],
    [23, 50, 1, numbers(23), 1],
    [0, 10, 1, [], 0],
  ])(
    '%i itens, limit %i, page %i',
    (total, limit, page, expectedItems, totalPages) => {
      expect(paginate(numbers(total), page, limit)).toEqual({
        items: expectedItems,
        meta: { page, limit, totalItems: total, totalPages },
      });
    },
  );
});
