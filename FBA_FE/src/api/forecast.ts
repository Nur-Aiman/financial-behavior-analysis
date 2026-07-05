/**
 * Forecast API Service
 */

import { apiClient } from './client';
import { FinancialForecast, DailyForecast, ApiResponse } from '../types';

export interface ProjectedBalance {
  currentBalance: string;
  projectedBalanceOnPayday: string;
  remainingDays: number;
  nextPayday: string;
  expectedSalary: string;
  balanceAfterSalary: string;
}

export const forecastAPI = {
  /**
   * Get today's forecast
   */
  getToday: async (): Promise<FinancialForecast> => {
    const response = await apiClient.get<ApiResponse<FinancialForecast>>(
      '/forecast/today'
    );
    return response.data.data!;
  },

  /**
   * Get category forecasts
   */
  getCategories: async (): Promise<DailyForecast[]> => {
    const response = await apiClient.get<ApiResponse<DailyForecast[]>>(
      '/forecast/categories'
    );
    return response.data.data!;
  },

  /**
   * Get projected balance
   */
  getProjectedBalance: async (): Promise<ProjectedBalance> => {
    const response = await apiClient.get<ApiResponse<ProjectedBalance>>(
      '/forecast/projected-balance'
    );
    return response.data.data!;
  },

  /**
   * Manually recalculate forecast
   */
  recalculate: async (): Promise<FinancialForecast> => {
    const response = await apiClient.post<ApiResponse<FinancialForecast>>(
      '/forecast/recalculate'
    );
    return response.data.data!;
  },
};
