/**
 * Currency utility functions
 */

export function centsToCurrency(cents: number): string {
  return `RM${(cents / 100).toFixed(2)}`;
}

export function currencyToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

export function getCurrencyColor(cents: number, threshold?: number): 'success' | 'warning' | 'error' {
  if (threshold && cents < threshold) {
    return 'error';
  }
  if (cents < 50000) {
    return 'warning';
  }
  return 'success';
}
