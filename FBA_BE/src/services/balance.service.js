/**
 * Balance Service
 * Manages account balance and balance adjustments
 */

import { TransactionType, TransactionSource } from '../models/index.js';
import { financialProfileService } from './financial-profile.service.js';
import { financialProfileRepository } from '../repositories/financial-profile.repository.js';
import { balanceAdjustmentRepository } from '../repositories/balance-adjustment.repository.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { AppError } from '../errors/app-error.js';
import { getTodayIsoString } from '../utils/date.utils.js';

export const balanceService = {
  /**
   * Get current balance
   */
  getCurrentBalance() {
    const profile = financialProfileService.getProfile();
    return profile.currentBalanceCents;
  },

  /**
   * Get balance adjustment history
   */
  getAdjustmentHistory() {
    return balanceAdjustmentRepository.findAll();
  },

  /**
   * Update balance with reason
   */
  async updateBalance(newBalanceCents, reason) {
    if (!reason || reason.trim().length === 0) {
      throw new AppError({
        code: 'INVALID_REQUEST_DATA',
        message: 'Reason is required for balance adjustment',
        statusCode: 400,
      });
    }

    if (newBalanceCents < 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Balance cannot be negative',
        statusCode: 400,
      });
    }

    const profile = financialProfileService.getProfile();
    const previousBalance = profile.currentBalanceCents;
    const adjustmentAmount = newBalanceCents - previousBalance;

    await financialProfileRepository.update(profile.id, {
      currentBalanceCents: newBalanceCents,
    });

    const adjustment = await balanceAdjustmentRepository.create({
      previousBalanceCents: previousBalance,
      newBalanceCents: newBalanceCents,
      adjustmentAmountCents: adjustmentAmount,
      reason,
      createdAt: getTodayIsoString(),
    });

    await transactionRepository.create({
      type: TransactionType.BALANCE_ADJUSTMENT,
      source: TransactionSource.MANUAL,
      amountCents: Math.abs(adjustmentAmount),
      transactionDate: getTodayIsoString(),
      description: reason,
    });

    return adjustment;
  },

  /**
   * Add income
   */
  async addIncome(amountCents, description) {
    if (amountCents <= 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Income amount must be positive',
        statusCode: 400,
      });
    }

    const profile = financialProfileService.getProfile();
    const newBalance = profile.currentBalanceCents + amountCents;

    await financialProfileRepository.update(profile.id, {
      currentBalanceCents: newBalance,
    });

    await transactionRepository.create({
      type: TransactionType.INCOME,
      source: TransactionSource.MANUAL,
      amountCents,
      transactionDate: getTodayIsoString(),
      description,
    });

    return { previous: profile.currentBalanceCents, new: newBalance };
  },

  /**
   * Deduct from balance
   */
  async deductFromBalance(amountCents, description) {
    if (amountCents <= 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Deduction amount must be positive',
        statusCode: 400,
      });
    }

    const profile = financialProfileService.getProfile();
    if (profile.currentBalanceCents < amountCents) {
      throw new AppError({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient balance for deduction',
        statusCode: 400,
        details: { available: profile.currentBalanceCents, required: amountCents },
      });
    }

    const newBalance = profile.currentBalanceCents - amountCents;

    await financialProfileRepository.update(profile.id, {
      currentBalanceCents: newBalance,
    });

    return { previous: profile.currentBalanceCents, new: newBalance };
  },

  /**
   * Internal: Update balance without creating transaction record
   * Used for internal adjustments like transaction refunds
   */
  async adjustBalanceInternal(amountCents) {
    const profile = financialProfileService.getProfile();
    const newBalance = profile.currentBalanceCents + amountCents;

    // Allow negative balance for internal adjustments
    await financialProfileRepository.update(profile.id, {
      currentBalanceCents: newBalance,
    });

    return { previous: profile.currentBalanceCents, new: newBalance };
  },
};
