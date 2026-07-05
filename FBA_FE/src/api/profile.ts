/**
 * Financial Profile API Service
 */

import { apiClient } from './client';
import { FinancialProfile, ApiResponse } from '../types';

export const profileAPI = {
  /**
   * Create financial profile
   */
  create: async (data: Partial<FinancialProfile>): Promise<FinancialProfile> => {
    const response = await apiClient.post<ApiResponse<FinancialProfile>>(
      '/profile',
      data
    );
    return response.data.data!;
  },

  /**
   * Get active profile
   */
  getProfile: async (): Promise<FinancialProfile> => {
    const response = await apiClient.get<ApiResponse<FinancialProfile>>(
      '/profile'
    );
    return response.data.data!;
  },

  /**
   * Update profile
   */
  update: async (data: Partial<FinancialProfile>): Promise<FinancialProfile> => {
    const response = await apiClient.put<ApiResponse<FinancialProfile>>(
      '/profile',
      data
    );
    return response.data.data!;
  },

  /**
   * Get remaining days until payday
   */
  getRemainingDays: async (): Promise<{ remainingDays: number }> => {
    const response = await apiClient.get<ApiResponse<{ remainingDays: number }>>(
      '/profile/remaining-days'
    );
    return response.data.data!;
  },
};
