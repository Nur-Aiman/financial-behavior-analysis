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
import { useDashboard, useForecast } from '../hooks';
import { formatCurrency, formatDate } from '../utils';

function Dashboard(): React.ReactElement {
  const { summary, utilisation, spendingTrend, projectedBalances, loading, error } = useDashboard();
  const { forecast } = useForecast();

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
        {/* Current Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '@media (max-width:600px)': { p: 1.5 } }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Current Balance
              </Typography>
              <Typography 
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
              >
                {summary?.currentBalanceCents ? formatCurrency(summary.currentBalanceCents) : '—'}
              </Typography>
              <Chip
                label={`Status: ${summary?.status || 'UNKNOWN'}`}
                color={summary?.status === 'SAFE' ? 'success' : summary?.status === 'EXCEEDED' ? 'error' : 'warning'}
                size="small"
                sx={{ mt: 1, fontSize: '0.75rem' }}
              />
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
                {summary?.projectedBalanceOnPaydayCents ? formatCurrency(summary.projectedBalanceOnPaydayCents) : '—'}
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
                {summary?.safelyAvailableBalanceCents ? formatCurrency(summary.safelyAvailableBalanceCents) : '—'}
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
