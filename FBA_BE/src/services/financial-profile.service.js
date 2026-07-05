/**
 * Financial Profile Service
 * 
 * Manages user's financial configuration
 */

import { FinancialProfile } from '../models/index';
import { financialProfileRepository } from '../repositories/financial-profile.repository';
import { AppError } from '../errors/app-error';
import { getTodayIsoString, calculateRemainingDays } from '../utils/date.utils';

export class FinancialProfileService {
  /**
   * Create financial profile
   */
  async create(data: {
    currency;
    expectedSalaryCents;
    openingBalanceCents?;
    currentBalanceCents;
    salaryCycleStartDate;
    nextPayday;
  }): Promise<FinancialProfile> {
    // Check if profile already exists
    const existing = financialProfileRepository.getActive();
    if (existing) {
      throw new AppError({
        code: 'PROFILE_ALREADY_EXISTS',
        message: 'A financial profile already exists. Update it instead.',
        statusCode});
    }

    // If opening balance not provided, use current balance
    const profileData = {
      ...data,
      openingBalanceCents: data.openingBalanceCents ?? data.currentBalanceCents,
    };

    return await financialProfileRepository.create(profileData);
  }

  /**
   * Get active profile
   */
  getProfile(): FinancialProfile {
    const profile = financialProfileRepository.getActive();
    if (!profile) {
      throw new AppError({
        code: 'PROFILE_NOT_FOUND',
        message: 'No financial profile configured',
        statusCode});
    }
    return profile;
  }

  /**
   * Update financial profile
   */
  async updateProfile(data: {
    expectedSalaryCents?;
    openingBalanceCents?;
    currentBalanceCents?;
    salaryCycleStartDate?;
    nextPayday?;
  }): Promise<FinancialProfile> {
    const profile = this.getProfile();

    return await financialProfileRepository.update(profile.id, data);
  }

  /**
   * Get remaining days until payday
   */
  getRemainingDays(): number {
    const profile = this.getProfile();
    const today = getTodayIsoString();
    return calculateRemainingDays(today, profile.nextPayday);
  }

  /**
   * Validate payday is in future
   */
  validatePayday(payday): boolean {
    const today = getTodayIsoString();
    const remaining = calculateRemainingDays(today, payday);
    return remaining > 0;
  }
}

export const financialProfileService = new FinancialProfileService();
