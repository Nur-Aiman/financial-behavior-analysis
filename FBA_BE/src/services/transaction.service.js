/**
 * Transaction Service
 * Manages financial transactions (Expense, Income)
 */

import { TransactionType, TransactionSource } from '../models/index.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { categoryService } from './category.service.js';
import { balanceService } from './balance.service.js';
import { AppError } from '../errors/app-error.js';
import { getTodayIsoString } from '../utils/date.utils.js';

export const transactionService = {
  /**
   * Create transaction (Expense or Income)
   */
  async createTransaction(data) {
    if (data.amountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Transaction amount must be positive',
        statusCode: 400,
      });
    }

    if (data.categoryId) {
      try {
        categoryService.getById(data.categoryId);
      } catch (err) {
        throw new AppError({
          code: 'CATEGORY_NOT_FOUND',
          message: `Category not found: ${data.categoryId}`,
          statusCode: 404,
        });
      }
    }

    if (data.type === TransactionType.EXPENSE) {
      const currentBalance = balanceService.getCurrentBalance();
      if (currentBalance < data.amountCents) {
        throw new AppError({
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for expense',
          statusCode: 400,
          details: { available: currentBalance, required: data.amountCents },
        });
      }
      await balanceService.deductFromBalance(data.amountCents);
    } else if (data.type === TransactionType.INCOME) {
      await balanceService.addIncome(data.amountCents, data.description);
    }

    const transaction = await transactionRepository.create({
      ...data,
      source: TransactionSource.MANUAL,
    });

    return transaction;
  },

  /**
   * Get transaction by ID
   */
  getTransaction(id) {
    const transaction = transactionRepository.findById(id);
    if (!transaction) {
      throw new AppError({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction not found: ${id}`,
        statusCode: 404,
      });
    }
    return transaction;
  },

  /**
   * Get all transactions
   */
  getAllTransactions() {
    return transactionRepository.findAll();
  },

  /**
   * Get transactions by filters
   */
  getTransactions(filters) {
    let transactions = this.getAllTransactions();

    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }

    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }

    if (filters.dateFrom && filters.dateTo) {
      transactions = transactionRepository.findByDateRange(filters.dateFrom, filters.dateTo);
    } else if (filters.dateFrom) {
      transactions = transactions.filter(t => t.transactionDate >= filters.dateFrom);
    } else if (filters.dateTo) {
      transactions = transactions.filter(t => t.transactionDate <= filters.dateTo);
    }

    return transactions;
  },

  /**
   * Get today's transactions
   */
  getTodayTransactions() {
    return transactionRepository.findByDate(getTodayIsoString());
  },
};
