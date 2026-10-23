import { useState, type FormEvent } from 'react';
import {
  CONDITIONS,
  PLAYER_SORTS,
  POSITIONS,
  type PlayerFilters,
} from '../../api/players';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useClubs } from '../../hooks/useClubs';
import {
  CONDITION_LABELS,
  PLAYER_SORT_LABELS,
  POSITION_LABELS,
} from '../../utils/labels';

type Draft = Required<Record<keyof PlayerFilters, string>>;

const EMPTY_DRAFT: Draft = {
  search: '',
  position: '',
  condition: '',
  free: '',
  club_id: '',
  min_age: '',
  max_age: '',
  min_value: '',
  max_value: '',
  sort: 'name',
};

function toFilters(draft: Draft): PlayerFilters {
  return Object.fromEntries(
    Object.entries(draft)
      .map(([name, value]) => [name, value.trim()])
      .filter(([, value]) => value !== ''),
  ) as PlayerFilters;
}

interface PlayerFiltersFormProps {
  onApply: (filters: PlayerFilters) => void;
}

export function PlayerFiltersForm({ onApply }: PlayerFiltersFormProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const clubs = useClubs();

  const change = (name: keyof Draft) => (value: string) =>
    setDraft((current) => ({ ...current, [name]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onApply(toFilters(draft));
  };

  const clear = () => {
    setDraft(EMPTY_DRAFT);
    onApply(toFilters(EMPTY_DRAFT));
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Filtros de jogadores"
      className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <FormField label="Buscar por nome" htmlFor="filter-search">
        <Input
          id="filter-search"
          type="search"
          value={draft.search}
          onChange={(event) => change('search')(event.target.value)}
          placeholder="Ex.: lua"
        />
      </FormField>
      <FormField label="Posição" htmlFor="filter-position">
        <Select
          id="filter-position"
          value={draft.position}
          onChange={(event) => change('position')(event.target.value)}
        >
          <option value="">Todas</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {POSITION_LABELS[position]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Condição" htmlFor="filter-condition">
        <Select
          id="filter-condition"
          value={draft.condition}
          onChange={(event) => change('condition')(event.target.value)}
        >
          <option value="">Todas</option>
          {CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {CONDITION_LABELS[condition]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Clube" htmlFor="filter-club">
        <Select
          id="filter-club"
          value={draft.club_id}
          disabled={draft.free === 'true'}
          title={
            draft.free === 'true'
              ? 'Desmarque “Só livres” para filtrar por clube.'
              : undefined
          }
          onChange={(event) => change('club_id')(event.target.value)}
        >
          <option value="">Todos</option>
          {clubs.data?.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name} ({club.acronym})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Idade mínima" htmlFor="filter-min-age">
        <Input
          id="filter-min-age"
          type="number"
          min={16}
          max={45}
          value={draft.min_age}
          onChange={(event) => change('min_age')(event.target.value)}
        />
      </FormField>
      <FormField label="Idade máxima" htmlFor="filter-max-age">
        <Input
          id="filter-max-age"
          type="number"
          min={16}
          max={45}
          value={draft.max_age}
          onChange={(event) => change('max_age')(event.target.value)}
        />
      </FormField>
      <FormField label="Valor de mercado mínimo" htmlFor="filter-min-value">
        <Input
          id="filter-min-value"
          type="number"
          min={0}
          step="0.01"
          value={draft.min_value}
          onChange={(event) => change('min_value')(event.target.value)}
        />
      </FormField>
      <FormField label="Valor de mercado máximo" htmlFor="filter-max-value">
        <Input
          id="filter-max-value"
          type="number"
          min={0}
          step="0.01"
          value={draft.max_value}
          onChange={(event) => change('max_value')(event.target.value)}
        />
      </FormField>
      <FormField label="Ordenar por" htmlFor="filter-sort">
        <Select
          id="filter-sort"
          value={draft.sort}
          onChange={(event) => change('sort')(event.target.value)}
        >
          {PLAYER_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {PLAYER_SORT_LABELS[sort]}
            </option>
          ))}
        </Select>
      </FormField>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input
          type="checkbox"
          checked={draft.free === 'true'}
          disabled={draft.club_id !== ''}
          onChange={(event) =>
            change('free')(event.target.checked ? 'true' : '')
          }
          className="h-4 w-4 accent-emerald-700"
        />
        Só livres
        {draft.club_id !== '' && (
          <span className="text-xs text-slate-500">
            (não combina com o filtro por clube)
          </span>
        )}
      </label>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
        <Button type="submit">Filtrar</Button>
        <Button variant="secondary" onClick={clear}>
          Limpar
        </Button>
      </div>
    </form>
  );
}
