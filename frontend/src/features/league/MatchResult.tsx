import type { Duel, DuelPlayer, Match } from '../../api/league';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { formatDateTime } from '../../utils/format';
import { ATTRIBUTE_LABELS, CONDITION_LABELS } from '../../utils/labels';

function describePlayer(player: DuelPlayer) {
  return (
    <div>
      <div className="font-medium">{player.player_name}</div>
      <div className="text-xs text-slate-500">
        {player.position} · {CONDITION_LABELS[player.condition]}
      </div>
    </div>
  );
}

function describeAttribute(player: DuelPlayer) {
  return `${ATTRIBUTE_LABELS[player.attribute] ?? player.attribute}: ${player.value}`;
}

export function MatchResult({ match }: { match: Match }) {
  const clubNames = new Map([
    [match.home.club_id, match.home.club_name],
    [match.away.club_id, match.away.club_name],
  ]);

  const duelColumns: Column<Duel>[] = [
    { header: 'Duelo', render: (duel) => duel.order, align: 'right' },
    {
      header: 'Ataca',
      render: (duel) => clubNames.get(duel.attacking_club_id),
    },
    { header: 'Atacante', render: (duel) => describePlayer(duel.attacker) },
    {
      header: 'Atributo do atacante',
      render: (duel) => describeAttribute(duel.attacker),
    },
    { header: 'Defensor', render: (duel) => describePlayer(duel.defender) },
    {
      header: 'Atributo do defensor',
      render: (duel) => describeAttribute(duel.defender),
    },
    {
      header: 'Gol',
      render: (duel) =>
        duel.goal ? (
          <span className="font-semibold text-emerald-700">Gol</span>
        ) : (
          'Não'
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
        <p className="text-xs text-slate-500">
          {formatDateTime(match.played_at)}
        </p>
        <p className="mt-1 text-xl font-semibold">
          {match.home.club_name}{' '}
          <span className="tabular-nums">
            {match.home.goals} × {match.away.goals}
          </span>{' '}
          {match.away.club_name}
        </p>
        <p className="text-xs text-slate-500">
          Formações: {match.home.formation} × {match.away.formation}
        </p>
      </div>
      <DataTable
        caption="Duelos"
        columns={duelColumns}
        rows={match.duels}
        getRowKey={(duel) => duel.order}
        isLoading={false}
        error={null}
        emptyMessage="Sem duelos."
      />
    </div>
  );
}
