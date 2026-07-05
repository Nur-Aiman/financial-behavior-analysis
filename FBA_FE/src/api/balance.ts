/**
 * Balance API Service
 */

import { apiClient } from './client';
import { BalanceAdjustment, ApiResponse } from '../types';

export interface BalanceResponse {
  currentBalanceCents: number;
  currentBalance: string;
}

export interface AdjustmentResponse {
  adjustment: BalanceAdjustment;
  newBalance: string;
}

export const balanceAPI = {
  /**
   * Get current balance
   */
  getBalance: async (): Promise<BalanceResponse> => {
    const response = await apiClient.get<ApiResponse<BalanceResponse>>(
      '/balance'
    );
    return response.data.data!;
  },

  /**
   * Update balance with reason
   */
  updateBalance: async (
    newBalanceCents: number,
    reason: string
  ): Promise<AdjustmentResponse> => {
    const response = await apiClient.put<ApiResponse<AdjustmentResponse>>(
      '/balance',
      { newBalanceCents, reason }
    );
    return response.data.data!;
  },

  /**
   * Get adjustment history
   */
  getHistory: async (): Promise<BalanceAdjustment[]> => {
    const response = await apiClient.get<ApiResponse<BalanceAdjustment[]>>(
      '/balance/history'
    );
    return response.data.data!;
  },
};
