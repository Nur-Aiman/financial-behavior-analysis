/**
 * Seed Data for Development and Testing
 * 
 * This file was severely corrupted during TypeScript -> JavaScript conversion
 * Currently disabled. To restore, populate this function with proper seed data.
 */

import { v4 as uuidv4 } from 'uuid';
import { store } from './in-memory.store.js';
import {
  SpendingCategoryType,
  TransactionType,
  TransactionSource,
  FixedExpensePaymentStatus,
} from '../models/index.js';

export function seedData() {
  // TODO: Restore seed data functionality
  // For now, keeping this as a placeholder to prevent import errors
  console.log('Seed data function called but disabled');
}

/**
 * Clear all data
 */
export function clearAllData() {
  store.clear();
  console.log('✓ All data cleared');
}
