import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { BuyInput, Purchase } from '../../api/market';
import type { Player } from '../../api/players';
import { Button } from '../../components/ui/Button';
import { DetailList } from '../../components/ui/DetailList';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { SubmitButton } from '../../components/ui/SubmitButton';
import { useClubs } from '../../hooks/useClubs';
import { useBuyPlayer } from '../../hooks/useMarket';
import { useSubmitAction } from '../../hooks/useSubmitAction';
import { formatDateTime, formatMoney } from '../../utils/format';
import { buySchema, type BuyForm } from './buySchema';

interface BuyPlayerDialogProps {
  player: Player;
  onClose: () => void;
}

export function BuyPlayerDialog({ player, onClose }: BuyPlayerDialogProps) {
  const [purchase, setPurchase] = useState<Purchase>();
  const clubs = useClubs();
  const mutation = useBuyPlayer();
  const buy = useSubmitAction(mutation.mutateAsync, 'Compra realizada.');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyForm, unknown, BuyInput>({
    resolver: zodResolver(buySchema),
    defaultValues: { club_id: '', loyalty_until: '' },
  });

  const submit = handleSubmit(async (input) => {
    const result = await buy({ playerId: player.id, input });
    if (result) {
      setPurchase(result.data);
    }
  });

  if (purchase) {
    return (
      <Modal title="Compra realizada" onClose={onClose}>
        <p className="mb-3 text-sm">
          <strong>{purchase.player_name}</strong> agora joga no{' '}
          {clubs.data?.find((club) => club.id === purchase.club_id)?.name}.
        </p>
        <DetailList
          items={[
            { label: 'Valor', value: formatMoney(purchase.value) },
            { label: 'Taxa', value: formatMoney(purchase.fee) },
            {
              label: 'Custo total (valor + taxa)',
              value: formatMoney(purchase.value + purchase.fee),
            },
            {
              label: 'Fim da fidelidade',
              value: formatDateTime(purchase.contract.loyalty_until),
            },
            { label: 'Novo caixa', value: formatMoney(purchase.club_cash) },
          ]}
        />
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Comprar ${player.name}`} onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        Valor de mercado agora: {formatMoney(player.market_value)}. A taxa e o
        custo final são calculados pela API no momento da compra.
      </p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormField
          label="Clube comprador"
          htmlFor="buy-club"
          error={errors.club_id?.message}
        >
          <Select
            id="buy-club"
            invalid={!!errors.club_id}
            {...register('club_id')}
          >
            <option value="" disabled>
              Escolha…
            </option>
            {clubs.data?.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name} ({club.acronym}) · caixa {formatMoney(club.cash)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Fim da fidelidade (horário de Brasília)"
          htmlFor="buy-loyalty"
          error={errors.loyalty_until?.message}
        >
          <Input
            id="buy-loyalty"
            type="datetime-local"
            invalid={!!errors.loyalty_until}
            {...register('loyalty_until')}
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton isPending={mutation.isPending}>
            Confirmar compra
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
