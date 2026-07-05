/**
 * Date Utilities
 * 
 * All dates are ISO format strings: YYYY-MM-DD
 * This avoids timezone bugs that could change the number of remaining days.
 */

/**
 * Parse ISO date string to Date object (midnight UTC)
 * Example: "2026-07-05" -> Date object
 */
export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date;
}

/**
 * Convert Date object to ISO date string
 * Example: Date object -> "2026-07-05"
 */
export function dateToIsoString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as ISO string
 */
export function getTodayIsoString(): string {
  return dateToIsoString(new Date());
}

/**
 * Calculate remaining days between two dates (inclusive of both dates)
 * Example: from "2026-07-05" to "2026-07-24" = 20 days
 * 
 * Includes today in the count.
 * Returns 1 if dates are the same.
 * Returns 0 if end date is before start date.
 */
export function calculateRemainingDays(
  startDateStr: string,
  endDateStr: string
): number {
  const startDate = parseIsoDate(startDateStr);
  const endDate = parseIsoDate(endDateStr);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(1, diffDays); // Minimum 1 day to avoid division by zero
}

/**
 * Check if a date has passed (is before today)
 */
export function hasDatePassed(dateStr: string): boolean {
  const date = parseIsoDate(dateStr);
  const today = parseIsoDate(getTodayIsoString());
  return date < today;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayIsoString();
}

/**
 * Check if a date is in the past (includes today)
 */
export function isDateInPast(dateStr: string): boolean {
  const date = parseIsoDate(dateStr);
  const today = parseIsoDate(getTodayIsoString());
  return date <= today;
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(dateStr: string): boolean {
  return !isDateInPast(dateStr);
}

/**
 * Get date N days from now
 */
export function getDateNDaysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return dateToIsoString(date);
}

/**
 * Get date N days before now
 */
export function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return dateToIsoString(date);
}

/**
 * Check if date is within range (inclusive)
 */
export function isDateInRange(
  dateStr: string,
  startStr: string,
  endStr: string
): boolean {
  const date = parseIsoDate(dateStr);
  const start = parseIsoDate(startStr);
  const end = parseIsoDate(endStr);
  return date >= start && date <= end;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(dateStr: string): number {
  const date = parseIsoDate(dateStr);
  return date.getUTCDay();
}

/**
 * Get day name
 */
export function getDayName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getDayOfWeek(dateStr)];
}

/**
 * Format ISO date for display
 * Example: "2026-07-05" -> "5 Jul 2026"
 */
export function formatDateForDisplay(dateStr: string, locale: string = 'en-MY'): string {
  const date = parseIsoDate(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days between two dates (absolute value)
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const date1 = parseIsoDate(dateStr1);
  const date2 = parseIsoDate(dateStr2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
