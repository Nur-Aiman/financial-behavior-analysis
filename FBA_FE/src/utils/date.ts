/**
 * Date utility functions
 */

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-MY', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getTodayIsoString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

export function getDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isDatePassed(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayIsoString();
}

export function isDateInFuture(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}
