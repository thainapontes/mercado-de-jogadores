import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { mockApi, renderWithProviders } from '../test/renderWithProviders';
import { PlayersPage } from './PlayersPage';

const meiaLua = {
  id: 2,
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  condition: 'MAL_CONDICIONADO',
  base_value: 40,
  market_value: 37,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
  overall: 75,
  club_id: null,
};

const clubs = [
  {
    id: 1,
    name: 'Águias FC',
    acronym: 'AGU',
    cash: 300,
    squad_value: 0,
    net_worth: 300,
  },
];

describe('PlayersPage', () => {
  it('mostra os valores da API, "Livre" e o total encontrado', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockApi({
        '/players': {
          data: [meiaLua, { ...meiaLua, id: 3, name: 'Zé Gol', club_id: 1 }],
          meta: { page: 1, limit: 10, total_items: 2, total_pages: 1 },
        },
        '/clubs': clubs,
      }),
    );
    renderWithProviders(<PlayersPage />);

    const row = (await screen.findByText('Meia Lua')).closest('tr')!;
    expect(within(row).getByText('40,00')).toBeInTheDocument();
    expect(within(row).getByText('37,00')).toBeInTheDocument();
    expect(within(row).getByText('Livre')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Excluir' })).toBeVisible();

    const otherRow = screen.getByText('Zé Gol').closest('tr')!;
    expect(await within(otherRow).findByText('Águias FC (AGU)')).toBeVisible();
    expect(
      within(otherRow).queryByRole('button', { name: 'Excluir' }),
    ).toBeNull();
    expect(screen.getByText('2 jogadores encontrados')).toBeInTheDocument();
  });

  it('não deixa combinar "Só livres" com o filtro por clube', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockApi({
        '/players': {
          data: [],
          meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
        },
        '/clubs': clubs,
      }),
    );
    renderWithProviders(<PlayersPage />);

    await userEvent.click(screen.getByRole('checkbox', { name: /Só livres/ }));

    expect(screen.getByLabelText('Clube')).toBeDisabled();
    expect(
      await screen.findByText('Nenhum jogador encontrado.'),
    ).toBeInTheDocument();
  });

  it('valida o cadastro antes de enviar, com a mensagem junto ao campo', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockApi({
        '/players': {
          data: [],
          meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
        },
        '/clubs': clubs,
      }),
    );
    renderWithProviders(<PlayersPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Cadastrar jogador' }),
    );
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Al');
    await userEvent.type(within(dialog).getByLabelText('Idade (16–45)'), '15');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Salvar' }),
    );

    expect(
      await within(dialog).findByText('Nome: de 3 a 100 caracteres.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Idade: de 16 a 45.')).toBeInTheDocument();
    expect(
      fetchSpy.mock.calls.some(([, init]) => init?.method === 'POST'),
    ).toBe(false);
  });
});
