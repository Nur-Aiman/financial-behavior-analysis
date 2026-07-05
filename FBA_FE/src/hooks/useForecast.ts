/**
 * Hook for Forecast Data
 */

import { useState, useEffect } from 'react';
import { FinancialForecast, DailyForecast } from '../types';
import { forecastAPI, ProjectedBalance } from '../api';

export function useForecast() {
  const [forecast, setForecast] = useState<FinancialForecast | null>(null);
  const [categories, setCategories] = useState<DailyForecast[]>([]);
  const [projectedBalance, setProjectedBalance] = useState<ProjectedBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const [forecastData, categoriesData, projectedData] = await Promise.all([
        forecastAPI.getToday(),
        forecastAPI.getCategories(),
        forecastAPI.getProjectedBalance(),
      ]);
      setForecast(forecastData);
      setCategories(categoriesData);
      setProjectedBalance(projectedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const recalculate = async () => {
    try {
      const newForecast = await forecastAPI.recalculate();
      setForecast(newForecast);
      return newForecast;
    } catch (err) {
      throw err;
    }
  };

  return { forecast, categories, projectedBalance, loading, error, recalculate, refetch: fetchForecast };
}
