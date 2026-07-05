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
  private financialProfiles: Map<string, FinancialProfile> = new Map();
  private categories: Map<string, SpendingCategory> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private fixedExpensePayments: Map<string, FixedExpensePayment> = new Map();
  private balanceAdjustments: BalanceAdjustment[] = [];

  /**
   * Financial Profiles
   */
  addProfile(profile: FinancialProfile): void {
    this.financialProfiles.set(profile.id, { ...profile });
  }

  getProfile(id: string): FinancialProfile | null {
    const profile = this.financialProfiles.get(id);
    return profile ? { ...profile } : null;
  }

  getAllProfiles(): FinancialProfile[] {
    return Array.from(this.financialProfiles.values()).map(p => ({ ...p }));
  }

  updateProfile(id: string, updates: Partial<FinancialProfile>): void {
    const profile = this.financialProfiles.get(id);
    if (profile) {
      this.financialProfiles.set(id, { ...profile, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteProfile(id: string): void {
    this.financialProfiles.delete(id);
  }

  /**
   * Categories
   */
  addCategory(category: SpendingCategory): void {
    this.categories.set(category.id, { ...category });
  }

  getCategory(id: string): SpendingCategory | null {
    const category = this.categories.get(id);
    return category ? { ...category } : null;
  }

  getAllCategories(): SpendingCategory[] {
    return Array.from(this.categories.values()).map(c => ({ ...c }));
  }

  updateCategory(id: string, updates: Partial<SpendingCategory>): void {
    const category = this.categories.get(id);
    if (category) {
      this.categories.set(id, { ...category, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteCategory(id: string): void {
    this.categories.delete(id);
  }

  /**
   * Transactions
   */
  addTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, { ...transaction });
  }

  getTransaction(id: string): Transaction | null {
    const transaction = this.transactions.get(id);
    return transaction ? { ...transaction } : null;
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).map(t => ({ ...t }));
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transaction = this.transactions.get(id);
    if (transaction) {
      this.transactions.set(id, { ...transaction, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteTransaction(id: string): void {
    this.transactions.delete(id);
  }

  /**
   * Fixed Expense Payments
   */
  addFixedExpensePayment(payment: FixedExpensePayment): void {
    this.fixedExpensePayments.set(payment.id, { ...payment });
  }

  getFixedExpensePayment(id: string): FixedExpensePayment | null {
    const payment = this.fixedExpensePayments.get(id);
    return payment ? { ...payment } : null;
  }

  getAllFixedExpensePayments(): FixedExpensePayment[] {
    return Array.from(this.fixedExpensePayments.values()).map(p => ({ ...p }));
  }

  updateFixedExpensePayment(id: string, updates: Partial<FixedExpensePayment>): void {
    const payment = this.fixedExpensePayments.get(id);
    if (payment) {
      this.fixedExpensePayments.set(id, { ...payment, ...updates, id, updatedAt: new Date().toISOString() });
    }
  }

  deleteFixedExpensePayment(id: string): void {
    this.fixedExpensePayments.delete(id);
  }

  /**
   * Balance Adjustments
   */
  addBalanceAdjustment(adjustment: BalanceAdjustment): void {
    this.balanceAdjustments.push({ ...adjustment });
  }

  getBalanceAdjustments(): BalanceAdjustment[] {
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
