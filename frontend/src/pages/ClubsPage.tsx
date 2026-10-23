import { useState } from 'react';
import { Link } from 'react-router';
import { CLUB_SORTS, type Club, type ClubSort } from '../api/clubs';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { Select } from '../components/ui/Select';
import { CreateClubDialog } from '../features/clubs/CreateClubDialog';
import { useClubs } from '../hooks/useClubs';
import { formatMoney } from '../utils/format';

const SORT_LABELS: Record<ClubSort, string> = {
  name: 'Nome (A–Z)',
  net_worth_desc: 'Patrimônio (maior primeiro)',
  net_worth_asc: 'Patrimônio (menor primeiro)',
};

const columns: Column<Club>[] = [
  {
    header: 'Nome',
    render: (club) => (
      <Link
        to={`/clubs/${club.id}`}
        className="font-medium text-emerald-800 underline"
      >
        {club.name}
      </Link>
    ),
  },
  { header: 'Sigla', render: (club) => club.acronym },
  { header: 'Caixa', render: (club) => formatMoney(club.cash), align: 'right' },
  {
    header: 'Valor do elenco',
    render: (club) => formatMoney(club.squad_value),
    align: 'right',
  },
  {
    header: 'Patrimônio',
    render: (club) => formatMoney(club.net_worth),
    align: 'right',
  },
];

export function ClubsPage() {
  const [sort, setSort] = useState<ClubSort>('name');
  const [creating, setCreating] = useState(false);
  const clubs = useClubs(sort);

  return (
    <>
      <PageHeader
        title="Clubes"
        description="Clique no nome para ver o elenco, o histórico e a escalação."
        actions={<Button onClick={() => setCreating(true)}>Criar clube</Button>}
      />
      <div className="mb-4 max-w-xs">
        <FormField label="Ordenar por" htmlFor="clubs-sort">
          <Select
            id="clubs-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ClubSort)}
          >
            {CLUB_SORTS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <DataTable
        caption="Clubes"
        columns={columns}
        rows={clubs.data}
        getRowKey={(club) => club.id}
        isLoading={clubs.isPending}
        error={clubs.error}
        emptyMessage="Nenhum clube cadastrado."
      />
      {creating && <CreateClubDialog onClose={() => setCreating(false)} />}
    </>
  );
}
