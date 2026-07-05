/**
 * Financial Profile Repository
 * 
 * Interface for accessing financial profile data.
 * Currently uses in-memory storage, can be replaced with database without changing services.
 */

import { FinancialProfile } from '../models/index';
import { store } from '../storage/in-memory.store';
import { generateId } from '../utils/id.utils';
import { getDatabase } from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class FinancialProfileRepository {
  /**
   * Create a new financial profile
   */
  async create(data: Omit<FinancialProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialProfile> {
    const now = new Date().toISOString();
    const profile: FinancialProfile = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.addProfile(profile);

    // Persist to database
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
      } catch (err: any) {
        console.error(`❌ Error persisting financial profile to database: ${err.message}`);
      }
    }

    return profile;
  }

  /**
   * Find profile by ID
   */
  findById(id: string): FinancialProfile | null {
    return store.getProfile(id);
  }

  /**
   * Find all profiles (should only be one in v1)
   */
  findAll(): FinancialProfile[] {
    return store.getAllProfiles();
  }

  /**
   * Get the active profile (only one per app in v1)
   */
  getActive(): FinancialProfile | null {
    const profiles = this.findAll();
    return profiles.length > 0 ? profiles[0] : null;
  }

  /**
   * Update profile
   */
  async update(id: string, data: Partial<Omit<FinancialProfile, 'id' | 'createdAt'>>): Promise<FinancialProfile> {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Profile not found: ${id}`);
    }

    const now = new Date().toISOString();
    store.updateProfile(id, {
      ...data,
      updatedAt: now,
    });

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData: any = {
          updated_at: now,
        };

        if (data.currency !== undefined) dbData.currency = data.currency;
        if (data.expectedSalaryCents !== undefined) dbData.expected_salary_cents = data.expectedSalaryCents;
        if (data.openingBalanceCents !== undefined) dbData.opening_balance_cents = data.openingBalanceCents;
        if (data.currentBalanceCents !== undefined) dbData.current_balance_cents = data.currentBalanceCents;
        if (data.salaryCycleStartDate !== undefined) dbData.salary_cycle_start_date = data.salaryCycleStartDate;
        if (data.nextPayday !== undefined) dbData.next_payday = data.nextPayday;

        await db('financial_profiles').where('id', id).update(dbData);
        console.log(`✅ Financial profile updated in database: ${id}`);
      } catch (err: any) {
        console.error(`❌ Error persisting financial profile update to database: ${err.message}`);
      }
    }

    return this.findById(id)!;
  }

  /**
   * Delete profile
   */
  async delete(id: string): Promise<void> {
    store.deleteProfile(id);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('financial_profiles').where('id', id).del();
        console.log(`✅ Financial profile deleted from database: ${id}`);
      } catch (err: any) {
        console.error(`❌ Error persisting financial profile deletion to database: ${err.message}`);
      }
    }
  }

  /**
   * Clear all profiles
   */
  clear(): void {
    const profiles = this.findAll();
    profiles.forEach(p => this.delete(p.id));
  }
}

export const financialProfileRepository = new FinancialProfileRepository();
