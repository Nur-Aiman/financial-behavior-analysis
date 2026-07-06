/**
 * Dashboard Page
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDashboard, useForecast, useCategories, useProfile, useTransactions } from '../hooks';
import { formatCurrency, formatDate } from '../utils';

function Dashboard(): React.ReactElement {
  const { summary, utilisation, spendingTrend, projectedBalances, loading, error } = useDashboard();
  const { forecast } = useForecast();
  const { categories } = useCategories();
  const { profile } = useProfile();
  const { transactions } = useTransactions();

  // Calculate effective balance based on user preference
  const calculateEffectiveBalance = () => {
    if (!profile) return { currentBalance: 0, calculatedBalance: 0, effectiveBalance: 0 };
    
    const totalExpenses = transactions
      ?.filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amountCents, 0) || 0;
    const calculatedBalance = (profile.expectedSalaryCents || 0) - totalExpenses;
    const currentBalance = profile.currentBalanceCents || 0;
    
    return {
      currentBalance,
      calculatedBalance,
      effectiveBalance: profile.useCalculatedBalance ? calculatedBalance : currentBalance,
    };
  };

  const balance = calculateEffectiveBalance();

  // Calculate daily food spending allowance
  const calculateDailyFoodAllowance = () => {
    const foodCategory = categories.find(c => c.active && (c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('husby')));
    if (!foodCategory || !summary) return null;

    const baseDailyAllowance = foodCategory.allocatedAmountCents / 30;
    
    // Calculate remaining balance excluding food category
    const otherCategoriesRemaining = categories
      .filter(c => c.active && c.id !== foodCategory.id)
      .reduce((sum, c) => sum + (((c as any).remaining || 0) || 0), 0);
    
    const availableAfterOthers = balance.effectiveBalance - otherCategoriesRemaining;
    
    // If available balance after other categories is > RM600, can spend more
    if (availableAfterOthers > 60000) {
      const excessAmount = availableAfterOthers - 60000;
      const additionalDailyAllowance = excessAmount / 30;
      return {
        baseAllowance: baseDailyAllowance,
        additionalAllowance: additionalDailyAllowance,
        totalAllowance: baseDailyAllowance + additionalDailyAllowance,
        hasExcess: true,
      };
    }

    return {
      baseAllowance: baseDailyAllowance,
      additionalAllowance: 0,
      totalAllowance: baseDailyAllowance,
      hasExcess: false,
    };
  };

  const dailyFoodAllowance = calculateDailyFoodAllowance();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        Dashboard
      </Typography>

      {/* Status Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        {/* Current/Calculated Balance (Effective) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                {profile?.useCalculatedBalance ? 'Calculated Balance' : 'Current Balance'}
              </Typography>
              <Typography 
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
              >
                {formatCurrency(balance.effectiveBalance)}
              </Typography>
              <Chip
                label={`Status: ${summary?.status || 'UNKNOWN'}`}
                color={summary?.status === 'SAFE' ? 'success' : summary?.status === 'EXCEEDED' ? 'error' : 'warning'}
                size="small"
                sx={{ mt: 1, fontSize: '0.75rem' }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: profile?.useCalculatedBalance ? '#4caf50' : '#999' }}>
                {profile?.useCalculatedBalance ? '(Salary - Expenses)' : '(User Input)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Projected Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Projected on Payday
              </Typography>
              <Typography 
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
              >
                {formatCurrency(balance.effectiveBalance + (profile?.expectedSalaryCents || 0))}
              </Typography>
              <Typography 
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {summary?.nextPayday ? formatDate(summary.nextPayday) : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available for Spending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Safely Available
              </Typography>
              <Typography 
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
              >
                {formatCurrency(Math.max(0, balance.effectiveBalance - (summary?.reservedFixedExpensesCents || 0) - (summary?.protectedUsageAllocationCents || 0)))}
              </Typography>
              <Typography 
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                After fixed obligations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Remaining Days */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Days Until Payday
              </Typography>
              <Typography 
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
              >
                {summary?.remainingDays || '—'}
              </Typography>
              <Typography 
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Recommended spend today:{' '}
                {summary?.recommendedSpendingTodayCents ? formatCurrency(summary.recommendedSpendingTodayCents) : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Warnings */}
      {forecast?.warnings && forecast.warnings.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Alerts ({forecast.warnings.length})
          </Typography>
          {forecast.warnings.slice(0, 3).map((warning, idx) => (
            <Alert key={idx} severity={warning.level === 'CRITICAL' ? 'error' : 'warning'} sx={{ mb: 1 }}>
              {warning.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Daily Food Spending Allowance */}
      {dailyFoodAllowance && (
        <Card sx={{ mb: 3, backgroundColor: '#e3f2fd' }}>
          <CardContent sx={{ '@media (max-width:600px)': { p: 2 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
              📌 Daily Food Allowance Today
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
                    Base Daily Allowance
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {formatCurrency(dailyFoodAllowance.baseAllowance)}
                  </Typography>
                </Box>
              </Grid>
              {dailyFoodAllowance.hasExcess && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    border: '2px solid #4caf50'
                  }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Additional (Excess Balance)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      + {formatCurrency(dailyFoodAllowance.additionalAllowance)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#fff',
                  borderRadius: 1,
                  border: '3px solid #1976d2'
                }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Total You Can Spend Today on Food
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mt: 1 }}>
                    {formatCurrency(dailyFoodAllowance.totalAllowance)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Category Utilisation */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                variant="h6" 
                sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
              >
                Category Utilisation
              </Typography>
              {utilisation && utilisation.length > 0 && (
                <ResponsiveContainer width="100%" height={utilisation.length > 5 ? 400 : 250}>
                  <BarChart data={utilisation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="categoryName"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="utilisationPercentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Projected Balance Trend */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                variant="h6" 
                sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
              >
                Projected Balance Trend
              </Typography>
              {projectedBalances && projectedBalances.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={projectedBalances}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                variant="h6" 
                sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
              >
                Spending Trend (30 days)
              </Typography>
              {spendingTrend && spendingTrend.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={Math.floor(spendingTrend.length / 6)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalSpent" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
