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
      const effectiveBalance = balanceService.getEffectiveBalance();
      if (effectiveBalance < data.amountCents) {
        throw new AppError({
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for expense',
          statusCode: 400,
          details: { available: effectiveBalance, required: data.amountCents },
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
   * Update transaction
   */
  async updateTransaction(id, data) {
    const existing = this.getTransaction(id);
    
    // If amount changed and it's an expense, handle balance adjustment
    if (data.amountCents && data.amountCents !== existing.amountCents && existing.type === TransactionType.EXPENSE) {
      const difference = data.amountCents - existing.amountCents;
      if (difference > 0) {
        // Amount increased, need to deduct more from balance
        const currentBalance = balanceService.getCurrentBalance();
        if (currentBalance < difference) {
          throw new AppError({
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient balance for transaction adjustment',
            statusCode: 400,
          });
        }
        await balanceService.deductFromBalance(difference);
      } else if (difference < 0) {
        // Amount decreased, add back to balance
        await balanceService.addIncome(Math.abs(difference), 'Transaction amount reduction');
      }
    } else if (data.amountCents && data.amountCents !== existing.amountCents && existing.type === TransactionType.INCOME) {
      const difference = existing.amountCents - data.amountCents;
      if (difference > 0) {
        // Income decreased, remove from balance
        const currentBalance = balanceService.getCurrentBalance();
        if (currentBalance < difference) {
          throw new AppError({
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient balance for transaction adjustment',
            statusCode: 400,
          });
        }
        await balanceService.deductFromBalance(difference);
      } else if (difference < 0) {
        // Income increased, add to balance
        await balanceService.addIncome(Math.abs(difference), 'Income amount increase');
      }
    }

    return await transactionRepository.update(id, data);
  },

  /**
   * Delete transaction
   */
  async deleteTransaction(id) {
    const transaction = this.getTransaction(id);
    
    // Refund the transaction amount back to balance (without creating transaction record)
    if (transaction.type === TransactionType.EXPENSE) {
      // Refund expense back to balance
      await balanceService.adjustBalanceInternal(transaction.amountCents);
    } else if (transaction.type === TransactionType.INCOME) {
      // Remove income from balance
      await balanceService.adjustBalanceInternal(-transaction.amountCents);
    }
    
    await transactionRepository.delete(id);
  },
};
