import { useState } from 'react';
import type { Match } from '../../api/league';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useClubs } from '../../hooks/useClubs';
import { useMatch, useMatches } from '../../hooks/useLeague';
import { formatDateTime } from '../../utils/format';
import { MatchResult } from './MatchResult';

const columns: Column<Match>[] = [
  { header: 'Data e hora', render: (match) => formatDateTime(match.played_at) },
  { header: 'Mandante', render: (match) => match.home.club_name },
  {
    header: 'Placar',
    render: (match) => `${match.home.goals} × ${match.away.goals}`,
  },
  { header: 'Visitante', render: (match) => match.away.club_name },
];

function MatchDetailDialog({
  matchId,
  onClose,
}: {
  matchId: number;
  onClose: () => void;
}) {
  const match = useMatch(matchId);
  return (
    <Modal title={`Partida ${matchId}`} onClose={onClose}>
      {match.data ? (
        <MatchResult match={match.data} />
      ) : (
        <p
          role={match.error ? 'alert' : 'status'}
          className={match.error ? 'text-red-700' : 'text-slate-500'}
        >
          {match.error ? match.error.message : 'Carregando…'}
        </p>
      )}
    </Modal>
  );
}

export function MatchesHistory() {
  const [clubId, setClubId] = useState('');
  const [openMatchId, setOpenMatchId] = useState<number>();
  const clubs = useClubs();
  const matches = useMatches(clubId);

  return (
    <section aria-label="Histórico de partidas" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">Histórico de partidas</h2>
        <div className="w-full sm:w-64">
          <FormField label="Filtrar por clube" htmlFor="matches-club">
            <Select
              id="matches-club"
              value={clubId}
              onChange={(event) => setClubId(event.target.value)}
            >
              <option value="">Todos</option>
              {clubs.data?.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.acronym})
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Clique numa partida para ver os duelos.
      </p>
      <DataTable
        caption="Partidas"
        columns={columns}
        rows={matches.data}
        getRowKey={(match) => match.id}
        isLoading={matches.isPending}
        error={matches.error}
        emptyMessage="Nenhuma partida jogada."
        onRowClick={(match) => setOpenMatchId(match.id)}
      />
      {openMatchId !== undefined && (
        <MatchDetailDialog
          matchId={openMatchId}
          onClose={() => setOpenMatchId(undefined)}
        />
      )}
    </section>
  );
}
