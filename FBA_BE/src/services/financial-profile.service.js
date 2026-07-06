/**
 * Financial Profile Service
 * Manages user's financial configuration
 */

import { financialProfileRepository } from '../repositories/financial-profile.repository.js';
import { AppError } from '../errors/app-error.js';
import { getTodayIsoString } from '../utils/date.utils.js';

export const financialProfileService = {
  /**
   * Create financial profile
   */
  async create(data) {
    const existing = financialProfileRepository.findAll();
    if (existing.length > 0) {
      throw new AppError({
        code: 'PROFILE_ALREADY_EXISTS',
        message: 'A financial profile already exists. Update it instead.',
        statusCode: 400,
      });
    }

    const profileData = {
      ...data,
      openingBalanceCents: data.openingBalanceCents ?? data.currentBalanceCents,
    };

    return await financialProfileRepository.create(profileData);
  },

  /**
   * Get active profile
   */
  getProfile() {
    const profiles = financialProfileRepository.findAll();
    if (profiles.length === 0) {
      throw new AppError({
        code: 'PROFILE_NOT_FOUND',
        message: 'No financial profile configured',
        statusCode: 404,
      });
    }
    return profiles[0];
  },

  /**
   * Update financial profile
   */
  async updateProfile(data) {
    const profile = this.getProfile();
    return await financialProfileRepository.update(profile.id, data);
  },

  /**
   * Get remaining days until payday
   */
  getRemainingDays() {
    const profile = this.getProfile();
    const today = new Date(getTodayIsoString());
    const payday = new Date(profile.nextPayday);
    const msPerDay = 86400000;
    return Math.ceil((payday - today) / msPerDay);
  },
};




