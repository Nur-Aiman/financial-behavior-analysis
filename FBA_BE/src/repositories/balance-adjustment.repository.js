/**
 * Balance Adjustment Repository
 */

import { store } from '../storage/in-memory.store.js';
import { generateId } from '../utils/id.utils.js';
import { getDatabase } from '../database/connection.js';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export const balanceAdjustmentRepository = {
  async create(data) {
    const adjustment = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.addBalanceAdjustment(adjustment);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: adjustment.id,
          previous_balance_cents: adjustment.previousBalanceCents,
          new_balance_cents: adjustment.newBalanceCents,
          adjustment_amount_cents: adjustment.adjustmentAmountCents,
          reason: adjustment.reason,
          created_at: adjustment.createdAt,
        };
        await db('balance_adjustments').insert(dbData);
        console.log(`✅ Balance adjustment saved to database: ${adjustment.id}`);
      } catch (err) {
        console.error(`❌ Error persisting balance adjustment: ${err.message}`);
      }
    }

    return adjustment;
  },

  findAll() {
    return store.getBalanceAdjustments();
  },

  getHistory() {
    return this.findAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  clear() {
    const all = this.findAll();
    all.forEach(a => store.removeBalanceAdjustment(a.id));
  },
};
