import type { Sale } from '../../api/market';
import { Button } from '../../components/ui/Button';
import { DetailList } from '../../components/ui/DetailList';
import { Modal } from '../../components/ui/Modal';
import { formatMoney, formatSignedMoney } from '../../utils/format';

interface SellResultDialogProps {
  sale: Sale;
  onClose: () => void;
}

export function SellResultDialog({ sale, onClose }: SellResultDialogProps) {
  return (
    <Modal title="Venda realizada" onClose={onClose}>
      <p className="mb-3 text-sm">
        <strong>{sale.player_name}</strong> voltou a ser jogador livre. Contrato{' '}
        {sale.contract_status === 'RESCINDIDO' ? 'rescindido' : 'encerrado'}.
      </p>
      <DetailList
        items={[
          { label: 'Valor de compra', value: formatMoney(sale.purchase_value) },
          { label: 'Valor de venda', value: formatMoney(sale.value) },
          { label: 'Dias restantes', value: sale.remaining_days },
          {
            label: `Multa (${sale.penalty_rate}%)`,
            value: formatMoney(sale.penalty),
          },
          { label: 'Lucro', value: formatSignedMoney(sale.profit) },
          { label: 'Comissão', value: formatMoney(sale.fee) },
          { label: 'Crédito no caixa', value: formatMoney(sale.cash_change) },
          { label: 'Novo caixa', value: formatMoney(sale.club_cash) },
        ]}
      />
      <div className="mt-5 flex justify-end">
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </Modal>
  );
}
