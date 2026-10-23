import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SquadPlayer } from '../../api/clubs';
import { renderWithProviders } from '../../test/renderWithProviders';
import { LineupTab } from './LineupTab';

function squadPlayer(
  id: number,
  name: string,
  position: SquadPlayer['position'],
  condition: SquadPlayer['condition'] = 'APTO',
) {
  return { id, name, position, condition } as SquadPlayer;
}

const squad = [
  squadPlayer(30, 'Rui Prado', 'GOL'),
  squadPlayer(32, 'Téo Brandão', 'ZAG'),
  squadPlayer(31, 'Davi Lins', 'LAT', 'MAL_CONDICIONADO'),
  squadPlayer(35, 'Caio Doente', 'LAT', 'DOENTE'),
  squadPlayer(33, 'Lauro Neves', 'MEI'),
  squadPlayer(34, 'Otto Rangel', 'ATA'),
];

const emptyLineup = {
  club_id: 1,
  formation: null,
  complete: false,
  players: [],
};

describe('LineupTab', () => {
  it('avisa que o clube sem escalação completa não pode jogar', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(emptyLineup)),
    );
    renderWithProviders(<LineupTab clubId="1" squad={squad} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'o clube não pode jogar',
    );
  });

  it('gera as vagas da formação, sem DOENTE, e envia os 5 ids', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async () => new Response(JSON.stringify(emptyLineup)),
      );
    renderWithProviders(<LineupTab clubId="1" squad={squad} />);
    const form = screen.getByRole('form', { name: 'Nova escalação' });

    await userEvent.selectOptions(
      within(form).getByLabelText('Formação'),
      '2-1-1',
    );
    const defense = within(form).getByLabelText('Defesa (ZAG ou LAT) 1');
    expect(
      within(defense)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual([
      'Escolha…',
      'Téo Brandão (ZAG · Apto)',
      'Davi Lins (LAT · Mal condicionado)',
    ]);

    await userEvent.selectOptions(
      within(form).getByLabelText('Goleiro (GOL)'),
      '30',
    );
    await userEvent.selectOptions(defense, '32');
    await userEvent.selectOptions(
      within(form).getByLabelText('Defesa (ZAG ou LAT) 2'),
      '31',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Meio (MEI) 1'),
      '33',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Ataque (ATA) 1'),
      '34',
    );
    await userEvent.click(
      within(form).getByRole('button', { name: 'Salvar escalação' }),
    );

    const put = fetchSpy.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(put?.[1]?.body).toBe(
      '{"formation":"2-1-1","player_ids":[30,32,31,33,34]}',
    );
  });

  it('mostra junto às vagas o que falta e o jogador repetido', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(JSON.stringify(emptyLineup)),
    );
    renderWithProviders(<LineupTab clubId="1" squad={squad} />);
    const form = screen.getByRole('form', { name: 'Nova escalação' });

    await userEvent.selectOptions(
      within(form).getByLabelText('Formação'),
      '3-1',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Defesa (ZAG ou LAT) 1'),
      '32',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Defesa (ZAG ou LAT) 2'),
      '32',
    );
    await userEvent.click(
      within(form).getByRole('button', { name: 'Salvar escalação' }),
    );

    expect(
      await within(form).findAllByText('Escolha o titular desta vaga.'),
    ).toHaveLength(3);

    await userEvent.selectOptions(
      within(form).getByLabelText('Goleiro (GOL)'),
      '30',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Defesa (ZAG ou LAT) 3'),
      '31',
    );
    await userEvent.selectOptions(
      within(form).getByLabelText('Ataque (ATA) 1'),
      '34',
    );
    await userEvent.click(
      within(form).getByRole('button', { name: 'Salvar escalação' }),
    );

    expect(
      await within(form).findByText(
        'O mesmo jogador não pode ocupar duas vagas.',
      ),
    ).toBeInTheDocument();
  });
});
