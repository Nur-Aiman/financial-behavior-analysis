/**
 * Transaction Service
 * 
 * Manages financial transactions (Expense, Income)
 * Handles balance adjustments and transaction reversals
 */

import { Transaction, TransactionType, TransactionSource } from '../models/index';
import { transactionRepository } from '../repositories/transaction.repository';
import { categoryService } from './category.service';
import { balanceService } from './balance.service';
import { AppError } from '../errors/app-error';
import { getTodayIsoString } from '../utils/date.utils';

export class TransactionService {
  /**
   * Create transaction (Expense or Income)
   */
  async createTransaction(data: {
    categoryId?;
    type;
    amountCents;
    transactionDate;
    merchant?;
    description?;
    notes?;
  }): Promise<Transaction> {
    // Validate amount
    if (data.amountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Transaction amount must be positive',
        statusCode});
    }

    // Validate category exists if specified
    if (data.categoryId) {
      try {
        categoryService.getById(data.categoryId);
      } catch (err) {
        throw new AppError({
          code: 'CATEGORY_NOT_FOUND',
          message: `Category not found: ${data.categoryId}`,
          statusCode});
      }
    }

    // Check balance for expenses
    if (data.type === TransactionType.EXPENSE) {
      const currentBalance = balanceService.getCurrentBalance();
      if (currentBalance < data.amountCents) {
        throw new AppError({
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient balance for expense`,
          statusCode,
          details: {
            available,
            required: data.amountCents,
          },
        });
      }

      // Deduct from balance
      await balanceService.deductFromBalance(data.amountCents);
    } else if (data.type === TransactionType.INCOME) {
      // Add to balance
      await balanceService.addIncome(data.amountCents, data.description);
    }

    // Create transaction
    const transaction = await transactionRepository.create({
      ...data,
      source: TransactionSource.MANUAL,
    });

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id): Transaction {
    const transaction = transactionRepository.findById(id);
    if (!transaction) {
      throw new AppError({
        code: 'TRANSACTION_NOT_FOUND',
        message: `Transaction not found: ${id}`,
        statusCode});
    }
    return transaction;
  }

  /**
   * Get all transactions
   */
  getAllTransactions()] {
    return transactionRepository.findAll();
  }

  /**
   * Get transactions by filters
   */
  getTransactions(filters: {
    categoryId?;
    type?;
    dateFrom?;
    dateTo?;
  })] {
    let transactions = this.getAllTransactions();

    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }

    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }

    if (filters.dateFrom && filters.dateTo) {
      transactions = transactionRepository.findByDateRange(
        filters.dateFrom,
        filters.dateTo
      );
    } else if (filters.dateFrom) {
      transactions = transactions.filter(t => t.transactionDate >= filters.dateFrom!);
    } else if (filters.dateTo) {
      transactions = transactions.filter(t => t.transactionDate <= filters.dateTo!);
    }

    return transactions;
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    id,
    data, 'id' | 'createdAt'>>
  ): Promise<Transaction> {
    const oldTransaction = this.getTransaction(id);

    // Prevent updating fixed expense payment transactions
    if (oldTransaction.source === TransactionSource.FIXED_EXPENSE_PAYMENT) {
      throw new AppError({
        code: 'INVALID_OPERATION',
        message: 'Cannot update fixed expense payment transactions. Reverse and recreate instead.',
        statusCode});
    }

    // Validate new amount if provided
    if (data.amountCents !== undefined && data.amountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Transaction amount must be positive',
        statusCode});
    }

    // Reverse old transaction's balance effect
    await this.reverseTransactionEffect(oldTransaction);

    // Apply new transaction effect
    const newTransaction = {
      ...oldTransaction,
      ...data,
    };

    if (newTransaction.type === TransactionType.EXPENSE) {
      await balanceService.deductFromBalance(newTransaction.amountCents);
    } else if (newTransaction.type === TransactionType.INCOME) {
      await balanceService.addIncome(newTransaction.amountCents);
    }

    // Save updated transaction
    return await transactionRepository.update(id, newTransaction);
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id): Promise<void> {
    const transaction = this.getTransaction(id);

    // Prevent deletion of fixed expense payment transactions
    if (transaction.source === TransactionSource.FIXED_EXPENSE_PAYMENT) {
      throw new AppError({
        code: 'INVALID_OPERATION',
        message: 'Cannot delete fixed expense payment transactions. Use reverse-payment instead.',
        statusCode});
    }

    // Reverse balance effect
    await this.reverseTransactionEffect(transaction);

    // Delete transaction
    await transactionRepository.delete(id);
  }

  /**
   * Reverse transaction's balance effect
   */
  private async reverseTransactionEffect(transaction): Promise<void> {
    if (transaction.type === TransactionType.EXPENSE) {
      // Add back the deducted amount
      const profile = require('../repositories/financial-profile.repository')
        .financialProfileRepository.getActive();

      await require('../repositories/financial-profile.repository').financialProfileRepository.update(
        profile.id,
        {
          currentBalanceCents: profile.currentBalanceCents + transaction.amountCents,
        }
      );
    } else if (transaction.type === TransactionType.INCOME) {
      // Deduct the added income
      const profile = require('../repositories/financial-profile.repository')
        .financialProfileRepository.getActive();

      await require('../repositories/financial-profile.repository').financialProfileRepository.update(
        profile.id,
        {
          currentBalanceCents: profile.currentBalanceCents - transaction.amountCents,
        }
      );
    }
  }

  /**
   * Get transactions for a specific date
   */
  getTransactionsForDate(dateStr)] {
    return transactionRepository.findByDate(dateStr);
  }

  /**
   * Get today's transactions
   */
  getTodayTransactions()] {
    return this.getTransactionsForDate(getTodayIsoString());
  }

  /**
   * Get category spending for a date range
   */
  getCategorySpendingByDateRange(
    categoryId,
    startDate,
    endDate): number {
    const transactions = transactionRepository.findByCategoryAndDateRange(
      categoryId,
      startDate,
      endDate
    );
    return transactions.reduce((sum, t) => sum + t.amountCents, 0);
  }
}

export const transactionService = new TransactionService();
