import { useState } from 'react';
import type { Match } from '../api/league';
import { PageHeader } from '../components/layout/PageHeader';
import { MatchesHistory } from '../features/league/MatchesHistory';
import { MatchResult } from '../features/league/MatchResult';
import { PlayMatchForm } from '../features/league/PlayMatchForm';

export function MatchesPage() {
  const [lastMatch, setLastMatch] = useState<Match>();

  return (
    <>
      <PageHeader
        title="Partidas"
        description="Os dois clubes precisam estar com a escalação completa."
      />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <PlayMatchForm onPlayed={setLastMatch} />
          {lastMatch && (
            <section aria-label="Resultado da partida">
              <h2 className="mb-2 text-lg font-semibold">Resultado</h2>
              <MatchResult match={lastMatch} />
            </section>
          )}
        </div>
        <MatchesHistory />
      </div>
    </>
  );
}
