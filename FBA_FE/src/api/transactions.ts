/**
 * Transactions API Service
 */

import { apiClient } from './client';
import { Transaction, TransactionType, ApiResponse } from '../types';

export interface TransactionFilters {
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionWithAmount extends Transaction {
  amount: string;
}

export const transactionAPI = {
  /**
   * Create transaction
   */
  create: async (data: Partial<Transaction>): Promise<TransactionWithAmount> => {
    const response = await apiClient.post<ApiResponse<TransactionWithAmount>>(
      '/transactions',
      data
    );
    return response.data.data!;
  },

  /**
   * Get all transactions with optional filters
   */
  getAll: async (filters?: TransactionFilters): Promise<TransactionWithAmount[]> => {
    const response = await apiClient.get<ApiResponse<TransactionWithAmount[]>>(
      '/transactions',
      { params: filters }
    );
    return response.data.data!;
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: string): Promise<TransactionWithAmount> => {
    const response = await apiClient.get<ApiResponse<TransactionWithAmount>>(
      `/transactions/${id}`
    );
    return response.data.data!;
  },

  /**
   * Update transaction
   */
  update: async (
    id: string,
    data: Partial<Transaction>
  ): Promise<TransactionWithAmount> => {
    const response = await apiClient.put<ApiResponse<TransactionWithAmount>>(
      `/transactions/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete transaction
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};
