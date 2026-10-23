const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const BRASILIA_OFFSET = '-03:00';

const moneyFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const signedMoneyFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRASILIA_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatMoney(value: number): string {
  return moneyFormat.format(value);
}

export function formatSignedMoney(value: number): string {
  return signedMoneyFormat.format(value);
}

export function formatDateTime(isoDateTime: string): string {
  const parts = Object.fromEntries(
    dateTimeFormat
      .formatToParts(new Date(isoDateTime))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

export function toApiDateTime(localDateTime: string): string {
  return `${localDateTime.slice(0, 16)}${BRASILIA_OFFSET}`;
}
