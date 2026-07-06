/**
 * Profile Page
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useProfile, useTransactions } from '../hooks';
import { FinancialProfile } from '../types';

// Helper to format date for input field (expects YYYY-MM-DD format)
const formatDateForInput = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  // If it's already in YYYY-MM-DD format, return as-is
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  // If it has time (ISO format), extract just the date part
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  return dateStr;
};

const formatCurrency = (cents: number): string => {
  return 'RM ' + (cents / 100).toFixed(2);
};

function ProfilePage(): React.ReactElement {
  const { profile, loading, error, updateProfile, createProfile } = useProfile();
  const { transactions } = useTransactions();
  const [formData, setFormData] = useState<Partial<FinancialProfile>>({
    currency: 'MYR',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculatedBalance, setCalculatedBalance] = useState<number>(0);

  // Calculate balance from transactions
  useEffect(() => {
    if (profile && transactions) {
      let balance = profile.openingBalanceCents || 0;
      transactions.forEach(tx => {
        if (tx.type === 'EXPENSE') {
          balance -= tx.amountCents;
        } else if (tx.type === 'INCOME') {
          balance += tx.amountCents;
        }
      });
      setCalculatedBalance(balance);
    }
  }, [profile, transactions]);

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<FinancialProfile>) => ({
      ...prev,
      [name]: name.includes('Cents') ? parseInt(value) * 100 || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      if (profile) {
        const updated = await updateProfile(formData);
        // Explicitly update formData with the new profile to ensure form displays updated values
        setFormData(updated);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        const created = await createProfile(formData);
        setFormData(created);
        setMessage({ type: 'success', text: 'Profile created successfully' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save profile',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {profile ? 'Edit Profile' : 'Create Profile'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <Card sx={{ maxWidth: { xs: '100%', sm: '600px' }, mx: { xs: 0, sm: 'auto' } }}>
        <CardContent sx={{ '@media (max-width:600px)': { p: 2 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Currency"
                  name="currency"
                  value={formData.currency || ''}
                  onChange={handleChange}
                  disabled
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Salary (RM)"
                  name="expectedSalaryCents"
                  type="number"
                  value={formData.expectedSalaryCents ? formData.expectedSalaryCents / 100 : ''}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Balance (RM)"
                  name="currentBalanceCents"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formData.currentBalanceCents ? formData.currentBalanceCents / 100 : ''}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Cycle Start Date"
                  name="salaryCycleStartDate"
                  type="date"
                  value={formatDateForInput(formData.salaryCycleStartDate as string)}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Next Payday"
                  name="nextPayday"
                  type="date"
                  value={formatDateForInput(formData.nextPayday as string)}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{ py: { xs: 1.25, sm: 1 } }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <>
          {/* Balance Comparison */}
          <Card sx={{ mt: 3, backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#6a1b9a' }}>
                💰 Balance Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    border: '2px solid #2196f3'
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Current Balance (User Input)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2196f3', mt: 0.5 }}>
                      {formatCurrency(profile.currentBalanceCents || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    border: `2px solid ${calculatedBalance === (profile.currentBalanceCents || 0) ? '#4caf50' : '#ff9800'}`
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Calculated Balance (From Transactions)
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 600, 
                        color: calculatedBalance === (profile.currentBalanceCents || 0) ? '#4caf50' : '#ff9800',
                        mt: 0.5 
                      }}
                    >
                      {formatCurrency(calculatedBalance)}
                    </Typography>
                  </Box>
                </Grid>
                {calculatedBalance !== (profile.currentBalanceCents || 0) && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      Balances don't match! Difference: {formatCurrency(Math.abs(calculatedBalance - (profile.currentBalanceCents || 0)))}
                      {calculatedBalance > (profile.currentBalanceCents || 0) 
                        ? ' (Calculated is higher)' 
                        : ' (User input is higher)'}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Information
              </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Profile ID
                </Typography>
                <Typography>{profile.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Created
                </Typography>
                <Typography>{new Date(profile.createdAt).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography>{new Date(profile.updatedAt).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Status
                </Typography>
                <Typography>{profile.active ? 'Active' : 'Inactive'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        </>
      )}
    </Box>
  );
}

export default ProfilePage;
