/**
 * Transaction Repository
 */

import { Transaction, TransactionType} from '../models/index';
import { store} from '../storage/in-memory.store';
import { generateId} from '../utils/id.utils';
import { isDateInRange} from '../utils/date.utils';
import { getDatabase} from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class TransactionRepository {
  /**
   * Create a new transaction
   */
  async create(data, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const transaction= {
      id: generateId(),
      ...data,
      createdAt,
      updatedAt};
    store.addTransaction(transaction);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: transaction.id,
          category_id: transaction.categoryId || null,
          type: transaction.type,
          amount_cents: transaction.amountCents,
          transaction_date: transaction.transactionDate,
          merchant: transaction.merchant || null,
          description: transaction.description || null,
          notes: transaction.notes || null,
          source: transaction.source,
          linked_fixed_expense_payment_id: transaction.linkedFixedExpensePaymentId || null,
          created_at,
          updated_at};
        await db('transactions').insert(dbData);
        console.log(`âœ… Transaction saved to database: ${transaction.id}`);} catch (err) {
        console.error('âŒ Error persisting transaction to database:', err.message);}}

    return transaction;}

  /**
   * Find transaction by ID
   */
  findById(id): Transaction | null {
    return store.getTransaction(id);}

  /**
   * Find all transactions
   */
  findAll()] {
    return store.getAllTransactions();}

  /**
   * Find transactions by category
   */
  findByCategory(categoryId)] {
    return this.findAll().filter(t => t.categoryId === categoryId);}

  /**
   * Find transactions by type
   */
  findByType(type)] {
    return this.findAll().filter(t => t.type === type);}

  /**
   * Find transactions on a specific date
   */
  findByDate(dateStr)] {
    return this.findAll().filter(t => t.transactionDate === dateStr);}

  /**
   * Find transactions within a date range
   */
  findByDateRange(startDateStr, endDateStr)] {
    return this.findAll().filter(t =>
      isDateInRange(t.transactionDate, startDateStr, endDateStr));}

  /**
   * Find transactions by category and date range
   */
  findByCategoryAndDateRange(
    categoryId,
    startDateStr,
    endDateStr)] {
    return this.findByCategory(categoryId).filter(t =>
      isDateInRange(t.transactionDate, startDateStr, endDateStr));}

  /**
   * Find transaction linked to fixed expense payment
   */
  findByFixedExpensePaymentId(paymentId): Transaction | null {
    const transactions = this.findAll();
    return transactions.find(t => t.linkedFixedExpensePaymentId === paymentId) || null;}

  /**
   * Update transaction
   */
  async update(id, data, 'id' | 'createdAt'>>): Promise<Transaction> {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Transaction not found: ${id}`);}

    const now = new Date().toISOString();
    store.updateTransaction(id, {
      ...data,
      updatedAt});

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData= {
          updated_at};

        if (data.categoryId !== undefined) dbData.category_id = data.categoryId || null;
        if (data.type !== undefined) dbData.type = data.type;
        if (data.amountCents !== undefined) dbData.amount_cents = data.amountCents;
        if (data.transactionDate !== undefined) dbData.transaction_date = data.transactionDate;
        if (data.merchant !== undefined) dbData.merchant = data.merchant || null;
        if (data.description !== undefined) dbData.description = data.description || null;
        if (data.notes !== undefined) dbData.notes = data.notes || null;
        if (data.source !== undefined) dbData.source = data.source;
        if (data.linkedFixedExpensePaymentId !== undefined) dbData.linked_fixed_expense_payment_id = data.linkedFixedExpensePaymentId || null;

        await db('transactions').where('id', id).update(dbData);
        console.log(`âœ… Transaction updated in database: ${id}`);} catch (err) {
        console.error(`âŒ Error persisting transaction update to database: ${err.message}`);}}

    return this.findById(id)!;}

  /**
   * Delete transaction
   */
  async delete(id): Promise<void> {
    store.deleteTransaction(id);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('transactions').where('id', id).del();
        console.log(`âœ… Transaction deleted from database: ${id}`);} catch (err) {
        console.error(`âŒ Error persisting transaction deletion to database: ${err.message}`);}}}

  /**
   * Clear all transactions
   */
  clear(): void {
    const transactions = this.findAll();
    transactions.forEach(t => this.delete(t.id));}}

export const transactionRepository = new TransactionRepository();

