/**
 * Financial Profile Repository
 */

import { store } from '../storage/in-memory.store.js';
import { generateId } from '../utils/id.utils.js';
import { getDatabase } from '../database/connection.js';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export const financialProfileRepository = {
  async create(data) {
    const now = new Date().toISOString();
    const profile = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.addProfile(profile);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: profile.id,
          currency: profile.currency,
          expected_salary_cents: profile.expectedSalaryCents,
          opening_balance_cents: profile.openingBalanceCents,
          current_balance_cents: profile.currentBalanceCents,
          salary_cycle_start_date: profile.salaryCycleStartDate,
          next_payday: profile.nextPayday,
          created_at: now,
          updated_at: now,
        };
        await db('financial_profiles').insert(dbData);
        console.log(`✅ Financial profile saved to database: ${profile.id}`);
      } catch (err) {
        console.error(`❌ Error persisting financial profile: ${err.message}`);
      }
    }

    return profile;
  },

  findById(id) {
    return store.getProfile(id);
  },

  findAll() {
    return store.getAllProfiles();
  },

  getActive() {
    const profiles = this.findAll();
    return profiles.length > 0 ? profiles[0] : null;
  },

  async update(id, data) {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Profile not found: ${id}`);

    const now = new Date().toISOString();
    store.updateProfile(id, { ...data, updatedAt: now });

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = { updated_at: now };
        if (data.currency !== undefined) dbData.currency = data.currency;
        if (data.expectedSalaryCents !== undefined) dbData.expected_salary_cents = data.expectedSalaryCents;
        if (data.openingBalanceCents !== undefined) dbData.opening_balance_cents = data.openingBalanceCents;
        if (data.currentBalanceCents !== undefined) dbData.current_balance_cents = data.currentBalanceCents;
        if (data.salaryCycleStartDate !== undefined) dbData.salary_cycle_start_date = data.salaryCycleStartDate;
        if (data.nextPayday !== undefined) dbData.next_payday = data.nextPayday;
        await db('financial_profiles').where('id', id).update(dbData);
        console.log(`✅ Financial profile updated in database: ${id}`);
      } catch (err) {
        console.error(`❌ Error updating financial profile: ${err.message}`);
      }
    }

    return this.findById(id);
  },

  async delete(id) {
    store.deleteProfile(id);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('financial_profiles').where('id', id).del();
        console.log(`✅ Financial profile deleted from database: ${id}`);
      } catch (err) {
        console.error(`❌ Error deleting financial profile: ${err.message}`);
      }
    }
  },

  clear() {
    const all = this.findAll();
    all.forEach(p => this.delete(p.id));
  },
};
