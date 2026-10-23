import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { TransactionsTab } from './TransactionsTab';

const history = {
  data: [
    {
      id: 11,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'VENDA',
      value: 40,
      fee: 0.3,
      penalty: 4,
      profit: 3,
      cash_change: 35.7,
      created_at: '2026-11-05T16:40:00-03:00',
    },
    {
      id: 10,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cash_change: -38.85,
      created_at: '2026-11-02T10:15:00-03:00',
    },
  ],
  summary: {
    total_spent: 38.85,
    total_received: 35.7,
    total_fees: 2.15,
    total_penalties: 4,
    total_profit: 3,
  },
};

describe('TransactionsTab', () => {
  it('mostra o histórico com sinal e os totais da API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(history)),
    );
    renderWithProviders(<TransactionsTab clubId="1" clubAcronym="AGU" />);

    expect(await screen.findByText('+35,70')).toBeInTheDocument();
    expect(screen.getByText('-38,85')).toBeInTheDocument();
    expect(screen.getByText('05/11/2026 16:40')).toBeInTheDocument();
    const totals = screen.getByRole('region', { name: 'Totais do histórico' });
    expect(within(totals).getByText('38,85')).toBeInTheDocument();
    expect(within(totals).getByText('+3,00')).toBeInTheDocument();
  });

  it('pede os dois tipos na ordem COMPRA,VENDA', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(JSON.stringify(history)));
    renderWithProviders(<TransactionsTab clubId="1" clubAcronym="AGU" />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Venda' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Compra' }));

    expect(fetchSpy).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/v1/clubs/1/transactions?type=COMPRA%2CVENDA',
      expect.anything(),
    );
  });

  it('mostra o message da API quando o filtro é recusado', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
      String(input).includes('player_id')
        ? new Response(
            JSON.stringify({ message: 'Jogador 2 não encontrado.' }),
            { status: 404 },
          )
        : new Response(JSON.stringify(history)),
    );
    renderWithProviders(<TransactionsTab clubId="1" clubAcronym="AGU" />);

    await userEvent.selectOptions(
      await screen.findByLabelText('Jogador'),
      await screen.findByRole('option', { name: 'Meia Lua' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Jogador 2 não encontrado.',
    );
  });
});
