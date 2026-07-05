/**
 * Financial Forecast Service
 * 
 * Core forecasting engine that calculates:
 * - Remaining days until payday
 * - Reserved amounts for fixed expenses and protected allocations
 * - Safe daily spending recommendations
 * - Projected balance on payday
 * - Financial warnings
 * 
 * Implements the algorithm defined in FORECASTING_ALGORITHM.md
 */

import {
  FinancialProfile,
  SpendingCategory,
  SpendingCategoryType,
  Transaction,
  TransactionType,
  FixedExpensePayment,
  FixedExpensePaymentStatus,
  FinancialForecast,
  DailyForecast,
  Warning,
  WarningLevel,
  ForecastStatus,
} from '../models/index';
import { categoryRepository } from '../repositories/category.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { fixedExpenseRepository } from '../repositories/fixed-expense.repository';
import {
  calculateRemainingDays,
  getTodayIsoString,
  formatDateForDisplay,
} from '../utils/date.utils';
import {
  divideCents,
  addCents,
  subtractCents,
  multiplyCents,
  centsAsPercentage,
  ensureNonNegative,
  formatCentsAsRinggit,
} from '../utils/money.utils';
import { AppError } from '../errors/app-error';

export class FinancialForecastService {
  /**
   * Calculate complete financial forecast
   */
  calculateForecast(profile: FinancialProfile): FinancialForecast {
    const today = getTodayIsoString();
    const warnings: Warning[] = [];

    // Step 1: Validate prerequisites
    if (!profile) {
      throw new AppError({
        code: 'PROFILE_NOT_FOUND',
        message: 'No financial profile configured',
        statusCode: 400,
      });
    }

    if (!profile.nextPayday) {
      throw new AppError({
        code: 'PAYDAY_NOT_SET',
        message: 'Payday not configured',
        statusCode: 400,
      });
    }

    const remainingDays = calculateRemainingDays(today, profile.nextPayday);

    if (remainingDays < 1) {
      warnings.push(this.createWarning(
        'CRITICAL',
        'PAYDAY_PASSED',
        `Payday (${formatDateForDisplay(profile.nextPayday)}) has already passed. Please configure your next salary cycle.`
      ));
      // Return minimal forecast
      return this.createFailureForecast(today, profile, warnings);
    }

    // Step 2: Get all relevant data
    const allCategories = categoryRepository.findActive();
    const allTransactions = transactionRepository.findAll();
    const allFixedPayments = fixedExpenseRepository.findAll();

    // Step 3: Calculate category spending totals
    const categorySpending = this.calculateCategorySpending(allTransactions);

    // Step 4: Calculate reserved fixed expenses (unpaid only)
    const reservedFixedExpensesCents = this.calculateReservedFixedExpenses(allFixedPayments);

    // Step 5: Calculate protected usage-based allocations
    const protectedUsageAllocationCents = this.calculateProtectedUsageAllocation(
      allCategories,
      categorySpending
    );

    // Step 6: Calculate daily spending pool
    let dailySpendingPoolCents = subtractCents(
      subtractCents(profile.currentBalanceCents, reservedFixedExpensesCents),
      protectedUsageAllocationCents
    );

    dailySpendingPoolCents = ensureNonNegative(dailySpendingPoolCents);

    // Generate critical warnings
    if (profile.currentBalanceCents < reservedFixedExpensesCents) {
      warnings.push(this.createWarning(
        'CRITICAL',
        'INSUFFICIENT_BALANCE',
        `Current balance (${formatCentsAsRinggit(profile.currentBalanceCents)}) is less than reserved fixed expenses (${formatCentsAsRinggit(reservedFixedExpensesCents)})`
      ));
    }

    if (
      profile.currentBalanceCents <
      addCents(reservedFixedExpensesCents, protectedUsageAllocationCents)
    ) {
      warnings.push(this.createWarning(
        'CRITICAL',
        'INSUFFICIENT_FOR_COMMITMENTS',
        'Current balance is insufficient to cover all commitments'
      ));
    }

    if (dailySpendingPoolCents <= 0) {
      warnings.push(this.createWarning(
        'CRITICAL',
        'NO_SAFE_SPENDING_AVAILABLE',
        'No safe amount available for spending today'
      ));
    }

    // Step 7: Calculate daily category recommendations
    const dailyCategories = categoryRepository.findActiveByType(
      SpendingCategoryType.DAILY_TIME_BASED
    );
    const dailyForecasts = this.calculateDailyForecasts(
      dailyCategories,
      categorySpending,
      dailySpendingPoolCents,
      remainingDays,
      today
    );

    // Step 8: Generate category-level warnings
    for (const category of allCategories) {
      const spent = categorySpending[category.id] || 0;
      const utilisationPercent = centsAsPercentage(spent, category.allocatedAmountCents);

      if (utilisationPercent > 100) {
        warnings.push(this.createWarning(
          'WARNING',
          'ALLOCATION_EXCEEDED',
          `${category.name} allocation exceeded`,
          { categoryId: category.id, spent, allocated: category.allocatedAmountCents }
        ));
      } else if (utilisationPercent >= 80) {
        warnings.push(this.createWarning(
          'WARNING',
          'ALLOCATION_AT_80_PERCENT',
          `${category.name} allocation is at 80% utilisation`,
          { categoryId: category.id, utilisationPercent }
        ));
      }
    }

    // Step 9: Generate fixed expense warnings
    for (const payment of allFixedPayments) {
      if (payment.status === FixedExpensePaymentStatus.UNPAID) {
        const daysUntilDue = calculateRemainingDays(today, payment.dueDate);

        if (daysUntilDue <= 0) {
          const category = categoryRepository.findById(payment.categoryId);
          warnings.push(this.createWarning(
            'WARNING',
            'BILL_OVERDUE',
            `${category?.name || 'Bill'} due on ${formatDateForDisplay(payment.dueDate)} is overdue`,
            { categoryId: payment.categoryId }
          ));
        } else if (daysUntilDue <= 3) {
          const category = categoryRepository.findById(payment.categoryId);
          warnings.push(this.createWarning(
            'INFO',
            'BILL_APPROACHING',
            `${category?.name || 'Bill'} is due on ${formatDateForDisplay(payment.dueDate)} (${daysUntilDue} days)`,
            { categoryId: payment.categoryId, daysUntilDue }
          ));
        }
      }
    }

    // Step 10: Calculate recommended total spending
    const recommendedTotalSpendingTodayCents = dailyForecasts.reduce(
      (sum, forecast) => addCents(sum, forecast.recommendedDailyAmountCents),
      0
    );

    // Step 11: Calculate projected balance on payday
    const projectedBalanceOnPaydayCents = this.calculateProjectedBalance(
      profile,
      dailyForecasts,
      reservedFixedExpensesCents,
      remainingDays
    );

    if (projectedBalanceOnPaydayCents < 0) {
      warnings.push(this.createWarning(
        'CRITICAL',
        'PROJECTED_NEGATIVE_BALANCE',
        `Projected balance on payday (${formatCentsAsRinggit(projectedBalanceOnPaydayCents)}) will be negative`,
        { projectedBalance: projectedBalanceOnPaydayCents }
      ));
    }

    return {
      forecastDate: today,
      currentBalanceCents: profile.currentBalanceCents,
      remainingDays,
      nextPayday: profile.nextPayday,
      reservedFixedExpensesCents,
      protectedUsageAllocationCents,
      dailySpendingPoolCents,
      safelyAvailableBalanceCents: dailySpendingPoolCents,
      recommendedTotalSpendingTodayCents,
      projectedBalanceOnPaydayCents,
      dailyForecasts,
      warnings,
    };
  }

