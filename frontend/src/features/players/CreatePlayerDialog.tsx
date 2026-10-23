import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  POSITIONS,
  type CreatePlayerInput,
  type Player,
} from '../../api/players';
import { Button } from '../../components/ui/Button';
import { DetailList } from '../../components/ui/DetailList';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useCreatePlayer } from '../../hooks/usePlayers';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { formatMoney } from '../../utils/format';
import { POSITION_LABELS } from '../../utils/labels';
import { createPlayerSchema, type CreatePlayerForm } from './playerSchemas';

const NUMBER_FIELDS = [
  { name: 'agility', label: 'Agilidade (1–100)' },
  { name: 'age', label: 'Idade (16–45)' },
  { name: 'pace', label: 'Velocidade (1–99)' },
  { name: 'shooting', label: 'Finalização (1–99)' },
  { name: 'passing', label: 'Passe (1–99)' },
  { name: 'dribbling', label: 'Drible (1–99)' },
  { name: 'defending', label: 'Defesa (1–99)' },
  { name: 'physical', label: 'Físico (1–99)' },
  { name: 'potential', label: 'Potencial (1–99)' },
] as const;

export function CreatePlayerDialog({ onClose }: { onClose: () => void }) {
  const [created, setCreated] = useState<Player>();
  const mutation = useCreatePlayer();
  const save = useSubmitAction(mutation.mutateAsync, 'Jogador cadastrado.');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlayerForm, unknown, CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
  });

  const submit = handleSubmit(async (input) => {
    const result = await save(input);
    if (result) {
      setCreated(result.data);
    }
  });

  if (created) {
    return (
      <Modal title="Jogador cadastrado" onClose={onClose}>
        <p className="mb-3 text-sm">
          <strong>{created.name}</strong> foi cadastrado como jogador livre.
          Valores calculados pela API:
        </p>
        <DetailList
          items={[
            { label: 'Overall', value: created.overall },
            { label: 'Valor base', value: formatMoney(created.base_value) },
            {
              label: 'Valor de mercado',
              value: formatMoney(created.market_value),
            },
          ]}
        />
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Cadastrar jogador" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Nome"
            htmlFor="player-name"
            error={errors.name?.message}
          >
            <Input
              id="player-name"
              invalid={!!errors.name}
              {...register('name')}
            />
          </FormField>
        </div>
        <FormField
          label="Posição"
          htmlFor="player-position"
          error={errors.position?.message}
        >
          <Select
            id="player-position"
            invalid={!!errors.position}
            defaultValue=""
            {...register('position')}
          >
            <option value="" disabled>
              Escolha…
            </option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {POSITION_LABELS[position]}
              </option>
            ))}
          </Select>
        </FormField>
        {NUMBER_FIELDS.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            htmlFor={`player-${field.name}`}
            error={errors[field.name]?.message}
          >
            <Input
              id={`player-${field.name}`}
              type="number"
              invalid={!!errors[field.name]}
              {...register(field.name, { valueAsNumber: true })}
            />
          </FormField>
        ))}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton isPending={mutation.isPending}>Salvar</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
