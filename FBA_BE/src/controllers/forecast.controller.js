/**
 * Forecast Controller
 */

import { Request, Response, NextFunction } from 'express';
import { financialProfileService } from '../services/financial-profile.service';
import { financialForecastService } from '../services/financial-forecast.service';
import { successResponse } from '../utils/response.utils';
import { formatCentsAsRinggit } from '../utils/money.utils';

export class ForecastController {
  /**
   * GET /api/forecast/today
   * Get today's forecast
   */
  static async getToday(_req, res, next): Promise<void> {
    try {
      const profile = financialProfileService.getProfile();
      const forecast = financialForecastService.calculateForecast(profile);

      const enriched = {
        ...forecast,
        currentBalance: formatCentsAsRinggit(forecast.currentBalanceCents),
        reservedFixedExpenses: formatCentsAsRinggit(forecast.reservedFixedExpensesCents),
        protectedUsageAllocation: formatCentsAsRinggit(forecast.protectedUsageAllocationCents),
        dailySpendingPool: formatCentsAsRinggit(forecast.dailySpendingPoolCents),
        safelyAvailableBalance: formatCentsAsRinggit(forecast.safelyAvailableBalanceCents),
        recommendedTotalSpending: formatCentsAsRinggit(forecast.recommendedTotalSpendingTodayCents),
        projectedBalanceOnPayday: formatCentsAsRinggit(forecast.projectedBalanceOnPaydayCents),
        dailyForecasts: forecast.dailyForecasts.map(df => ({
          ...df,
          preferredDailyAmount: formatCentsAsRinggit(df.preferredDailyAmountCents),
          recommendedDailyAmount: formatCentsAsRinggit(df.recommendedDailyAmountCents),
          actualSpentToday: formatCentsAsRinggit(df.actualSpentTodayCents),
          remainingCategoryAllocation: formatCentsAsRinggit(df.remainingCategoryAllocationCents),
        })),
      };

      res.json(successResponse(enriched, 'Today\'s forecast calculated'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/forecast/categories
   * Get forecast for all daily categories
   */
  static async getCategories(_req, res, next): Promise<void> {
    try {
      const profile = financialProfileService.getProfile();
      const forecast = financialForecastService.calculateForecast(profile);

      const enriched = forecast.dailyForecasts.map(df => ({
        ...df,
        preferredDailyAmount: formatCentsAsRinggit(df.preferredDailyAmountCents),
        recommendedDailyAmount: formatCentsAsRinggit(df.recommendedDailyAmountCents),
        actualSpentToday: formatCentsAsRinggit(df.actualSpentTodayCents),
        remainingCategoryAllocation: formatCentsAsRinggit(df.remainingCategoryAllocationCents),
      }));

      res.json(successResponse(enriched, 'Category forecasts retrieved'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/forecast/projected-balance
   * Get projected balance until payday
   */
  static async getProjectedBalance(_req, res, next): Promise<void> {
    try {
      const profile = financialProfileService.getProfile();
      const forecast = financialForecastService.calculateForecast(profile);

      const enriched = {
        currentBalance: formatCentsAsRinggit(forecast.currentBalanceCents),
        projectedBalanceOnPayday: formatCentsAsRinggit(forecast.projectedBalanceOnPaydayCents),
        remainingDays: forecast.remainingDays,
        nextPayday: forecast.nextPayday,
        expectedSalary: formatCentsAsRinggit(profile.expectedSalaryCents),
        balanceAfterSalary: formatCentsAsRinggit(
          forecast.projectedBalanceOnPaydayCents + profile.expectedSalaryCents
        ),
      };

      res.json(successResponse(enriched, 'Projected balance calculated'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/forecast/recalculate
   * Manually trigger forecast recalculation
   */
  static async recalculate(_req, res, next): Promise<void> {
    try {
      const profile = financialProfileService.getProfile();
      const forecast = financialForecastService.calculateForecast(profile);

      res.json(successResponse(forecast, 'Forecast recalculated'));
    } catch (err) {
      next(err);
    }
  }
}
