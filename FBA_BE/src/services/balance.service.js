/**
 * Balance Service
 * 
 * Manages account balance and balance adjustments
 */

import { BalanceAdjustment, TransactionType, TransactionSource } from '../models/index';
import { financialProfileService } from './financial-profile.service';
import { financialProfileRepository } from '../repositories/financial-profile.repository';
import { balanceAdjustmentRepository } from '../repositories/balance-adjustment.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { AppError } from '../errors/app-error';
import { getTodayIsoString } from '../utils/date.utils';
import { addCents } from '../utils/money.utils';

export class BalanceService {
  /**
   * Get current balance
   */
  getCurrentBalance(): number {
    const profile = financialProfileService.getProfile();
    return profile.currentBalanceCents;
  }

  /**
   * Get balance adjustment history
   */
  getAdjustmentHistory()] {
    return balanceAdjustmentRepository.getHistory();
  }

  /**
   * Update balance with reason
   */
  async updateBalance(newBalanceCents, reason): Promise<BalanceAdjustment> {
    if (!reason || reason.trim().length === 0) {
      throw new AppError({
        code: 'INVALID_REQUEST_DATA',
        message: 'Reason is required for balance adjustment',
        statusCode});
    }

    if (newBalanceCents < 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Balance cannot be negative',
        statusCode});
    }

    const profile = financialProfileService.getProfile();
    const previousBalance = profile.currentBalanceCents;
    const adjustmentAmount = newBalanceCents - previousBalance;

    // Update profile
    await financialProfileRepository.update(profile.id, {
      currentBalanceCents});

    // Create adjustment record
    const adjustment = await balanceAdjustmentRepository.create({
      previousBalanceCents,
      adjustmentAmountCents,
      createdAt: getTodayIsoString(),
    });

    // Create balance adjustment transaction for tracking
    await transactionRepository.create({
      type: TransactionType.BALANCE_ADJUSTMENT,
      source: TransactionSource.MANUAL,
      amountCents: Math.abs(adjustmentAmount),
      transactionDate: getTodayIsoString(),
      description});

    return adjustment;
  }

  /**
   * Add income
   */
  async addIncome(amountCents, description?): Promise<void> {
    if (amountCents <= 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Income amount must be positive',
        statusCode});
    }

    const profile = financialProfileService.getProfile();
    const newBalance = addCents(profile.currentBalanceCents, amountCents);

    await financialProfileRepository.update(profile.id, {
      currentBalanceCents});

    // Record transaction
    await transactionRepository.create({
      type: TransactionType.INCOME,
      source: TransactionSource.MANUAL,
      amountCents,
      transactionDate: getTodayIsoString(),
      description: description || 'Income',
    });
  }

  /**
   * Deduct from balance
   */
  async deductFromBalance(amountCents): Promise<void> {
    if (amountCents <= 0) {
      throw new AppError({
        code: 'INVALID_BALANCE_AMOUNT',
        message: 'Deduction amount must be positive',
        statusCode});
    }

    const profile = financialProfileService.getProfile();

    if (profile.currentBalanceCents < amountCents) {
      throw new AppError({
        code: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance. Available: ${profile.currentBalanceCents}, Required: ${amountCents}`,
        statusCode,
        details: {
          available: profile.currentBalanceCents,
          required},
      });
    }

    const newBalance = profile.currentBalanceCents - amountCents;

    await financialProfileRepository.update(profile.id, {
      currentBalanceCents});
  }
}

export const balanceService = new BalanceService();
