import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CONDITIONS, type Player } from '../../api/players';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useUpdatePlayerCondition } from '../../hooks/usePlayers';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { CONDITION_LABELS } from '../../utils/labels';
import { conditionSchema } from './playerSchemas';

interface ConditionDialogProps {
  player: Player;
  onClose: () => void;
}

export function ConditionDialog({ player, onClose }: ConditionDialogProps) {
  const mutation = useUpdatePlayerCondition();
  const save = useSubmitAction(mutation.mutateAsync, 'Condição alterada.');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof conditionSchema>>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { condition: player.condition },
  });

  const submit = handleSubmit(async ({ condition }) => {
    if (await save({ id: player.id, condition })) {
      onClose();
    }
  });

  return (
    <Modal title={`Condição de ${player.name}`} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Condição física"
          htmlFor="player-condition"
          error={errors.condition?.message}
        >
          <Select
            id="player-condition"
            invalid={!!errors.condition}
            {...register('condition')}
          >
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {CONDITION_LABELS[condition]}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton isPending={mutation.isPending}>Salvar</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
