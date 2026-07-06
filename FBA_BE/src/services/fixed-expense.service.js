/**
 * Fixed Expense Service
 * Manages fixed expenses (bills, subscriptions, loans)
 */

import { FixedExpensePaymentStatus, TransactionType, TransactionSource } from '../models/index.js';
import { fixedExpenseRepository } from '../repositories/fixed-expense.repository.js';
import { categoryService } from './category.service.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { balanceService } from './balance.service.js';
import { AppError } from '../errors/app-error.js';

export const fixedExpenseService = {
  /**
   * Get all fixed expenses
   */
  getAllFixedExpenses() {
    return fixedExpenseRepository.findAll();
  },

  /**
   * Get unpaid fixed expenses
   */
  getUnpaidExpenses() {
    return fixedExpenseRepository.findUnpaid();
  },

  /**
   * Get paid fixed expenses
   */
  getPaidExpenses() {
    return fixedExpenseRepository.findPaid();
  },

  /**
   * Get overdue fixed expenses
   */
  getOverdueExpenses() {
    return fixedExpenseRepository.findOverdue();
  },

  /**
   * Update overdue status
   */
  updateOverdueStatus() {
    const today = new Date().toISOString().split('T')[0];
    const expenses = this.getUnpaidExpenses();
    expenses.forEach(exp => {
      if (exp.dueDate < today) {
        fixedExpenseRepository.update(exp.id, { status: FixedExpensePaymentStatus.OVERDUE });
      }
    });
  },

  /**
   * Get fixed expense for a category
   */
  getExpenseForCategory(categoryId) {
    const expenses = fixedExpenseRepository.findAll();
    return expenses.find(exp => exp.categoryId === categoryId && exp.status === FixedExpensePaymentStatus.UNPAID);
  },

  /**
   * Pay fixed expense
   */
  async payFixedExpense(categoryId, data) {
    const { actualAmountCents, paymentDate } = data;

    if (actualAmountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Payment amount must be positive',
        statusCode: 400,
      });
    }

    const payment = this.getExpenseForCategory(categoryId);
    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_ALREADY_PAID',
        message: `No unpaid fixed expense for category: ${categoryId}`,
        statusCode: 400,
      });
    }

    const currentBalance = balanceService.getCurrentBalance();
    if (currentBalance < actualAmountCents) {
      throw new AppError({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient balance for payment',
        statusCode: 400,
        details: { available: currentBalance, required: actualAmountCents },
      });
    }

    // Deduct from balance
    await balanceService.deductFromBalance(actualAmountCents);

    // Create linked transaction
    const category = categoryService.getById(categoryId);
    const transaction = await transactionRepository.create({
      categoryId,
      type: TransactionType.EXPENSE,
      source: TransactionSource.FIXED_EXPENSE_PAYMENT,
      amountCents: actualAmountCents,
      transactionDate: paymentDate,
      description: `Fixed expense payment: ${category.name}`,
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
  },

  /**
   * Reverse fixed expense payment
   */
  async reverseFixedExpensePayment(categoryId) {
    const expenses = fixedExpenseRepository.findAll();
    const payment = expenses.find(p => p.categoryId === categoryId && p.status === FixedExpensePaymentStatus.PAID);

    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_NOT_PAID',
        message: `No paid fixed expense to reverse for category: ${categoryId}`,
        statusCode: 400,
      });
    }

    const transaction = transactionRepository.findByFixedExpensePaymentId(payment.id);
    if (!transaction) {
      throw new AppError({
        code: 'INVALID_OPERATION',
        message: `No linked transaction found for payment: ${payment.id}`,
        statusCode: 400,
      });
    }

    // Restore balance
    await balanceService.addIncome(payment.actualAmountCents, `Reversal of: ${payment.id}`);

    // Delete transaction
    await transactionRepository.delete(transaction.id);

    // Update payment status back to unpaid
    await fixedExpenseRepository.update(payment.id, {
      status: FixedExpensePaymentStatus.UNPAID,
      actualAmountCents: null,
      paymentDate: null,
      transactionId: null,
    });

    return { success: true, paymentId: payment.id };
  },
};
