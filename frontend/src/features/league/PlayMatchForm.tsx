import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { Match, MatchInput } from '../../api/league';
import { FormField } from '../../components/ui/FormField';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useClubs } from '../../hooks/useClubs';
import { useCreateMatch } from '../../hooks/useLeague';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { matchSchema, type MatchForm } from './matchSchema';

interface PlayMatchFormProps {
  onPlayed: (match: Match) => void;
}

export function PlayMatchForm({ onPlayed }: PlayMatchFormProps) {
  const clubs = useClubs();
  const mutation = useCreateMatch();
  const play = useSubmitAction(mutation.mutateAsync, 'Partida jogada.');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchForm, unknown, MatchInput>({
    resolver: zodResolver(matchSchema),
    defaultValues: { home_club_id: '', away_club_id: '' },
  });

  const submit = handleSubmit(async (input) => {
    const result = await play(input);
    if (result) {
      onPlayed(result.data);
    }
  });

  const clubOptions = clubs.data?.map((club) => (
    <option key={club.id} value={club.id}>
      {club.name} ({club.acronym})
    </option>
  ));

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Nova partida"
      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
    >
      <FormField
        label="Mandante"
        htmlFor="match-home"
        error={errors.home_club_id?.message}
      >
        <Select
          id="match-home"
          invalid={!!errors.home_club_id}
          {...register('home_club_id')}
        >
          <option value="" disabled>
            Escolha…
          </option>
          {clubOptions}
        </Select>
      </FormField>
      <FormField
        label="Visitante"
        htmlFor="match-away"
        error={errors.away_club_id?.message}
      >
        <Select
          id="match-away"
          invalid={!!errors.away_club_id}
          {...register('away_club_id')}
        >
          <option value="" disabled>
            Escolha…
          </option>
          {clubOptions}
        </Select>
      </FormField>
      <div className="sm:pt-6">
        <SubmitButton isPending={mutation.isPending}>
          Jogar partida
        </SubmitButton>
      </div>
    </form>
  );
}
