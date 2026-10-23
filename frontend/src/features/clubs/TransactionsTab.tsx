import { useState } from 'react';
import {
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionFilters,
  type TransactionType,
} from '../../api/transactions';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { DetailList } from '../../components/ui/DetailList';
import { FormField } from '../../components/ui/FormField';
import { Select } from '../../components/ui/Select';
import { useFeedback } from '../../hooks/useFeedback';
import {
  useExportTransactions,
  useTransactions,
} from '../../hooks/useTransactions';
import { downloadFile } from '../../utils/download';
import {
  formatDateTime,
  formatMoney,
  formatSignedMoney,
} from '../../utils/format';

const TYPE_LABELS: Record<TransactionType, string> = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
};

const columns: Column<Transaction>[] = [
  {
    header: 'Data e hora',
    render: (transaction) => formatDateTime(transaction.created_at),
  },
  { header: 'Tipo', render: (transaction) => TYPE_LABELS[transaction.type] },
  { header: 'Jogador', render: (transaction) => transaction.player_name },
  {
    header: 'Valor',
    render: (transaction) => formatMoney(transaction.value),
    align: 'right',
  },
  {
    header: 'Taxa ou comissão',
    render: (transaction) => formatMoney(transaction.fee),
    align: 'right',
  },
  {
    header: 'Multa',
    render: (transaction) => formatMoney(transaction.penalty),
    align: 'right',
  },
  {
    header: 'Lucro',
    render: (transaction) =>
      transaction.profit === null ? '—' : formatSignedMoney(transaction.profit),
    align: 'right',
  },
  {
    header: 'Variação do caixa',
    render: (transaction) => formatSignedMoney(transaction.cash_change),
    align: 'right',
  },
];

interface TransactionsTabProps {
  clubId: string;
  clubAcronym: string | undefined;
}

export function TransactionsTab({ clubId, clubAcronym }: TransactionsTabProps) {
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [playerId, setPlayerId] = useState('');
  const filters: TransactionFilters = {
    type: types.length > 0 ? types.join(',') : undefined,
    player_id: playerId || undefined,
  };
  const history = useTransactions(clubId, filters);
  const allTransactions = useTransactions(clubId, {});
  const csvExport = useExportTransactions(clubId);
  const { notifyError, notifySuccess } = useFeedback();

  const playerOptions = [
    ...new Map(
      allTransactions.data?.data.map((transaction) => [
        transaction.player_id,
        transaction.player_name,
      ]),
    ),
  ];

  const toggleType = (type: TransactionType) =>
    setTypes((current) =>
      TRANSACTION_TYPES.filter((option) =>
        option === type ? !current.includes(option) : current.includes(option),
      ),
    );

  const exportCsv = async () => {
    try {
      const file = await csvExport.mutateAsync(filters);
      downloadFile(file, `historico-${clubAcronym ?? clubId}.csv`);
      notifySuccess('CSV exportado.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Erro inesperado.');
    }
  };

  const summary = history.data?.summary;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <fieldset className="flex gap-4">
          <legend className="mb-1 text-sm font-medium text-slate-700">
            Tipo
          </legend>
          {TRANSACTION_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={types.includes(type)}
                onChange={() => toggleType(type)}
                className="h-4 w-4 accent-emerald-700"
              />
              {TYPE_LABELS[type]}
            </label>
          ))}
        </fieldset>
        <div className="w-full sm:w-64">
          <FormField label="Jogador" htmlFor="transactions-player">
            <Select
              id="transactions-player"
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
            >
              <option value="">Todos</option>
              {playerOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <Button
          variant="secondary"
          disabled={csvExport.isPending}
          onClick={exportCsv}
          className="sm:ml-auto"
        >
          {csvExport.isPending ? 'Exportando…' : 'Exportar CSV'}
        </Button>
      </div>
      <DataTable
        caption="Histórico de transações"
        columns={columns}
        rows={history.data?.data}
        getRowKey={(transaction) => transaction.id}
        isLoading={history.isPending}
        error={history.error}
        emptyMessage="Nenhuma transação encontrada."
      />
      {summary && (
        <section
          aria-label="Totais do histórico"
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="mb-2 font-semibold">Totais (com os filtros)</h3>
          <DetailList
            items={[
              {
                label: 'Total pago em compras',
                value: formatMoney(summary.total_spent),
              },
              {
                label: 'Total recebido em vendas',
                value: formatMoney(summary.total_received),
              },
              {
                label: 'Total de taxas e comissões',
                value: formatMoney(summary.total_fees),
              },
              {
                label: 'Total de multas',
                value: formatMoney(summary.total_penalties),
              },
              {
                label: 'Lucro total',
                value: formatSignedMoney(summary.total_profit),
              },
            ]}
          />
        </section>
      )}
    </div>
  );
}
