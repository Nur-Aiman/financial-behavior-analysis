/**
 * Hook for Balance Management
 */

import { useState, useEffect } from 'react';
import { BalanceAdjustment } from '../types';
import { balanceAPI, BalanceResponse } from '../api';

export function useBalance() {
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [history, setHistory] = useState<BalanceAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await balanceAPI.getBalance();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await balanceAPI.getHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const updateBalance = async (newBalanceCents: number, reason: string) => {
    try {
      const result = await balanceAPI.updateBalance(newBalanceCents, reason);
      setBalance({
        currentBalanceCents: result.adjustment.newBalanceCents,
        currentBalance: result.newBalance,
      });
      await fetchHistory();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return { balance, history, loading, error, updateBalance, refetch: fetchBalance };
}
