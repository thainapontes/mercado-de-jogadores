import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  POSITIONS,
  type Player,
  type UpdatePlayerInput,
} from '../../api/players';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useUpdatePlayer } from '../../hooks/usePlayers';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { POSITION_LABELS } from '../../utils/labels';
import { updatePlayerSchema, type UpdatePlayerForm } from './playerSchemas';

interface EditPlayerDialogProps {
  player: Player;
  onClose: () => void;
}

export function EditPlayerDialog({ player, onClose }: EditPlayerDialogProps) {
  const mutation = useUpdatePlayer();
  const save = useSubmitAction(mutation.mutateAsync, 'Jogador atualizado.');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePlayerForm, unknown, UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      name: player.name,
      position: player.position,
      agility: player.agility,
      age: player.age,
    },
  });

  const submit = handleSubmit(async (input) => {
    if (await save({ id: player.id, input })) {
      onClose();
    }
  });

  return (
    <Modal title={`Editar ${player.name}`} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Nome"
            htmlFor="edit-name"
            error={errors.name?.message}
          >
            <Input
              id="edit-name"
              invalid={!!errors.name}
              {...register('name')}
            />
          </FormField>
        </div>
        <FormField
          label="Posição"
          htmlFor="edit-position"
          error={errors.position?.message}
        >
          <Select
            id="edit-position"
            invalid={!!errors.position}
            {...register('position')}
          >
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {POSITION_LABELS[position]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Agilidade (1–100)"
          htmlFor="edit-agility"
          error={errors.agility?.message}
        >
          <Input
            id="edit-agility"
            type="number"
            invalid={!!errors.agility}
            {...register('agility', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Idade (16–45)"
          htmlFor="edit-age"
          error={errors.age?.message}
        >
          <Input
            id="edit-age"
            type="number"
            invalid={!!errors.age}
            {...register('age', { valueAsNumber: true })}
          />
        </FormField>
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
