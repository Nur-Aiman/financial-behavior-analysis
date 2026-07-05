/**
 * Fixed Expense Service
 * 
 * Manages fixed expenses (bills, subscriptions, loans)
 * Handles payment tracking and reversals
 */

import {
  FixedExpensePayment,
  FixedExpensePaymentStatus,
  Transaction,
  TransactionType,
  TransactionSource,
} from '../models/index';
import { fixedExpenseRepository } from '../repositories/fixed-expense.repository';
import { categoryService } from './category.service';
import { transactionRepository } from '../repositories/transaction.repository';
import { balanceService } from './balance.service';
import { AppError } from '../errors/app-error';
import { getTodayIsoString } from '../utils/date.utils';

export class FixedExpenseService {
  /**
   * Get all fixed expenses
   */
  getAllFixedExpenses(): FixedExpensePayment[] {
    return fixedExpenseRepository.findAll();
  }

  /**
   * Get unpaid fixed expenses
   */
  getUnpaidExpenses(): FixedExpensePayment[] {
    return fixedExpenseRepository.findUnpaid();
  }

  /**
   * Get paid fixed expenses
   */
  getPaidExpenses(): FixedExpensePayment[] {
    return fixedExpenseRepository.findPaid();
  }

  /**
   * Get overdue fixed expenses
   */
  getOverdueExpenses(): FixedExpensePayment[] {
    return fixedExpenseRepository.findOverdue();
  }

  /**
   * Get fixed expense for a category
   */
  getExpenseForCategory(categoryId: string): FixedExpensePayment | null {
    return fixedExpenseRepository.findUnpaidByCategory(categoryId);
  }

  /**
   * Create fixed expense payment record
   */
  async createFixedExpense(categoryId: string): Promise<FixedExpensePayment> {
    // Verify category is FIXED_ONE_TIME type
    const category = categoryService.getById(categoryId);

    const { SpendingCategoryType } = require('../models');
    if (category.type !== SpendingCategoryType.FIXED_ONE_TIME) {
      throw new AppError({
        code: 'CATEGORY_TYPE_MISMATCH',
        message: `Category must be FIXED_ONE_TIME type, got ${category.type}`,
        statusCode: 400,
      });
    }

    // Create payment record
    return await fixedExpenseRepository.create({
      categoryId,
      expectedAmountCents: category.expectedAmountCents!,
      dueDate: category.dueDate!,
      status: FixedExpensePaymentStatus.UNPAID,
    });
  }

  /**
   * Pay fixed expense
   */
  async payFixedExpense(categoryId: string, actualAmountCents: number, paymentDate: string): Promise<Transaction> {
    if (actualAmountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Payment amount must be positive',
        statusCode: 400,
      });
    }

    // Find unpaid payment
    const payment = fixedExpenseRepository.findUnpaidByCategory(categoryId);
    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_ALREADY_PAID',
        message: `No unpaid fixed expense for category: ${categoryId}`,
        statusCode: 400,
      });
    }

    // Check balance
    const currentBalance = balanceService.getCurrentBalance();
    if (currentBalance < actualAmountCents) {
      throw new AppError({
        code: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance for payment`,
        statusCode: 400,
        details: {
          available: currentBalance,
          required: actualAmountCents,
        },
      });
    }

    // Deduct from balance
    await balanceService.deductFromBalance(actualAmountCents);

    // Create linked expense transaction
    const transaction = await transactionRepository.create({
      categoryId,
      type: TransactionType.EXPENSE,
      source: TransactionSource.FIXED_EXPENSE_PAYMENT,
      amountCents: actualAmountCents,
      transactionDate: paymentDate,
      description: `Fixed expense payment: ${categoryService.getById(categoryId).name}`,
      linkedFixedExpensePaymentId: payment.id,
    });

    // Update payment record
    await fixedExpenseRepository.update(payment.id, {
      status: FixedExpensePaymentStatus.PAID,
      actualAmountCents,
      paymentDate,
      transactionId: transaction.id,
    });

    return transaction;
  }

  /**
   * Reverse fixed expense payment
   */
  reverseFixedExpensePayment(categoryId: string): void {
    const payment = fixedExpenseRepository.findByCategory(categoryId).find(
      p => p.status === FixedExpensePaymentStatus.PAID
    );

    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_NOT_PAID',
        message: `No paid fixed expense to reverse for category: ${categoryId}`,
        statusCode: 400,
      });
    }

    // Find linked transaction
    const transaction = transactionRepository.findByFixedExpensePaymentId(payment.id);
    if (!transaction) {
      throw new AppError({
        code: 'INVALID_OPERATION',
        message: `No linked transaction found for payment: ${payment.id}`,
        statusCode: 400,
      });
    }

    // Restore balance
    const currentBalance = balanceService.getCurrentBalance();
    const financialProfileRepository = require('../repositories/financial-profile.repository')
      .financialProfileRepository;
    const profile = financialProfileRepository.getActive();

    financialProfileRepository.update(profile.id, {
      currentBalanceCents: currentBalance + transaction.amountCents,
    });

    // Delete transaction
    transactionRepository.delete(transaction.id);

    // Mark payment as unpaid
    fixedExpenseRepository.update(payment.id, {
      status: FixedExpensePaymentStatus.UNPAID,
      actualAmountCents: undefined,
      paymentDate: undefined,
      transactionId: undefined,
    });
  }

  /**
   * Check if fixed expense is overdue
   */
  isOverdue(categoryId: string): boolean {
    const payment = this.getExpenseForCategory(categoryId);
    if (!payment) return false;

    const today = getTodayIsoString();
    return payment.dueDate < today;
  }

  /**
   * Get days until due
   */
  getDaysUntilDue(categoryId: string): number {
    const { calculateRemainingDays } = require('../utils/date.utils');
    const payment = this.getExpenseForCategory(categoryId);
    if (!payment) return -1;

    const today = getTodayIsoString();
    return calculateRemainingDays(today, payment.dueDate);
  }

  /**
   * Mark as overdue if needed
   */
  updateOverdueStatus(): void {
    const unpaid = fixedExpenseRepository.findUnpaid();
    const today = getTodayIsoString();

    for (const payment of unpaid) {
      if (payment.dueDate < today && payment.status !== FixedExpensePaymentStatus.OVERDUE) {
        fixedExpenseRepository.update(payment.id, {
          status: FixedExpensePaymentStatus.OVERDUE,
        });
      }
    }
  }
}

export const fixedExpenseService = new FixedExpenseService();
