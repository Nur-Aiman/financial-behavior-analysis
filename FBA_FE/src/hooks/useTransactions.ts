/**
 * Hook for Transaction Management
 */

import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { transactionAPI, TransactionFilters, TransactionWithAmount } from '../api';

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<TransactionWithAmount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionAPI.getAll(filters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters?.categoryId, filters?.type, filters?.dateFrom, filters?.dateTo]);

  const createTransaction = async (data: Partial<Transaction>) => {
    try {
      const created = await transactionAPI.create(data);
      setTransactions([created, ...transactions]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      const updated = await transactionAPI.update(id, data);
      setTransactions(transactions.map(t => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionAPI.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
