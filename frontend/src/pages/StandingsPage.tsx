import type { Standing } from '../api/league';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, type Column } from '../components/ui/DataTable';
import { useStandings } from '../hooks/useLeague';

const columns: Column<Standing>[] = [
  { header: 'Pos.', render: (row) => row.position, align: 'right' },
  { header: 'Clube', render: (row) => row.club_name },
  { header: 'J', render: (row) => row.played, align: 'right' },
  { header: 'V', render: (row) => row.wins, align: 'right' },
  { header: 'E', render: (row) => row.draws, align: 'right' },
  { header: 'D', render: (row) => row.losses, align: 'right' },
  { header: 'GM', render: (row) => row.goals_for, align: 'right' },
  { header: 'GS', render: (row) => row.goals_against, align: 'right' },
  { header: 'SG', render: (row) => row.goal_difference, align: 'right' },
  {
    header: 'Pts',
    render: (row) => <strong>{row.points}</strong>,
    align: 'right',
  },
];

export function StandingsPage() {
  const standings = useStandings();

  return (
    <>
      <PageHeader
        title="Classificação"
        description="J: jogos · V: vitórias · E: empates · D: derrotas · GM: gols marcados · GS: gols sofridos · SG: saldo · Pts: pontos"
      />
      <DataTable
        caption="Classificação"
        columns={columns}
        rows={standings.data}
        getRowKey={(row) => row.club_id}
        isLoading={standings.isPending}
        error={standings.error}
        emptyMessage="Nenhum clube cadastrado."
      />
    </>
  );
}
