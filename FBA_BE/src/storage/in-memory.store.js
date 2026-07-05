/**
 * In-Memory Storage Design
 * 
 * This module provides a single source of truth for all application data.
 * Data persists only during the server session.
 * 
 * LIMITATION: Data resets when the server restarts.
 * For production, replace with PostgreSQL using the repository interfaces.
 */

import {
  FinancialProfile,
  SpendingCategory,
  Transaction,
  FixedExpensePayment,
  BalanceAdjustment,
} from '../models/index';

export class InMemoryStore {
  private financialProfiles= new Map();
  private categories= new Map();
  private transactions= new Map();
  private fixedExpensePayments= new Map();
  private balanceAdjustments= [];

  /**
   * Financial Profiles
   */
  addProfile(profile): void {
    this.financialProfiles.set(profile.id, { ...profile });
  }

  getProfile(id): FinancialProfile | null {
    const profile = this.financialProfiles.get(id);
    return profile ? { ...profile } ;
  }

  getAllProfiles()] {
    return Array.from(this.financialProfiles.values()).map(p => ({ ...p }));
  }

  updateProfile(id, updates): void {
    const profile = this.financialProfiles.get(id);
    if (profile) {
      this.financialProfiles.set(id, { ...profile, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteProfile(id): void {
    this.financialProfiles.delete(id);
  }

  /**
   * Categories
   */
  addCategory(category): void {
    this.categories.set(category.id, { ...category });
  }

  getCategory(id): SpendingCategory | null {
    const category = this.categories.get(id);
    return category ? { ...category } ;
  }

  getAllCategories()] {
    return Array.from(this.categories.values()).map(c => ({ ...c }));
  }

  updateCategory(id, updates): void {
    const category = this.categories.get(id);
    if (category) {
      this.categories.set(id, { ...category, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteCategory(id): void {
    this.categories.delete(id);
  }

  /**
   * Transactions
   */
  addTransaction(transaction): void {
    this.transactions.set(transaction.id, { ...transaction });
  }

  getTransaction(id): Transaction | null {
    const transaction = this.transactions.get(id);
    return transaction ? { ...transaction } ;
  }

  getAllTransactions()] {
    return Array.from(this.transactions.values()).map(t => ({ ...t }));
  }

  updateTransaction(id, updates): void {
    const transaction = this.transactions.get(id);
    if (transaction) {
      this.transactions.set(id, { ...transaction, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteTransaction(id): void {
    this.transactions.delete(id);
  }

  /**
   * Fixed Expense Payments
   */
  addFixedExpensePayment(payment): void {
    this.fixedExpensePayments.set(payment.id, { ...payment });
  }

  getFixedExpensePayment(id): FixedExpensePayment | null {
    const payment = this.fixedExpensePayments.get(id);
    return payment ? { ...payment } ;
  }

  getAllFixedExpensePayments()] {
    return Array.from(this.fixedExpensePayments.values()).map(p => ({ ...p }));
  }

  updateFixedExpensePayment(id, updates): void {
    const payment = this.fixedExpensePayments.get(id);
    if (payment) {
      this.fixedExpensePayments.set(id, { ...payment, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteFixedExpensePayment(id): void {
    this.fixedExpensePayments.delete(id);
  }

  /**
   * Balance Adjustments
   */
  addBalanceAdjustment(adjustment): void {
    this.balanceAdjustments.push({ ...adjustment });
  }

  getBalanceAdjustments()] {
    return this.balanceAdjustments.map(a => ({ ...a }));
  }

  /**
   * Utility: Clear all data
   */
  clear(): void {
    this.financialProfiles.clear();
    this.categories.clear();
    this.transactions.clear();
    this.fixedExpensePayments.clear();
    this.balanceAdjustments = [];
  }
}

// Singleton instance
export const store = new InMemoryStore();
