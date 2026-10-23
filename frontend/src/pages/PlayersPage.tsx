import { useState } from 'react';
import type { Player, PlayerFilters } from '../api/players';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { BuyPlayerDialog } from '../features/market/BuyPlayerDialog';
import { ConditionDialog } from '../features/players/ConditionDialog';
import { CreatePlayerDialog } from '../features/players/CreatePlayerDialog';
import { EditPlayerDialog } from '../features/players/EditPlayerDialog';
import { PlayerFiltersForm } from '../features/players/PlayerFiltersForm';
import { playerColumns } from '../features/players/playerColumns';
import { useClubs } from '../hooks/useClubs';
import { useDeletePlayer, usePlayers } from '../hooks/usePlayers';
import { useSubmitAction } from '../hooks/useSubmitAction';

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit' | 'condition' | 'delete' | 'buy'; player: Player };

export function PlayersPage() {
  const [filters, setFilters] = useState<PlayerFilters>({});
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog>();
  const players = usePlayers(filters, page);
  const clubs = useClubs();
  const deletion = useDeletePlayer();
  const remove = useSubmitAction(deletion.mutateAsync, 'Jogador excluído.');

  const clubNames = new Map(
    clubs.data?.map((club) => [club.id, `${club.name} (${club.acronym})`]),
  );
  const close = () => setDialog(undefined);

  const applyFilters = (next: PlayerFilters) => {
    setFilters(next);
    setPage(1);
  };

  const confirmDelete = async (player: Player) => {
    if (await remove(player.id)) {
      close();
    }
  };

  const columns: Column<Player>[] = [
    ...playerColumns,
    {
      header: 'Clube',
      render: (player) =>
        player.club_id === null
          ? 'Livre'
          : (clubNames.get(player.club_id) ?? `Clube ${player.club_id}`),
    },
    {
      header: 'Ações',
      render: (player) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDialog({ kind: 'edit', player })}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDialog({ kind: 'condition', player })}
          >
            Condição
          </Button>
          {player.club_id === null && (
            <Button
              size="sm"
              onClick={() => setDialog({ kind: 'buy', player })}
            >
              Comprar
            </Button>
          )}
          {player.club_id === null && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDialog({ kind: 'delete', player })}
            >
              Excluir
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Jogadores"
        description="Valores e overall calculados pela API."
        actions={
          <Button onClick={() => setDialog({ kind: 'create' })}>
            Cadastrar jogador
          </Button>
        }
      />
      <PlayerFiltersForm onApply={applyFilters} />
      <div className="flex flex-col gap-3">
        <DataTable
          caption="Jogadores"
          columns={columns}
          rows={players.data?.data}
          getRowKey={(player) => player.id}
          isLoading={players.isPending}
          error={players.error}
          emptyMessage="Nenhum jogador encontrado."
        />
        {players.data && (
          <Pagination
            page={players.data.meta.page}
            totalPages={players.data.meta.total_pages}
            totalItems={players.data.meta.total_items}
            itemsLabel="jogadores encontrados"
            onPageChange={setPage}
          />
        )}
      </div>
      {dialog?.kind === 'create' && <CreatePlayerDialog onClose={close} />}
      {dialog?.kind === 'edit' && (
        <EditPlayerDialog player={dialog.player} onClose={close} />
      )}
      {dialog?.kind === 'condition' && (
        <ConditionDialog player={dialog.player} onClose={close} />
      )}
      {dialog?.kind === 'buy' && (
        <BuyPlayerDialog player={dialog.player} onClose={close} />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Excluir jogador"
          message={
            <>
              Excluir <strong>{dialog.player.name}</strong>? Ele sai da lista de
              jogadores, e as transações antigas continuam no histórico.
            </>
          }
          confirmLabel="Excluir"
          isPending={deletion.isPending}
          onConfirm={() => confirmDelete(dialog.player)}
          onCancel={close}
        />
      )}
    </>
  );
}
