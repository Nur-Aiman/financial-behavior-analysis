/**
 * Dashboard API Service
 */

import { apiClient } from './client';
import { DashboardSummary, CategoryUtilisation, ApiResponse } from '../types';

export interface SpendingTrendItem {
  date: string;
  totalSpent: string;
  byCategory: Record<string, string>;
}

export interface PlannedVsActualItem {
  categoryId: string;
  categoryName: string;
  plannedAmount: string;
  actualAmount: string;
  variance: string;
  variancePercentage: number;
}

export interface ProjectedBalanceItem {
  day: number;
  date: string;
  balance: string;
}

export const dashboardAPI = {
  /**
   * Get dashboard summary
   */
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      '/dashboard/summary'
    );
    return response.data.data!;
  },

  /**
   * Get category utilisation
   */
  getCategoryUtilisation: async (): Promise<CategoryUtilisation[]> => {
    const response = await apiClient.get<ApiResponse<CategoryUtilisation[]>>(
      '/dashboard/category-utilisation'
    );
    return response.data.data!;
  },

  /**
   * Get spending trend (last 30 days)
   */
  getSpendingTrend: async (): Promise<SpendingTrendItem[]> => {
    const response = await apiClient.get<ApiResponse<SpendingTrendItem[]>>(
      '/dashboard/spending-trend'
    );
    return response.data.data!;
  },

  /**
   * Get planned vs actual spending
   */
  getPlannedVsActual: async (): Promise<PlannedVsActualItem[]> => {
    const response = await apiClient.get<ApiResponse<PlannedVsActualItem[]>>(
      '/dashboard/planned-vs-actual'
    );
    return response.data.data!;
  },

  /**
   * Get projected balances for remaining days
   */
  getProjectedBalances: async (): Promise<ProjectedBalanceItem[]> => {
    const response = await apiClient.get<ApiResponse<ProjectedBalanceItem[]>>(
      '/dashboard/projected-balances'
    );
    return response.data.data!;
  },
};
