const API_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const BRASILIA_OFFSET_HOURS = 3;
const BRASILIA_OFFSET_MS = BRASILIA_OFFSET_HOURS * 60 * 60 * 1000;

export function parseApiDateTime(text: string): Date | null {
  const match = API_DATE_TIME.exec(text);
  if (!match) {
    return null;
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const isValid =
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month) &&
    hour <= 23 &&
    minute <= 59;
  if (!isValid) {
    return null;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour + BRASILIA_OFFSET_HOURS, minute);
  return date;
}

export function formatApiDateTime(date: Date): string {
  const brasilia = new Date(date.getTime() - BRASILIA_OFFSET_MS);
  return `${brasilia.toISOString().slice(0, 19)}-03:00`;
}

function daysInMonth(year: number, month: number): number {
  const lastDay = new Date(0);
  lastDay.setUTCFullYear(year, month, 0);
  return lastDay.getUTCDate();
}
