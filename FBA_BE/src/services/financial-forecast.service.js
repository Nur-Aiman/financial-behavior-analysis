/**
 * Financial Forecast Service
 * Provides financial forecasts and projections
 */

import { categoryService } from './category.service.js';
import { transactionService } from './transaction.service.js';

export const financialForecastService = {
  /**
   * Calculate detailed forecast
   */
  calculateForecast(profile) {
    if (!profile) {
      return {
        currentBalanceCents: 0,
        reservedFixedExpensesCents: 0,
        protectedUsageAllocationCents: 0,
        dailySpendingPoolCents: 0,
        safelyAvailableBalanceCents: 0,
        recommendedTotalSpendingTodayCents: 0,
        projectedBalanceOnPaydayCents: 0,
        remainingDays: 0,
        nextPayday: new Date().toISOString(),
        dailyForecasts: [],
      };
    }

    const today = new Date();
    const nextPayday = new Date(profile.nextPayday);
    const remainingDays = Math.ceil((nextPayday - today) / (1000 * 60 * 60 * 24));

    const categories = categoryService.getActive();
    
    // Calculate total fixed expense allocations
    const reservedFixedExpensesCents = categories
      .filter(c => c.type === 'FIXED_ONE_TIME')
      .reduce((sum, c) => sum + (c.allocatedAmountCents || 0), 0);
    
    // Calculate protected usage allocations
    const protectedUsageAllocationCents = categories
      .filter(c => c.protected)
      .reduce((sum, c) => sum + (c.allocatedAmountCents || 0), 0);

    const dailySpendingPoolCents = profile.currentBalanceCents - reservedFixedExpensesCents - protectedUsageAllocationCents;
    const safelyAvailableBalanceCents = Math.max(0, dailySpendingPoolCents);
    const recommendedTotalSpendingTodayCents = Math.max(0, Math.floor(dailySpendingPoolCents / Math.max(remainingDays, 1)));

    // Create daily forecasts for each active category
    const dailyForecasts = categories.map(cat => {
      const spent = categoryService.getSpendingTotal(cat.id);
      const remaining = categoryService.getRemainingAllocation(cat.id);
      
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        preferredDailyAmountCents: cat.preferredDailyAmountCents || 0,
        recommendedDailyAmountCents: Math.floor((cat.allocatedAmountCents || 0) / Math.max(remainingDays, 1)),
        actualSpentTodayCents: spent,
        remainingCategoryAllocationCents: remaining,
      };
    });

    return {
      currentBalanceCents: profile.currentBalanceCents,
      reservedFixedExpensesCents,
      protectedUsageAllocationCents,
      dailySpendingPoolCents,
      safelyAvailableBalanceCents,
      recommendedTotalSpendingTodayCents,
      projectedBalanceOnPaydayCents: profile.currentBalanceCents + profile.expectedSalaryCents,
      remainingDays,
      nextPayday: profile.nextPayday,
      dailyForecasts,
    };
  },
};
