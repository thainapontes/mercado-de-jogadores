import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { CreateClubInput } from '../../api/clubs';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useCreateClub } from '../../hooks/useClubs';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { createClubSchema, type CreateClubForm } from './clubSchema';

export function CreateClubDialog({ onClose }: { onClose: () => void }) {
  const mutation = useCreateClub();
  const save = useSubmitAction(
    mutation.mutateAsync,
    'Clube criado com caixa de 300,00.',
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClubForm, unknown, CreateClubInput>({
    resolver: zodResolver(createClubSchema),
  });

  const submit = handleSubmit(async (input) => {
    if (await save(input)) {
      onClose();
    }
  });

  return (
    <Modal title="Criar clube" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormField
          label="Nome (3 a 60 caracteres)"
          htmlFor="club-name"
          error={errors.name?.message}
        >
          <Input id="club-name" invalid={!!errors.name} {...register('name')} />
        </FormField>
        <FormField
          label="Sigla (3 letras do nome, em maiúsculas)"
          htmlFor="club-acronym"
          error={errors.acronym?.message}
        >
          <Input
            id="club-acronym"
            maxLength={3}
            invalid={!!errors.acronym}
            {...register('acronym')}
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton isPending={mutation.isPending}>Criar</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
