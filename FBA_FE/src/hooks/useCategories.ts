/**
 * Hook for Category Management
 */

import { useState, useEffect } from 'react';
import { SpendingCategory } from '../types';
import { categoryAPI, CategoryFilters } from '../api';

export function useCategories(filters?: CategoryFilters) {
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryAPI.getAll(filters);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filters?.type, filters?.active]);

  const createCategory = async (data: Partial<SpendingCategory>) => {
    try {
      const created = await categoryAPI.create(data);
      // Fetch all categories to maintain sort order
      await fetchCategories();
      return created;
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<SpendingCategory>) => {
    try {
      const updated = await categoryAPI.update(id, data);
      // Fetch all categories to maintain sort order
      await fetchCategories();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const deactivateCategory = async (id: string) => {
    try {
      const updated = await categoryAPI.deactivate(id);
      // Fetch all categories to maintain sort order
      await fetchCategories();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
    refetch: fetchCategories,
  };
}
