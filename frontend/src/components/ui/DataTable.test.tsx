import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: number;
  name: string;
}

const columns: Column<Row>[] = [{ header: 'Nome', render: (row) => row.name }];

function renderTable(props: {
  rows?: Row[];
  isLoading?: boolean;
  error?: Error | null;
}) {
  render(
    <DataTable
      columns={columns}
      rows={props.rows}
      getRowKey={(row) => row.id}
      isLoading={props.isLoading ?? false}
      error={props.error ?? null}
      emptyMessage="Nenhum jogador encontrado."
    />,
  );
}

describe('DataTable', () => {
  it('mostra o carregamento', () => {
    renderTable({ isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });

  it('mostra a mensagem de lista vazia', () => {
    renderTable({ rows: [] });
    expect(screen.getByText('Nenhum jogador encontrado.')).toBeInTheDocument();
  });

  it('mostra o message do erro da API', () => {
    renderTable({ error: new Error('Clube não encontrado.') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Clube não encontrado.',
    );
  });

  it('mostra uma linha por item, na ordem recebida', () => {
    renderTable({
      rows: [
        { id: 2, name: 'Meia Lua' },
        { id: 1, name: 'Ana Lima' },
      ],
    });
    const cells = screen.getAllByRole('cell').map((cell) => cell.textContent);
    expect(cells).toEqual(['Meia Lua', 'Ana Lima']);
  });
});
