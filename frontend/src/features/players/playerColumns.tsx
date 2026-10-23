import type { Player } from '../../api/players';
import type { Column } from '../../components/ui/DataTable';
import { formatMoney } from '../../utils/format';
import { CONDITION_LABELS } from '../../utils/labels';

export const playerColumns: Column<Player>[] = [
  { header: 'Nome', render: (player) => player.name },
  { header: 'Posição', render: (player) => player.position },
  { header: 'Overall', render: (player) => player.overall, align: 'right' },
  { header: 'Agilidade', render: (player) => player.agility, align: 'right' },
  { header: 'Idade', render: (player) => player.age, align: 'right' },
  {
    header: 'Condição',
    render: (player) => CONDITION_LABELS[player.condition],
  },
  {
    header: 'Valor base',
    render: (player) => formatMoney(player.base_value),
    align: 'right',
  },
  {
    header: 'Valor de mercado',
    render: (player) => formatMoney(player.market_value),
    align: 'right',
  },
];
