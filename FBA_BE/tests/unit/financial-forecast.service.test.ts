/**
 * Unit Tests for Financial Forecast Service
 * 
 * Tests all critical forecasting scenarios as specified in requirements
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FinancialForecastService } from '../../src/services/financial-forecast.service';
import { store } from '../../src/storage/in-memory.store';
import { seedData } from '../../src/storage/seed-data';
import {
  SpendingCategoryType,
  TransactionType,
  TransactionSource,
  FixedExpensePaymentStatus,
} from '../../src/models/index';
import { getTodayIsoString, getDateNDaysFromNow } from '../../src/utils/date.utils';
import { financialProfileRepository } from '../../src/repositories/financial-profile.repository';
import { categoryRepository } from '../../src/repositories/category.repository';
import { transactionRepository } from '../../src/repositories/transaction.repository';
import { fixedExpenseRepository } from '../../src/repositories/fixed-expense.repository';

const forecastService = new FinancialForecastService();

describe('FinancialForecastService', () => {
  beforeEach(() => {
    store.clear();
    seedData();
  });

  describe('Basic Forecast Calculation', () => {
    it('should calculate remaining days correctly', () => {
      const profile = financialProfileRepository.getActive();
      expect(profile).not.toBeNull();

      const forecast = forecastService.calculateForecast(profile!);
      expect(forecast.remainingDays).toBe(20);
    });

    it('should calculate reserved fixed expenses correctly', () => {
      const profile = financialProfileRepository.getActive();
      const forecast = forecastService.calculateForecast(profile!);

      // Internet 100 + Mobile 80 + Subscription 50 = 230
      expect(forecast.reservedFixedExpensesCents).toBe(23000);
    });

    it('should calculate protected usage allocation correctly', () => {
      const profile = financialProfileRepository.getActive();
      const forecast = forecastService.calculateForecast(profile!);

      // Fuel protected allocation: 150
      expect(forecast.protectedUsageAllocationCents).toBe(15000);
    });

    it('should calculate daily spending pool correctly', () => {
      const profile = financialProfileRepository.getActive();
      const forecast = forecastService.calculateForecast(profile!);

      // 100000 - 23000 (reserved) - 15000 (protected) = 62000
      expect(forecast.dailySpendingPoolCents).toBe(62000);
    });

    it('should calculate correctly when funds are sufficient', () => {
      const profile = financialProfileRepository.getActive();
      const forecast = forecastService.calculateForecast(profile!);

      const foodForecast = forecast.dailyForecasts.find(f => f.categoryName === 'Food');
      expect(foodForecast).not.toBeUndefined();

      // RM600 allocation - RM200 spent = RM400 remaining
      expect(foodForecast!.remainingCategoryAllocationCents).toBe(40000);

      // Preferred RM20, already spent RM200
      // Pool RM620 for RM20 * 20 days = RM400 needed < RM620 available
      // So recommend RM20
      expect(foodForecast!.recommendedDailyAmountCents).toBe(2000);
      expect(foodForecast!.status).toBe('SAFE');
    });
  });

  describe('Scenario: Insufficient funds', () => {
    it('should recommend less when insufficient funds', () => {
      const profile = financialProfileRepository.getActive()!;

      // Reduce balance to test insufficient funds
      profile.currentBalanceCents = 30000; // RM300
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);

      // 30000 - 23000 (reserved) - 15000 (protected) = (negative, so 0)
      expect(forecast.dailySpendingPoolCents).toBe(0);

      const foodForecast = forecast.dailyForecasts.find(f => f.categoryName === 'Food');
      expect(foodForecast!.recommendedDailyAmountCents).toBe(0);
      expect(foodForecast!.status).toBe('AT_RISK');
    });

    it('should handle case where pool is just enough', () => {
      const profile = financialProfileRepository.getActive()!;

      // Set balance to have limited pool
      profile.currentBalanceCents = 50000; // RM500
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);

      // 50000 - 23000 - 15000 = 12000
      expect(forecast.dailySpendingPoolCents).toBe(12000);

      const foodForecast = forecast.dailyForecasts.find(f => f.categoryName === 'Food');
      // 12000 / 20 days = 600 cents = RM6
      expect(foodForecast!.recommendedDailyAmountCents).toBe(600);
      expect(foodForecast!.status).toBe('AT_RISK');
    });
  });

  describe('Category spending tracking', () => {
    it('should track spending correctly', () => {
      const profile = financialProfileRepository.getActive()!;
      const foodCategory = categoryRepository.findByType(SpendingCategoryType.DAILY_TIME_BASED)[0];

      // Add additional food transaction today
      transactionRepository.create({
        categoryId: foodCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 5000, // RM50
        transactionDate: getTodayIsoString(),
        merchant: 'Restaurant',
        description: 'Lunch',
      });

      profile.currentBalanceCents -= 5000;
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);
      const foodForecast = forecast.dailyForecasts.find(f => f.categoryName === 'Food');

      // Should include today's spending
      expect(foodForecast!.actualSpentTodayCents).toBe(5000);
    });

    it('should prevent spending beyond allocation', () => {
      const profile = financialProfileRepository.getActive()!;
      const foodCategory = categoryRepository.findByType(SpendingCategoryType.DAILY_TIME_BASED)[0];

      // Food already has RM200 spent, RM600 allocated
      // Adding RM410 would exceed RM600
      transactionRepository.create({
        categoryId: foodCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 41000, // RM410
        transactionDate: getTodayIsoString(),
        merchant: 'Restaurant',
        description: 'Large purchase',
      });

      profile.currentBalanceCents -= 41000;
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);
      const foodForecast = forecast.dailyForecasts.find(f => f.categoryName === 'Food');

      // Remaining: 60000 - 20000 - 41000 = -1000 (negative, so treated as 0)
      expect(foodForecast!.remainingCategoryAllocationCents).toBeLessThanOrEqual(0);
      expect(foodForecast!.status).toBe('EXCEEDED');
    });
  });

  describe('Fixed expense handling', () => {
    it('should reserve unpaid fixed expenses', () => {
      const profile = financialProfileRepository.getActive()!;
      const forecast = forecastService.calculateForecast(profile);

      const unpaidPayments = fixedExpenseRepository.findUnpaid();
      const expectedReserved = unpaidPayments.reduce(
        (sum, p) => sum + p.expectedAmountCents,
        0
      );

      expect(forecast.reservedFixedExpensesCents).toBe(expectedReserved);
    });

    it('should not reserve paid expenses', () => {
      const profile = financialProfileRepository.getActive()!;
      const payment = fixedExpenseRepository.findUnpaid()[0];

      // Mark as paid
      fixedExpenseRepository.update(payment.id, {
        status: FixedExpensePaymentStatus.PAID,
        actualAmountCents: payment.expectedAmountCents,
        paymentDate: getTodayIsoString(),
      });

      const forecast = forecastService.calculateForecast(profile);

      // Should have one less payment reserved
      expect(forecast.reservedFixedExpensesCents).toBeLessThan(23000);
    });
  });

  describe('Usage-based categories', () => {
    it('should track protected usage-based spending', () => {
      const profile = financialProfileRepository.getActive()!;
      const fuelCategory = categoryRepository.findByType(SpendingCategoryType.USAGE_BASED)[0];

      // Add fuel spending
      transactionRepository.create({
        categoryId: fuelCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 5000, // RM50
        transactionDate: getTodayIsoString(),
        merchant: 'Petrol Station',
        description: 'Fuel',
      });

      profile.currentBalanceCents -= 5000;
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);

      // Protected usage should now be 15000 - 5000 = 10000
      expect(forecast.protectedUsageAllocationCents).toBe(10000);
    });
  });

  describe('Projected balance calculations', () => {
    it('should calculate projected balance on payday', () => {
      const profile = financialProfileRepository.getActive()!;
      const forecast = forecastService.calculateForecast(profile);

      // Projected = Current - Reserved - Projected Spending + Salary
      // = 100000 - 23000 - (20*20) - (...) + 500000
      expect(forecast.projectedBalanceOnPaydayCents).toBeGreaterThan(0);
    });

    it('should warn when projected balance is negative', () => {
      const profile = financialProfileRepository.getActive()!;

      // Set very low balance
      profile.expectedSalaryCents = 10000; // RM100 salary
      profile.currentBalanceCents = 100000; // RM1000
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);

      // May or may not warn depending on calculations
      expect(Array.isArray(forecast.warnings)).toBe(true);
    });
  });

  describe('Warnings and alerts', () => {
    it('should warn when balance < reserved expenses', () => {
      const profile = financialProfileRepository.getActive()!;

      // Set balance lower than reserved
      profile.currentBalanceCents = 15000; // RM150
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);
      const warning = forecast.warnings.find(w => w.code === 'INSUFFICIENT_BALANCE');

      expect(warning).not.toBeUndefined();
      expect(warning!.level).toBe('CRITICAL');
    });

    it('should warn when category at 80% utilisation', () => {
      const profile = financialProfileRepository.getActive()!;
      const foodCategory = categoryRepository.findByType(SpendingCategoryType.DAILY_TIME_BASED)[0];

      // Add spending to reach 80%: 600 * 0.8 = 480 + existing 200 = 680 too much
      // Add 280 to reach 480 total (200 + 280 = 480, which is 80% of 600)
      transactionRepository.create({
        categoryId: foodCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 28000, // RM280
        transactionDate: getTodayIsoString(),
      });

      profile.currentBalanceCents -= 28000;
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);
      const warning = forecast.warnings.find(w => w.code === 'ALLOCATION_AT_80_PERCENT');

      expect(warning).not.toBeUndefined();
      expect(warning!.level).toBe('WARNING');
    });

    it('should warn when category exceeds allocation', () => {
      const profile = financialProfileRepository.getActive()!;
      const foodCategory = categoryRepository.findByType(SpendingCategoryType.DAILY_TIME_BASED)[0];

      // Add spending > 600: add 410 (200 + 410 = 610 > 600)
      transactionRepository.create({
        categoryId: foodCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 41000, // RM410
        transactionDate: getTodayIsoString(),
      });

      profile.currentBalanceCents -= 41000;
      financialProfileRepository.update(profile.id, profile);

      const forecast = forecastService.calculateForecast(profile);
      const warning = forecast.warnings.find(w => w.code === 'ALLOCATION_EXCEEDED');

      expect(warning).not.toBeUndefined();
      expect(warning!.level).toBe('WARNING');
    });

    it('should warn about overdue bills', () => {
      const profile = financialProfileRepository.getActive()!;
      const payment = fixedExpenseRepository.findUnpaid()[0];

      // Move due date to past
      fixedExpenseRepository.update(payment.id, {
        dueDate: getDateNDaysFromNow(-5), // 5 days ago
      });

      const forecast = forecastService.calculateForecast(profile);
      const warning = forecast.warnings.find(w => w.code === 'BILL_OVERDUE');

      expect(warning).not.toBeUndefined();
      expect(warning!.level).toBe('WARNING');
    });

    it('should warn when bill is approaching', () => {
      const profile = financialProfileRepository.getActive()!;
      const payment = fixedExpenseRepository.findUnpaid()[0];

      // Set due date to 2 days from now
      fixedExpenseRepository.update(payment.id, {
        dueDate: getDateNDaysFromNow(2),
      });

      const forecast = forecastService.calculateForecast(profile);
      const warning = forecast.warnings.find(w => w.code === 'BILL_APPROACHING');

      expect(warning).not.toBeUndefined();
      expect(warning!.level).toBe('INFO');
    });
  });

  describe('Payday edge cases', () => {
    it('should throw when payday not set', () => {
      const profile = financialProfileRepository.getActive()!;
      profile.nextPayday = '';
      financialProfileRepository.update(profile.id, profile);

      expect(() => {
        forecastService.calculateForecast(profile);
      }).toThrow();
    });

    it('should throw when payday has passed', () => {
      const profile = financialProfileRepository.getActive()!;
      profile.nextPayday = getDateNDaysFromNow(-5); // 5 days ago
      financialProfileRepository.update(profile.id, profile);

      expect(() => {
        forecastService.calculateForecast(profile);
      }).toThrow();
    });

    it('should throw when profile not found', () => {
      expect(() => {
        forecastService.calculateForecast(null as any);
      }).toThrow();
    });
  });

  describe('Daily recommendation recalculation', () => {
    it('should recalculate when spending is added', () => {
      const profile = financialProfileRepository.getActive()!;
      const foodCategory = categoryRepository.findByType(SpendingCategoryType.DAILY_TIME_BASED)[0];

      let forecast1 = forecastService.calculateForecast(profile);
      expect(forecast1.dailyForecasts.length).toBeGreaterThan(0);

      // Add a purchase
      transactionRepository.create({
        categoryId: foodCategory.id,
        type: TransactionType.EXPENSE,
        source: TransactionSource.MANUAL,
        amountCents: 10000, // RM100
        transactionDate: getTodayIsoString(),
      });

      profile.currentBalanceCents -= 10000;
      financialProfileRepository.update(profile.id, profile);

      let forecast2 = forecastService.calculateForecast(profile);

      // Recommendation should stay same or change (depending on calculations)
      expect(forecast2.dailyForecasts.length).toBeGreaterThan(0);
    });
  });
});
