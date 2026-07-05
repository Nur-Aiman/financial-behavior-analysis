/**
 * Dashboard Service
 * 
 * Provides aggregated data for dashboard display
 */

import {
  DashboardSummary,
  CategoryUtilisation,
  SpendingTrend,
  PlannedVsActual,
} from '../models/index';
import { SpendingCategoryType } from '../models/index';
import { financialProfileService } from './financial-profile.service';
import { categoryService } from './category.service';
import { transactionService } from './transaction.service';
import { financialForecastService } from './financial-forecast.service';
import { getTodayIsoString, getDateNDaysAgo } from '../utils/date.utils';
import { centsAsPercentage } from '../utils/money.utils';

export class DashboardService {
  /**
   * Get dashboard summary
   */
  getDashboardSummary(): DashboardSummary {
    const profile = financialProfileService.getProfile();
    const forecast = financialForecastService.calculateForecast(profile);
    const allTransactions = transactionService.getAllTransactions();

    return {
      currentBalanceCents: profile.currentBalanceCents,
      reservedFixedExpensesCents: forecast.reservedFixedExpensesCents,
      protectedUsageAllocationCents: forecast.protectedUsageAllocationCents,
      safelyAvailableBalanceCents: forecast.safelyAvailableBalanceCents,
      remainingDays: forecast.remainingDays,
      nextPayday: profile.nextPayday,
      expectedSalaryCents: profile.expectedSalaryCents,
      recommendedSpendingTodayCents: forecast.recommendedTotalSpendingTodayCents,
      projectedBalanceOnPaydayCents: forecast.projectedBalanceOnPaydayCents,
      totalCategories: categoryService.getActive().length,
      activeTransactionsThisMonth: allTransactions.length,
    };
  }

  /**
   * Get category utilisation data
   */
  getCategoryUtilisation(): CategoryUtilisation[] {
    const categories = categoryService.getActive();

    return categories.map(category => {
      const spent = categoryService.getSpendingTotal(category.id);
      const remaining = categoryService.getRemainingAllocation(category.id);
      const utilisationPercent = categoryService.getUtilisationPercentage(category.id);

      // Determine status based on utilisation
      let status: 'SAFE' | 'CAUTION' | 'AT_RISK' | 'EXCEEDED';
      if (utilisationPercent > 100) {
        status = 'EXCEEDED';
      } else if (utilisationPercent >= 80) {
        status = 'AT_RISK';
      } else if (utilisationPercent >= 50) {
        status = 'CAUTION';
      } else {
        status = 'SAFE';
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        type: category.type,
        allocatedAmountCents: category.allocatedAmountCents,
        spentAmountCents: spent,
        remainingAmountCents: remaining,
        utilisationPercentage: utilisationPercent,
        status,
      };
    });
  }

  /**
   * Get spending trend (last 30 days)
   */
  getSpendingTrend(): SpendingTrend[] {
    const days = 30;
    const trends: SpendingTrend[] = [];
    const categories = categoryService.getActive();
    const transactions = transactionService.getAllTransactions();

    for (let i = days - 1; i >= 0; i--) {
      const dateStr = getDateNDaysAgo(i);
      const dayTransactions = transactions.filter(
        t => t.transactionDate === dateStr
      );

      const byCategory: Record<string, number> = {};
      let totalSpent = 0;

      for (const transaction of dayTransactions) {
        if (transaction.categoryId) {
          const category = categories.find(c => c.id === transaction.categoryId);
          if (category) {
            byCategory[category.name] = (byCategory[category.name] || 0) + transaction.amountCents;
            totalSpent += transaction.amountCents;
          }
        }
      }

      trends.push({
        date: dateStr,
        totalSpentCents: totalSpent,
        byCategory,
      });
    }

    return trends;
  }

  /**
   * Get planned vs actual spending
   */
  getPlannedVsActual(): PlannedVsActual[] {
    const profile = financialProfileService.getProfile();
    const forecast = financialForecastService.calculateForecast(profile);
    const dailyCategories = categoryService.getByType(SpendingCategoryType.DAILY_TIME_BASED);
    const today = getTodayIsoString();
    const startOfCycle = profile.salaryCycleStartDate;

    const result: PlannedVsActual[] = [];

    for (const dailyForecast of forecast.dailyForecasts) {
      const category = dailyCategories.find(c => c.id === dailyForecast.categoryId);
      if (!category) continue;

      // Calculate actual spending for the cycle so far
      const actualSpent = transactionService.getCategorySpendingByDateRange(
        category.id,
        startOfCycle,
        today
      );

      // Calculate planned spending (preferred daily × days so far)
      const { calculateRemainingDays } = require('../utils/date.utils');
      const daysSinceStart = calculateRemainingDays(startOfCycle, today);
      const plannedSpent = (category.preferredDailyAmountCents || 0) * daysSinceStart;

      const variance = actualSpent - plannedSpent;
      const variancePercent = plannedSpent > 0 ? centsAsPercentage(variance, plannedSpent) : 0;

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        plannedAmountCents: plannedSpent,
        actualAmountCents: actualSpent,
        varianceCents: variance,
        variancePercentage: variancePercent,
      });
    }

    return result;
  }

  /**
   * Get projected balance for remaining days
   */
  getProjectedBalances(): Array<{ date: string; balanceCents: number }> {
    const profile = financialProfileService.getProfile();
    const forecast = financialForecastService.calculateForecast(profile);
    const { getDateNDaysFromNow } = require('../utils/date.utils');

    const projections = [];
    let currentBalance = profile.currentBalanceCents;

    // Subtract reserved amounts first
    currentBalance -= forecast.reservedFixedExpensesCents;

    // Daily spending pool per day
    const dailyAverage =
      forecast.remainingDays > 0
        ? Math.floor(forecast.dailySpendingPoolCents / forecast.remainingDays)
        : 0;

    for (let i = 0; i <= forecast.remainingDays; i++) {
      const dateStr = getDateNDaysFromNow(i);
      projections.push({
        date: dateStr,
        balanceCents: Math.max(0, currentBalance - dailyAverage * i),
      });
    }

    // Add final balance with salary
    if (projections.length > 0) {
      projections[projections.length - 1].balanceCents +=
        profile.expectedSalaryCents;
    }

    return projections;
  }
}

export const dashboardService = new DashboardService();
