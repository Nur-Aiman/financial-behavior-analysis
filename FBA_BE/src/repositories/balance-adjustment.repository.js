/**
 * Balance Adjustment Repository
 */

import { BalanceAdjustment} from '../models/index';
import { store} from '../storage/in-memory.store';
import { generateId} from '../utils/id.utils';
import { getDatabase} from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class BalanceAdjustmentRepository {
  /**
   * Create a new balance adjustment
   */
  async create(data, 'id'>): Promise<BalanceAdjustment> {
    const adjustment= {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),};
    store.addBalanceAdjustment(adjustment);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: adjustment.id,
          previous_balance_cents: adjustment.previousBalanceCents,
          new_balance_cents: adjustment.newBalanceCents,
          adjustment_amount_cents: adjustment.adjustmentAmountCents,
          reason: adjustment.reason,
          created_at: adjustment.createdAt,};
        await db('balance_adjustments').insert(dbData);
        console.log(`âœ… Balance adjustment saved to database: ${adjustment.id}`);} catch (err) {
        console.error(`âŒ Error persisting balance adjustment to database: ${err.message}`);}}

    return adjustment;}

  /**
   * Find all adjustments
   */
  findAll()] {
    return store.getBalanceAdjustments();}

  /**
   * Get adjustment history (sorted by date descending)
   */
  getHistory()] {
    return this.findAll().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());}

  /**
   * Clear all adjustments
   */
  clear(): void {
    const adjustments = this.findAll();
    adjustments.forEach(() => {
      // In memory store, just clear all});
    store.clear();}}

export const balanceAdjustmentRepository = new BalanceAdjustmentRepository();

