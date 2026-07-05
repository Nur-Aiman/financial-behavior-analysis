/**
 * Fixed Expense Payment Repository
 */

import { FixedExpensePayment, FixedExpensePaymentStatus} from '../models/index';
import { store} from '../storage/in-memory.store';
import { generateId} from '../utils/id.utils';
import { isDateInPast} from '../utils/date.utils';
import { getDatabase} from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class FixedExpenseRepository {
  /**
   * Create a new fixed expense payment
   */
  async create(data, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const payment= {
      id: generateId(),
      ...data,
      createdAt,
      updatedAt};
    store.addFixedExpensePayment(payment);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: payment.id,
          category_id: payment.categoryId,
          expected_amount_cents: payment.expectedAmountCents,
          actual_amount_cents: payment.actualAmountCents || null,
          due_date: payment.dueDate,
          payment_date: payment.paymentDate || null,
          status: payment.status,
          transaction_id: payment.transactionId || null,
          created_at,
          updated_at};
        await db('fixed_expense_payments').insert(dbData);
        console.log(`âœ… Fixed expense payment saved to database: ${payment.id}`);} catch (err) {
        console.error(`âŒ Error persisting fixed expense payment to database: ${err.message}`);}}

    return payment;}

  /**
   * Find payment by ID
   */
  findById(id) {
    return store.getFixedExpensePayment(id);}

  /**
   * Find all payments
   */
  findAll()] {
    return store.getAllFixedExpensePayments();}

  /**
   * Find payments for a category
   */
  findByCategory(categoryId)] {
    return this.findAll().filter(p => p.categoryId === categoryId);}

  /**
   * Find all unpaid payments
   */
  findUnpaid()] {
    return this.findAll().filter(p => p.status === FixedExpensePaymentStatus.UNPAID);}

  /**
   * Find all paid payments
   */
  findPaid()] {
    return this.findAll().filter(p => p.status === FixedExpensePaymentStatus.PAID);}

  /**
   * Find all overdue payments
   */
  findOverdue()] {
    return this.findUnpaid().filter(p => isDateInPast(p.dueDate));}

  /**
   * Find unpaid payment for a category
   */
  findUnpaidByCategory(categoryId) {
    const payments = this.findByCategory(categoryId);
    return payments.find(p => p.status === FixedExpensePaymentStatus.UNPAID) || null;}

  /**
   * Find payment by transaction ID
   */
  findByTransactionId(transactionId) {
    const payments = this.findAll();
    return payments.find(p => p.transactionId === transactionId) || null;}

  /**
   * Update payment
   */
  async update(id, data, 'id' | 'createdAt'>>) {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Payment not found: ${id}`);}

    const now = new Date().toISOString();
    store.updateFixedExpensePayment(id, {
      ...data,
      updatedAt});

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData= {
          updated_at};

        if (data.categoryId !== undefined) dbData.category_id = data.categoryId;
        if (data.expectedAmountCents !== undefined) dbData.expected_amount_cents = data.expectedAmountCents;
        if (data.actualAmountCents !== undefined) dbData.actual_amount_cents = data.actualAmountCents || null;
        if (data.dueDate !== undefined) dbData.due_date = data.dueDate;
        if (data.paymentDate !== undefined) dbData.payment_date = data.paymentDate || null;
        if (data.status !== undefined) dbData.status = data.status;
        if (data.transactionId !== undefined) dbData.transaction_id = data.transactionId || null;

        await db('fixed_expense_payments').where('id', id).update(dbData);
        console.log(`âœ… Fixed expense payment updated in database: ${id}`);} catch (err) {
        console.error(`âŒ Error persisting fixed expense payment update to database: ${err.message}`);}}

    return this.findById(id)!;}

  /**
   * Delete payment
   */
  async delete(id) {
    store.deleteFixedExpensePayment(id);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('fixed_expense_payments').where('id', id).del();
        console.log(`âœ… Fixed expense payment deleted from database: ${id}`);} catch (err) {
        console.error(`âŒ Error persisting fixed expense payment deletion to database: ${err.message}`);}}

  /**
   * Clear all payments
   */
  clear() {
    const payments = this.findAll();
    payments.forEach(p => this.delete(p.id));}}

export const fixedExpenseRepository = new FixedExpenseRepository();



