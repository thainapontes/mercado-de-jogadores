import { useState } from 'react';
import type { SquadPlayer } from '../../api/clubs';
import type { Sale } from '../../api/market';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { useSellPlayer } from '../../hooks/useMarket';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { formatDateTime, formatMoney } from '../../utils/format';
import { CONDITION_LABELS } from '../../utils/labels';
import { SellResultDialog } from '../market/SellResultDialog';

interface SquadTabProps {
  players: SquadPlayer[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function SquadTab({ players, isLoading, error }: SquadTabProps) {
  const [selling, setSelling] = useState<SquadPlayer>();
  const [sale, setSale] = useState<Sale>();
  const mutation = useSellPlayer();
  const sell = useSubmitAction(mutation.mutateAsync, 'Venda realizada.');

  const confirmSale = async (player: SquadPlayer) => {
    const result = await sell(player.id);
    setSelling(undefined);
    if (result) {
      setSale(result.data);
    }
  };

  const columns: Column<SquadPlayer>[] = [
    { header: 'Nome', render: (player) => player.name },
    { header: 'Posição', render: (player) => player.position },
    { header: 'Overall', render: (player) => player.overall, align: 'right' },
    {
      header: 'Condição',
      render: (player) => CONDITION_LABELS[player.condition],
    },
    {
      header: 'Valor de mercado',
      render: (player) => formatMoney(player.market_value),
      align: 'right',
    },
    {
      header: 'Valor de compra',
      render: (player) => formatMoney(player.contract.purchase_value),
      align: 'right',
    },
    {
      header: 'Fim da fidelidade',
      render: (player) => formatDateTime(player.contract.loyalty_until),
    },
    {
      header: 'Dias restantes',
      render: (player) => player.contract.remaining_days,
      align: 'right',
    },
    {
      header: '% de multa',
      render: (player) => `${player.contract.penalty_rate}%`,
      align: 'right',
    },
    {
      header: 'Ações',
      render: (player) => (
        <Button size="sm" variant="danger" onClick={() => setSelling(player)}>
          Vender
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption="Elenco"
        columns={columns}
        rows={players}
        getRowKey={(player) => player.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="Elenco vazio. Compre jogadores livres na tela de jogadores."
      />
      {selling && (
        <ConfirmDialog
          title="Vender jogador"
          message={
            <>
              Vender <strong>{selling.name}</strong> pelo valor de mercado do
              momento? Multa se fosse vendido agora:{' '}
              {selling.contract.penalty_rate}% (
              {selling.contract.remaining_days} dias restantes de fidelidade).
            </>
          }
          confirmLabel="Vender"
          isPending={mutation.isPending}
          onConfirm={() => confirmSale(selling)}
          onCancel={() => setSelling(undefined)}
        />
      )}
      {sale && (
        <SellResultDialog sale={sale} onClose={() => setSale(undefined)} />
      )}
    </>
  );
}
