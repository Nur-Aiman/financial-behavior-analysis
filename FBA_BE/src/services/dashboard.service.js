/**
 * Dashboard Service
 * Provides aggregated data for dashboard display
 */

import { TransactionType } from '../models/index.js';
import { financialProfileService } from './financial-profile.service.js';
import { categoryService } from './category.service.js';
import { transactionService } from './transaction.service.js';

export const dashboardService = {
  /**
   * Get dashboard summary
   */
  getDashboardSummary() {
    const profile = financialProfileService.getProfile();
    const allTransactions = transactionService.getAllTransactions();
    const categories = categoryService.getActive();

    const expenses = allTransactions.filter(t => t.type === 'EXPENSE');
    const totalSpent = expenses.reduce((sum, e) => sum + e.amountCents, 0);

    const fixedExpenseCategories = categories.filter(c => c.active && c.type === 'FIXED_ONE_TIME');
    const reservedFixedExpensesCents = fixedExpenseCategories.reduce((sum, c) => sum + (c.allocatedAmountCents || 0), 0);

    const protectedCategories = categories.filter(c => c.active && c.protected);
    const protectedUsageAllocationCents = protectedCategories.reduce((sum, c) => sum + (c.allocatedAmountCents || 0), 0);

    const today = new Date();
    const nextPayday = new Date(profile.nextPayday);
    const remainingDays = Math.ceil((nextPayday - today) / (1000 * 60 * 60 * 24));

    // Use effective balance for calculations
    const effectiveBalance = profile.useCalculatedBalance 
      ? (profile.expectedSalaryCents || 0) - totalSpent
      : profile.currentBalanceCents;
    
    const dailySpendingPool = effectiveBalance - reservedFixedExpensesCents - protectedUsageAllocationCents;
    const safelyAvailableBalance = Math.max(0, dailySpendingPool);
    const recommendedSpendingToday = Math.max(0, Math.floor(safelyAvailableBalance / Math.max(remainingDays, 1)));

    // Determine status based on safely available balance
    let status = 'SAFE';
    if (safelyAvailableBalance <= 0) {
      status = 'EXCEEDED';
    } else if (safelyAvailableBalance < (reservedFixedExpensesCents * 0.2)) {
      status = 'AT_RISK';
    } else if (safelyAvailableBalance < (reservedFixedExpensesCents * 0.5)) {
      status = 'CAUTION';
    }

    return {
      currentBalanceCents: profile.currentBalanceCents,
      effectiveBalanceCents: effectiveBalance,
      expectedSalaryCents: profile.expectedSalaryCents,
      nextPayday: profile.nextPayday,
      totalCategories: categories.filter(c => c.active).length,
      activeTransactionsCount: allTransactions.length,
      reservedFixedExpensesCents,
      protectedUsageAllocationCents,
      safelyAvailableBalanceCents: safelyAvailableBalance,
      recommendedSpendingTodayCents: recommendedSpendingToday,
      projectedBalanceOnPaydayCents: effectiveBalance + profile.expectedSalaryCents,
      remainingDays,
      status,
      warningCount: 0,
    };
  },

  /**
   * Get category utilisation data
   */
  getCategoryUtilisation() {
    const categories = categoryService.getActive();

    return categories.map((category) => {
      const spent = categoryService.getSpendingTotal(category.id);
      const remaining = categoryService.getRemainingAllocation(category.id);
      const utilisation = categoryService.getUtilisationPercentage(category.id);

      return {
        ...category,
        spentAmountCents: spent,
        remainingAmountCents: remaining,
        utilisationPercent: utilisation,
      };
    });
  },

  /**
   * Get spending trends
   */
  getSpendingTrends() {
    const transactions = transactionService.getAllTransactions();
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

    return {
      totalExpenses: expenses.length,
      totalSpentCents: expenses.reduce((sum, t) => sum + t.amountCents, 0),
      byCategory: this._groupByCategory(expenses),
    };
  },

  /**
   * Get spending trend (alias for getSpendingTrends)
   */
  getSpendingTrend() {
    const trends = this.getSpendingTrends();
    return [{
      totalSpentCents: trends.totalSpentCents,
      byCategory: trends.byCategory,
    }];
  },

  /**
   * Get planned vs actual
   */
  getPlannedVsActual() {
    const categories = categoryService.getActive();
    return categories.map((cat) => {
      const spent = categoryService.getSpendingTotal(cat.id);
      return {
        category: cat.name,
        plannedAmountCents: cat.allocatedAmountCents,
        actualAmountCents: spent,
        varianceCents: cat.allocatedAmountCents - spent,
      };
    });
  },

  /**
   * Get projected balances
   */
  getProjectedBalances() {
    const profile = financialProfileService.getProfile();
    if (!profile) {
      return [];
    }

    const today = new Date();
    const nextPayday = new Date(profile.nextPayday);
    const daysUntilPayday = Math.ceil((nextPayday - today) / (1000 * 60 * 60 * 24));

    const projections = [];
    let currentBalance = profile.currentBalanceCents;

    for (let i = 0; i <= daysUntilPayday; i++) {
      projections.push({
        day: i,
        date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        balanceCents: currentBalance,
      });
    }

    return projections;
  },

  /**
   * Group expenses by category
   */
  _groupByCategory(transactions) {
    const grouped = {};
    transactions.forEach((t) => {
      const catId = t.categoryId || 'uncategorized';
      if (!grouped[catId]) {
        grouped[catId] = 0;
      }
      grouped[catId] += t.amountCents;
    });
    return grouped;
  },
};