  /**
   * Calculate spending by category
   */
  private calculateCategorySpending(transactions: Transaction[]): Record<string, number> {
    const spending: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.EXPENSE && transaction.categoryId) {
        spending[transaction.categoryId] = (spending[transaction.categoryId] || 0) +
          transaction.amountCents;
      }
    }

    return spending;
  }

  /**
   * Calculate reserved fixed expenses (unpaid only)
   */
  private calculateReservedFixedExpenses(payments: FixedExpensePayment[]): number {
    let total = 0;

    for (const payment of payments) {
      if (payment.status === FixedExpensePaymentStatus.UNPAID) {
        total = addCents(total, payment.expectedAmountCents);
      }
    }

    return total;
  }

  /**
   * Calculate protected usage-based allocations
   */
  private calculateProtectedUsageAllocation(
    categories: SpendingCategory[],
    categorySpending: Record<string, number>
  ): number {
    let total = 0;

    for (const category of categories) {
      if (
        category.type === SpendingCategoryType.USAGE_BASED &&
        category.protected === true &&
        category.active
      ) {
        const spent = categorySpending[category.id] || 0;
        const remaining = subtractCents(category.allocatedAmountCents, spent);
        total = addCents(total, ensureNonNegative(remaining));
      }
    }

    return total;
  }

  /**
   * Calculate daily forecasts for all daily categories
   */
  private calculateDailyForecasts(
    dailyCategories: SpendingCategory[],
    categorySpending: Record<string, number>,
    dailySpendingPoolCents: number,
    remainingDays: number,
    today: string
  ): DailyForecast[] {
    const forecasts: DailyForecast[] = [];

    if (dailyCategories.length === 0) {
      return forecasts;
    }

    // Calculate total remaining daily allocations
    let totalRemainingDailyAllocations = 0;
    for (const category of dailyCategories) {
      const spent = categorySpending[category.id] || 0;
      const remaining = subtractCents(category.allocatedAmountCents, spent);
      totalRemainingDailyAllocations = addCents(
        totalRemainingDailyAllocations,
        ensureNonNegative(remaining)
      );
    }

    // Calculate forecast for each daily category
    for (const category of dailyCategories) {
      const spent = categorySpending[category.id] || 0;
      const categoryRemaining = subtractCents(category.allocatedAmountCents, spent);
      const preferredAmount = category.preferredDailyAmountCents || 0;

      // Calculate category weight
      const categoryWeight =
        totalRemainingDailyAllocations > 0
          ? categoryRemaining / totalRemainingDailyAllocations
          : 1 / dailyCategories.length;

      // Available pool for this category
      const categoryAvailablePool = Math.floor(
        dailySpendingPoolCents * categoryWeight
      );
      const maxSafeDailyAmount =
        remainingDays > 0 ? divideCents(categoryAvailablePool, remainingDays) : 0;

      // Determine recommendation
      let recommendedAmount: number;
      let status: ForecastStatus;

      if (categoryRemaining <= 0) {
        recommendedAmount = 0;
        status = 'EXCEEDED';
      } else if (categoryRemaining < preferredAmount) {
        recommendedAmount =
          remainingDays > 0 ? divideCents(categoryRemaining, remainingDays) : 0;
        status = 'CAUTION';
      } else {
        const preferredRemaining = multiplyCents(preferredAmount, remainingDays);

        if (preferredRemaining > categoryAvailablePool) {
          recommendedAmount = maxSafeDailyAmount;
          const reduction = subtractCents(preferredAmount, recommendedAmount);
          status =
            reduction > multiplyCents(preferredAmount, 0.5) ? 'AT_RISK' : 'CAUTION';
        } else {
          recommendedAmount = preferredAmount;
          status = 'SAFE';
        }
      }

      // Calculate today's actual spending
      const todayTransactions = transactionRepository
        .findByCategory(category.id)
        .filter(t => t.transactionDate === today && t.type === TransactionType.EXPENSE);

      const actualSpentToday = todayTransactions.reduce(
        (sum, t) => addCents(sum, t.amountCents),
        0
      );

      // Generate explanation
      const explanation = this.generateExplanation(
        category,
        recommendedAmount,
        preferredAmount,
        categoryRemaining,
        remainingDays,
        status
      );

      forecasts.push({
        categoryId: category.id,
        categoryName: category.name,
        forecastDate: today,
        remainingDays,
        preferredDailyAmountCents: preferredAmount,
        recommendedDailyAmountCents: recommendedAmount,
        actualSpentTodayCents: actualSpentToday,
        remainingCategoryAllocationCents: categoryRemaining,
        explanation,
        status,
      });
    }

    return forecasts;
  }

  /**
   * Calculate projected balance on payday
   */
  private calculateProjectedBalance(
    profile: FinancialProfile,
    dailyForecasts: DailyForecast[],
    reservedFixedExpensesCents: number,
    remainingDays: number
  ): number {
    let projected = profile.currentBalanceCents;

    // Deduct unpaid fixed expenses
    projected = subtractCents(projected, reservedFixedExpensesCents);

    // Deduct projected daily spending
    for (const forecast of dailyForecasts) {
      const projectedSpending = multiplyCents(
        forecast.recommendedDailyAmountCents,
        remainingDays
      );
      const deduction = Math.min(
        projectedSpending,
        forecast.remainingCategoryAllocationCents
      );
      projected = subtractCents(projected, deduction);
    }

    // Add salary
    projected = addCents(projected, profile.expectedSalaryCents);

    return projected;
  }

  /**
   * Generate explanation for a daily forecast
   */
  private generateExplanation(
    category: SpendingCategory,
    recommendedAmount: number,
    preferredAmount: number,
    categoryRemaining: number,
    remainingDays: number,
    status: ForecastStatus
  ): string {
    if (recommendedAmount <= 0) {
      return `Your allocation for ${category.name} is fully used. No spending is recommended until next payday.`;
    }

    if (status === 'EXCEEDED') {
      return `Your ${category.name} allocation has been exceeded. No further spending is recommended.`;
    }

    if (categoryRemaining < preferredAmount) {
      const spent = subtractCents(category.allocatedAmountCents, categoryRemaining);
      const percentUsed = centsAsPercentage(spent, category.allocatedAmountCents);
      return `Your preferred ${category.name} budget is ${formatCentsAsRinggit(preferredAmount)} per day, but you've used ${percentUsed.toFixed(1)}% of your allocation. Your safe daily amount for the remaining ${remainingDays} days is ${formatCentsAsRinggit(recommendedAmount)}.`;
    }

    if (recommendedAmount < preferredAmount) {
      const shortfall = subtractCents(preferredAmount, recommendedAmount);
      return `Your preferred daily ${category.name} budget is ${formatCentsAsRinggit(preferredAmount)}. However, considering your current available balance and reserved expenses, your maximum safe spending today is ${formatCentsAsRinggit(recommendedAmount)} (${formatCentsAsRinggit(shortfall)} less than preferred).`;
    }

    return `Your preferred daily ${category.name} budget of ${formatCentsAsRinggit(preferredAmount)} is fully supported by your current balance over ${remainingDays} remaining days until payday.`;
  }

  /**
   * Create warning object
   */
  private createWarning(
    level: WarningLevel,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): Warning {
    return {
      level,
      code,
      message,
      details,
    };
  }

  /**
   * Create failure forecast when payday has passed
   */
  private createFailureForecast(
    today: string,
    profile: FinancialProfile,
    warnings: Warning[]
  ): FinancialForecast {
    return {
      forecastDate: today,
      currentBalanceCents: profile.currentBalanceCents,
      remainingDays: 0,
      nextPayday: profile.nextPayday,
      reservedFixedExpensesCents: 0,
      protectedUsageAllocationCents: 0,
      dailySpendingPoolCents: 0,
      safelyAvailableBalanceCents: 0,
      recommendedTotalSpendingTodayCents: 0,
      projectedBalanceOnPaydayCents: profile.currentBalanceCents,
      dailyForecasts: [],
      warnings,
    };
  }
}

export const financialForecastService = new FinancialForecastService();
