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
  BalanceAdjustment,} from '../models/index';

export class InMemoryStore {
  private financialProfiles= new Map();
  private categories= new Map();
  private transactions= new Map();
  private fixedExpensePayments= new Map();
  private balanceAdjustments= [];

  /**
   * Financial Profiles
   */
  addProfile(profile) {
    this.financialProfiles.set(profile.id, { ...profile});}

  getProfile(id) {
    const profile = this.financialProfiles.get(id);
    return profile ? { ...profile} ;}

  getAllProfiles()] {
    return Array.from(this.financialProfiles.values()).map(p => ({ ...p}));}

  updateProfile(id, updates) {
    const profile = this.financialProfiles.get(id);
    if (profile) {
      this.financialProfiles.set(id, { ...profile, ...updates, id, updatedAt: new Date().toISOString()});}}

  deleteProfile(id) {
    this.financialProfiles.delete(id);}

  /**
   * Categories
   */
  addCategory(category) {
    this.categories.set(category.id, { ...category});}

  getCategory(id) {
    const category = this.categories.get(id);
    return category ? { ...category} ;}

  getAllCategories()] {
    return Array.from(this.categories.values()).map(c => ({ ...c}));}

  updateCategory(id, updates) {
    const category = this.categories.get(id);
    if (category) {
      this.categories.set(id, { ...category, ...updates, id, updatedAt: new Date().toISOString()});}}

  deleteCategory(id) {
    this.categories.delete(id);}

  /**
   * Transactions
   */
  addTransaction(transaction) {
    this.transactions.set(transaction.id, { ...transaction});}

  getTransaction(id) {
    const transaction = this.transactions.get(id);
    return transaction ? { ...transaction} ;}

  getAllTransactions()] {
    return Array.from(this.transactions.values()).map(t => ({ ...t}));}

  updateTransaction(id, updates) {
    const transaction = this.transactions.get(id);
    if (transaction) {
      this.transactions.set(id, { ...transaction, ...updates, id, updatedAt: new Date().toISOString()});}}

  deleteTransaction(id) {
    this.transactions.delete(id);}

  /**
   * Fixed Expense Payments
   */
  addFixedExpensePayment(payment) {
    this.fixedExpensePayments.set(payment.id, { ...payment});}

  getFixedExpensePayment(id) {
    const payment = this.fixedExpensePayments.get(id);
    return payment ? { ...payment} ;}

  getAllFixedExpensePayments()] {
    return Array.from(this.fixedExpensePayments.values()).map(p => ({ ...p}));}

  updateFixedExpensePayment(id, updates) {
    const payment = this.fixedExpensePayments.get(id);
    if (payment) {
      this.fixedExpensePayments.set(id, { ...payment, ...updates, id, updatedAt: new Date().toISOString()});}}

  deleteFixedExpensePayment(id) {
    this.fixedExpensePayments.delete(id);}

  /**
   * Balance Adjustments
   */
  addBalanceAdjustment(adjustment) {
    this.balanceAdjustments.push({ ...adjustment});}

  getBalanceAdjustments()] {
    return this.balanceAdjustments.map(a => ({ ...a}));}

  /**
   * Utility: Clear all data
   */
  clear() {
    this.financialProfiles.clear();
    this.categories.clear();
    this.transactions.clear();
    this.fixedExpensePayments.clear();
    this.balanceAdjustments = [];
  }
}
export const store = new InMemoryStore();




