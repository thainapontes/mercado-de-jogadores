import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { DetailList } from '../components/ui/DetailList';
import { Tabs } from '../components/ui/Tabs';
import { SquadTab } from '../features/clubs/SquadTab';
import { TransactionsTab } from '../features/clubs/TransactionsTab';
import { LineupTab } from '../features/league/LineupTab';
import { useClub } from '../hooks/useClubs';
import { formatMoney } from '../utils/format';

type ClubTab = 'squad' | 'transactions' | 'lineup';

const TABS: { id: ClubTab; label: string }[] = [
  { id: 'squad', label: 'Elenco' },
  { id: 'transactions', label: 'Histórico' },
  { id: 'lineup', label: 'Escalação' },
];

export function ClubPage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState<ClubTab>('squad');
  const club = useClub(id);

  return (
    <>
      <Link to="/clubs" className="text-sm text-emerald-800 underline">
        ← Clubes
      </Link>
      <PageHeader
        title={club.data ? `${club.data.name} (${club.data.acronym})` : 'Clube'}
      />
      {club.data && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
          <DetailList
            items={[
              { label: 'Caixa', value: formatMoney(club.data.cash) },
              {
                label: 'Valor do elenco',
                value: formatMoney(club.data.squad_value),
              },
              {
                label: 'Patrimônio',
                value: formatMoney(club.data.net_worth),
              },
            ]}
          />
        </div>
      )}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === 'squad' && (
          <SquadTab
            players={club.data?.players}
            isLoading={club.isPending}
            error={club.error}
          />
        )}
        {tab === 'transactions' && (
          <TransactionsTab clubId={id} clubAcronym={club.data?.acronym} />
        )}
        {tab === 'lineup' && (
          <LineupTab clubId={id} squad={club.data?.players} />
        )}
      </div>
    </>
  );
}
