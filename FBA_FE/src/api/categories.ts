/**
 * Categories API Service
 */

import { apiClient } from './client';
import { SpendingCategory, SpendingCategoryType, ApiResponse } from '../types';

export interface CategoryFilters {
  type?: SpendingCategoryType;
  active?: boolean;
}

export interface CategoryWithStats extends SpendingCategory {
  allocatedAmount: string;
  spent: string;
  remaining: string;
  utilisationPercentage: number;
}

export const categoryAPI = {
  /**
   * Create category
   */
  create: async (data: Partial<SpendingCategory>): Promise<SpendingCategory> => {
    const response = await apiClient.post<ApiResponse<SpendingCategory>>(
      '/categories',
      data
    );
    return response.data.data!;
  },

  /**
   * Get all categories with optional filters
   */
  getAll: async (filters?: CategoryFilters): Promise<SpendingCategory[]> => {
    const response = await apiClient.get<ApiResponse<SpendingCategory[]>>(
      '/categories',
      { params: filters }
    );
    return response.data.data!;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<CategoryWithStats> => {
    const response = await apiClient.get<ApiResponse<CategoryWithStats>>(
      `/categories/${id}`
    );
    return response.data.data!;
  },

  /**
   * Update category
   */
  update: async (
    id: string,
    data: Partial<SpendingCategory>
  ): Promise<SpendingCategory> => {
    const response = await apiClient.put<ApiResponse<SpendingCategory>>(
      `/categories/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Deactivate category
   */
  deactivate: async (id: string): Promise<SpendingCategory> => {
    const response = await apiClient.patch<ApiResponse<SpendingCategory>>(
      `/categories/${id}/deactivate`
    );
    return response.data.data!;
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  /**
   * Reorder categories
   */
  reorder: async (categoryIds: string[]): Promise<SpendingCategory[]> => {
    const response = await apiClient.put<ApiResponse<SpendingCategory[]>>(
      '/categories/reorder',
      { categoryIds }
    );
    return response.data.data!;
  },
};
