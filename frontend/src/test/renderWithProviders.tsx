import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { FeedbackProvider } from '../components/ui/FeedbackProvider';
import { createQueryClient } from '../queryClient';

export function renderWithProviders(ui: ReactNode, route = '/') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[route]}>
        <FeedbackProvider>{ui}</FeedbackProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export function mockApi(routes: Record<string, unknown>) {
  return async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const body = routes[url.pathname.replace('/api/v1', '')];
    return body === undefined
      ? new Response(JSON.stringify({ message: 'Não encontrado.' }), {
          status: 404,
        })
      : new Response(JSON.stringify(body), { status: 200 });
  };
}
