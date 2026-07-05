/**
 * ID Generation Utilities
 */

import { v4} from 'uuid';

/**
 * Generate a unique ID using UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a prefixed ID
 * Example: generatePrefixedId('TXN') -> 'TXN_550e8400e29b41d4a716446655440000'
 */
export function generatePrefixedId(prefix): string {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Validate UUID format
 */
export function isValidUuid(id): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
