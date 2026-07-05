/**
 * Custom Hooks for API Data Fetching
 */

import { useState, useEffect } from 'react';
import { FinancialProfile } from '../types';
import { profileAPI } from '../api';

export function useProfile() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileAPI.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (data: Partial<FinancialProfile>) => {
    try {
      const updated = await profileAPI.update(data);
      setProfile(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const createProfile = async (data: Partial<FinancialProfile>) => {
    try {
      const created = await profileAPI.create(data);
      setProfile(created);
      return created;
    } catch (err) {
      throw err;
    }
  };

  return { profile, loading, error, updateProfile, createProfile, refetch: fetchProfile };
}
