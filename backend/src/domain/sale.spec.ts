import { Decimal } from './money';
import {
  calculateCommission,
  calculateSale,
  penaltyRate,
  remainingDays,
} from './sale';

const NOW = new Date('2026-11-12T18:00:00.000Z');
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function afterNow(ms: number): Date {
  return new Date(NOW.getTime() + ms);
}

describe('remainingDays e penaltyRate (RN15, tabela de exemplos)', () => {
  it.each([
    ['já passou', -DAY, 0, 0],
    ['é o próprio momento', 0, 0, 0],
    ['10 dias e 2 horas', 10 * DAY + 2 * HOUR, 11, 5],
    ['exatamente 30 dias', 30 * DAY, 30, 5],
    ['30 dias e 1 minuto', 30 * DAY + MINUTE, 31, 10],
    ['exatamente 180 dias', 180 * DAY, 180, 10],
    ['180 dias e 1 minuto', 180 * DAY + MINUTE, 181, 20],
    ['200 dias', 200 * DAY, 200, 20],
    [
      '116 dias, 17 horas e 35 minutos',
      116 * DAY + 17 * HOUR + 35 * MINUTE,
      117,
      10,
    ],
  ])('fidelidade %s: %i dias, multa de %i%%', (_, offset, days, rate) => {
    expect(remainingDays(afterNow(offset), NOW)).toBe(days);
    expect(penaltyRate(days)).toBe(rate);
  });

  it('1 dia restante já cobra 5%', () => {
    expect(penaltyRate(1)).toBe(5);
  });
});

describe('calculateCommission (RN16, tabela de exemplos)', () => {
  it.each([
    ['3.00', '0.30'],
    ['3.85', '0.39'],
    ['10.00', '1.00'],
    ['10.01', '1.00'],
    ['15.00', '2.00'],
    ['-7.50', '0.00'],
    ['0.00', '0.00'],
  ])('lucro %s: comissão %s', (profit, expected) => {
    expect(calculateCommission(new Decimal(profit)).toFixed(2)).toBe(expected);
  });
});

describe('calculateSale (RN15 e RN16, tabela de exemplos da venda)', () => {
  it.each([
    ['37.00', '40.00', 60, '4.00', '3.00', '0.30', '35.70', 'RESCINDIDO'],
    ['50.00', '42.50', 200, '8.50', '-7.50', '0.00', '34.00', 'RESCINDIDO'],
    ['26.15', '30.00', 10, '1.50', '3.85', '0.39', '28.11', 'RESCINDIDO'],
    ['25.00', '25.00', -1, '0.00', '0.00', '0.00', '25.00', 'ENCERRADO'],
    ['60.00', '75.00', 200, '10.00', '15.00', '2.00', '63.00', 'RESCINDIDO'],
  ])(
    'compra %s, venda %s, fidelidade daqui a %i dias: multa %s, lucro %s, comissão %s, crédito %s, %s',
    (
      purchaseValue,
      marketValue,
      loyaltyDays,
      penalty,
      profit,
      commission,
      credit,
      contractStatus,
    ) => {
      const sale = calculateSale({
        marketValue: new Decimal(marketValue),
        purchaseValue: new Decimal(purchaseValue),
        loyaltyUntil: afterNow(loyaltyDays * DAY),
        now: NOW,
      });
      expect(sale.penalty.toFixed(2)).toBe(penalty);
      expect(sale.profit.toFixed(2)).toBe(profit);
      expect(sale.commission.toFixed(2)).toBe(commission);
      expect(sale.credit.toFixed(2)).toBe(credit);
      expect(sale.contractStatus).toBe(contractStatus);
    },
  );
});
