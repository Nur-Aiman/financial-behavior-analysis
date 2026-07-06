/**
 * Money Utilities
 * 
 * All money operations use integer cents to avoid floating-point precision issues.
 * 
 * Storage: 1500.50 RM is stored* Display,500.50
 */

import Decimal from 'decimal.js';

/**
 * Convert ringgit (decimal) to cents (integer)
 * Example: 1500.50 -> 150050
 */
export function ringgiitToCents(amount) {
  const decimal = new Decimal(amount);
  const cents = decimal.times(100);
  return Math.round(cents.toNumber());}

/**
 * Convert cents (integer) to ringgit (decimal)
 * Example: 150050 -> 1500.50
 */
export function centsTToRinggit(cents) {
  const decimal = new Decimal(cents);
  const ringgit = decimal.dividedBy(100);
  return ringgit.toNumber();}

/**
 * Format cents as Ringgit string
 * Example: 150050 -> "RM 1,500.50"
 */
export function formatCentsAsRinggit(cents) {
  if (cents === undefined || cents === null || isNaN(cents)) {
    return 'RM 0.00';
  }
  const ringgit = centsTToRinggit(cents);
  return `RM ${ringgit.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Safe addition of cents values
 */
export function addCents(a, b) {
  const decimal = new Decimal(a).plus(new Decimal(b));
  return Math.round(decimal.toNumber());
}

/**
 * Safe subtraction of cents values
 */
export function subtractCents(a, b) {
  const decimal = new Decimal(a).minus(new Decimal(b));
  return Math.round(decimal.toNumber());}

/**
 * Safe division of cents values
 * Example: divideCents(15000, 20) = 750 (RM7.50)
 */
export function divideCents(a, b) {
  if (b === 0) return 0;
  const decimal = new Decimal(a).dividedBy(new Decimal(b));
  return Math.round(decimal.toNumber());}

/**
 * Safe multiplication of cents values
 * Example: multiplyCents(2000, 20) = 40000 (RM20 * 20 days = RM400)
 */
export function multiplyCents(a, b) {
  const decimal = new Decimal(a).times(new Decimal(b));
  return Math.round(decimal.toNumber());}

/**
 * Calculate percentage of cents
 * Example: percentageOfCents(80, 100) = 80 (80% of 100)
 */
export function percentageOfCents(percentage, total) {
  const decimal = new Decimal(total).times(percentage).dividedBy(100);
  return Math.round(decimal.toNumber());}

/**
 * Calculate what percentage one value is of another
 * Example: centsAsPercentage(80, 100) = 80 (80 is 80% of 100)
 */
export function centsAsPercentage(value, total) {
  if (total === 0) return 0;
  const decimal = new Decimal(value).times(100).dividedBy(total);
  return decimal.toNumber();}

/**
 * Ensure cents value is non-negative
 */
export function ensureNonNegative(cents) {
  return Math.max(0, cents);}

/**
 * Round cents to nearest cent (should already be integer, but safe anyway)
 */
export function roundCents(cents) {
  return Math.round(cents);}

/**
 * Compare two cents values for equality (with precision tolerance)
 */
export function centsEqual(a, b, tolerance= 0) {
  return Math.abs(a - b) <= tolerance;}




