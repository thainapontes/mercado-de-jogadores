import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { SquadPlayer } from '../../api/clubs';
import { FORMATIONS, type LineupInput } from '../../api/league';
import type { Player } from '../../api/players';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { FormField } from '../../components/ui/FormField';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useLineup, useUpdateLineup } from '../../hooks/useLeague';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { CONDITION_LABELS } from '../../utils/labels';
import { lineupSlots } from './lineupSlots';
import { EMPTY_SLOTS, lineupSchema, type LineupForm } from './lineupSchema';

const starterColumns: Column<Player>[] = [
  { header: 'Posição', render: (player) => player.position },
  { header: 'Nome', render: (player) => player.name },
  {
    header: 'Condição',
    render: (player) => CONDITION_LABELS[player.condition],
  },
  { header: 'Overall', render: (player) => player.overall, align: 'right' },
];

interface LineupTabProps {
  clubId: string;
  squad: SquadPlayer[] | undefined;
}

export function LineupTab({ clubId, squad }: LineupTabProps) {
  const lineup = useLineup(clubId);
  const mutation = useUpdateLineup(clubId);
  const save = useSubmitAction(mutation.mutateAsync, 'Escalação salva.');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LineupForm, unknown, LineupInput>({
    resolver: zodResolver(lineupSchema),
    defaultValues: { player_ids: EMPTY_SLOTS },
  });
  const formation = watch('formation');
  const slots = formation ? lineupSlots(formation) : [];

  const submit = handleSubmit((input) => save(input));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label="Escalação atual" className="flex flex-col gap-3">
        <h3 className="font-semibold">
          Escalação atual
          {lineup.data?.formation && ` · ${lineup.data.formation}`}
        </h3>
        {lineup.data && !lineup.data.complete && (
          <p
            role="alert"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            Escalação incompleta: o clube não pode jogar até completar a
            escalação.
          </p>
        )}
        <DataTable
          caption="Titulares"
          columns={starterColumns}
          rows={lineup.data?.players}
          getRowKey={(player) => player.id}
          isLoading={lineup.isPending}
          error={lineup.error}
          emptyMessage="Nenhum titular escalado."
        />
      </section>
      <form
        onSubmit={submit}
        noValidate
        aria-label="Nova escalação"
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <h3 className="font-semibold">Escalar</h3>
        <FormField
          label="Formação"
          htmlFor="lineup-formation"
          error={errors.formation?.message}
        >
          <Select
            id="lineup-formation"
            invalid={!!errors.formation}
            defaultValue=""
            {...register('formation', {
              onChange: () => setValue('player_ids', EMPTY_SLOTS),
            })}
          >
            <option value="" disabled>
              Escolha…
            </option>
            {FORMATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
        {slots.map((slot, index) => (
          <FormField
            key={`${formation}-${index}`}
            label={slot.label}
            htmlFor={`lineup-slot-${index}`}
            error={errors.player_ids?.[index]?.message}
          >
            <Select
              id={`lineup-slot-${index}`}
              invalid={!!errors.player_ids?.[index]}
              {...register(`player_ids.${index}`)}
            >
              <option value="">Escolha…</option>
              {squad
                ?.filter(
                  (player) =>
                    slot.positions.includes(player.position) &&
                    player.condition !== 'DOENTE',
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.position} ·{' '}
                    {CONDITION_LABELS[player.condition]})
                  </option>
                ))}
            </Select>
          </FormField>
        ))}
        {errors.player_ids?.root?.message && (
          <p className="text-xs text-red-700">
            {errors.player_ids.root.message}
          </p>
        )}
        <div className="flex justify-end">
          <SubmitButton isPending={mutation.isPending}>
            Salvar escalação
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
