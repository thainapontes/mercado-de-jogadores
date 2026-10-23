import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string | number;
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  caption?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading,
  error,
  emptyMessage,
  caption,
  onRowClick,
}: DataTableProps<T>) {
  const status = tableStatus(isLoading, error, rows, emptyMessage);
  const alignClass = (column: Column<T>) =>
    column.align === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-3 py-2 font-semibold whitespace-nowrap text-slate-700 ${alignClass(column)}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {status ? (
            <tr>
              <td
                colSpan={columns.length}
                role={status.role}
                className={`px-3 py-6 text-center ${status.className}`}
              >
                {status.text}
              </td>
            </tr>
          ) : (
            rows?.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={
                  onRowClick ? 'cursor-pointer hover:bg-emerald-50' : undefined
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-3 py-2 whitespace-nowrap ${alignClass(column)}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function tableStatus<T>(
  isLoading: boolean,
  error: Error | null,
  rows: T[] | undefined,
  emptyMessage: string,
) {
  if (isLoading) {
    return { text: 'Carregando…', role: 'status', className: 'text-slate-500' };
  }
  if (error) {
    return { text: error.message, role: 'alert', className: 'text-red-700' };
  }
  if (!rows || rows.length === 0) {
    return { text: emptyMessage, role: undefined, className: 'text-slate-500' };
  }
  return null;
}
