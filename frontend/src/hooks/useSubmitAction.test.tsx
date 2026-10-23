import { act, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackProvider } from '../components/ui/FeedbackProvider';
import { useSubmitAction } from './useSubmitAction';

const wrapper = ({ children }: { children: ReactNode }) => (
  <FeedbackProvider>{children}</FeedbackProvider>
);

describe('useSubmitAction', () => {
  it('envia um só pedido num clique duplo e mostra o sucesso', async () => {
    let finish: (value: string) => void = () => undefined;
    const mutateAsync = vi.fn(
      () => new Promise<string>((resolve) => (finish = resolve)),
    );
    const { result } = renderHook(
      () => useSubmitAction(mutateAsync, 'Partida jogada.'),
      { wrapper },
    );

    await act(async () => {
      const first = result.current(undefined);
      const second = result.current(undefined);
      finish('ok');
      await Promise.all([first, second]);
    });

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Partida jogada.');
  });

  it('mostra o message da API numa recusa', async () => {
    const mutateAsync = vi.fn(() =>
      Promise.reject(new Error('Escalação incompleta.')),
    );
    const { result } = renderHook(
      () => useSubmitAction(mutateAsync, 'Partida jogada.'),
      { wrapper },
    );

    await act(() => result.current(undefined));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escalação incompleta.',
    );
  });
});
