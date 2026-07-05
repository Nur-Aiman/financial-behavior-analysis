/**
 * Hook for Dashboard Data
 */

import { useState, useEffect } from 'react';
import { DashboardSummary, CategoryUtilisation } from '../types';
import { dashboardAPI, SpendingTrendItem, PlannedVsActualItem, ProjectedBalanceItem } from '../api';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [utilisation, setUtilisation] = useState<CategoryUtilisation[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrendItem[]>([]);
  const [plannedVsActual, setPlannedVsActual] = useState<PlannedVsActualItem[]>([]);
  const [projectedBalances, setProjectedBalances] = useState<ProjectedBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, utilisationData, trendData, plannedData, projectedData] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getCategoryUtilisation(),
        dashboardAPI.getSpendingTrend(),
        dashboardAPI.getPlannedVsActual(),
        dashboardAPI.getProjectedBalances(),
      ]);
      setSummary(summaryData);
      setUtilisation(utilisationData);
      setSpendingTrend(trendData);
      setPlannedVsActual(plannedData);
      setProjectedBalances(projectedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    summary,
    utilisation,
    spendingTrend,
    plannedVsActual,
    projectedBalances,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
