import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function renderDialog(isPending: boolean) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      title="Excluir jogador"
      message="Excluir Meia Lua?"
      confirmLabel="Excluir"
      isPending={isPending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('confirma ou cancela pelos botões', async () => {
    const { onConfirm, onCancel } = renderDialog(false);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('desabilita a confirmação durante o envio', () => {
    renderDialog(true);
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });
});
