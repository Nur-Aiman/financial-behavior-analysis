/**
 * Fixed Expense Payment Repository
 */

import { FixedExpensePayment, FixedExpensePaymentStatus } from '../models/index';
import { store } from '../storage/in-memory.store';
import { generateId } from '../utils/id.utils';
import { isDateInPast } from '../utils/date.utils';
import { getDatabase } from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class FixedExpenseRepository {
  /**
   * Create a new fixed expense payment
   */
  async create(data: Omit<FixedExpensePayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<FixedExpensePayment> {
    const now = new Date().toISOString();
    const payment: FixedExpensePayment = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
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
          created_at: now,
          updated_at: now,
        };
        await db('fixed_expense_payments').insert(dbData);
        console.log(`✅ Fixed expense payment saved to database: ${payment.id}`);
      } catch (err: any) {
        console.error(`❌ Error persisting fixed expense payment to database: ${err.message}`);
      }
    }

    return payment;
  }

  /**
   * Find payment by ID
   */
  findById(id: string): FixedExpensePayment | null {
    return store.getFixedExpensePayment(id);
  }

  /**
   * Find all payments
   */
  findAll(): FixedExpensePayment[] {
    return store.getAllFixedExpensePayments();
  }

  /**
   * Find payments for a category
   */
  findByCategory(categoryId: string): FixedExpensePayment[] {
    return this.findAll().filter(p => p.categoryId === categoryId);
  }

  /**
   * Find all unpaid payments
   */
  findUnpaid(): FixedExpensePayment[] {
    return this.findAll().filter(p => p.status === FixedExpensePaymentStatus.UNPAID);
  }

  /**
   * Find all paid payments
   */
  findPaid(): FixedExpensePayment[] {
    return this.findAll().filter(p => p.status === FixedExpensePaymentStatus.PAID);
  }

  /**
   * Find all overdue payments
   */
  findOverdue(): FixedExpensePayment[] {
    return this.findUnpaid().filter(p => isDateInPast(p.dueDate));
  }

  /**
   * Find unpaid payment for a category
   */
  findUnpaidByCategory(categoryId: string): FixedExpensePayment | null {
    const payments = this.findByCategory(categoryId);
    return payments.find(p => p.status === FixedExpensePaymentStatus.UNPAID) || null;
  }

  /**
   * Find payment by transaction ID
   */
  findByTransactionId(transactionId: string): FixedExpensePayment | null {
    const payments = this.findAll();
    return payments.find(p => p.transactionId === transactionId) || null;
  }

  /**
   * Update payment
   */
  async update(id: string, data: Partial<Omit<FixedExpensePayment, 'id' | 'createdAt'>>): Promise<FixedExpensePayment> {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Payment not found: ${id}`);
    }

    const now = new Date().toISOString();
    store.updateFixedExpensePayment(id, {
      ...data,
      updatedAt: now,
    });

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData: any = {
          updated_at: now,
        };

        if (data.categoryId !== undefined) dbData.category_id = data.categoryId;
        if (data.expectedAmountCents !== undefined) dbData.expected_amount_cents = data.expectedAmountCents;
        if (data.actualAmountCents !== undefined) dbData.actual_amount_cents = data.actualAmountCents || null;
        if (data.dueDate !== undefined) dbData.due_date = data.dueDate;
        if (data.paymentDate !== undefined) dbData.payment_date = data.paymentDate || null;
        if (data.status !== undefined) dbData.status = data.status;
        if (data.transactionId !== undefined) dbData.transaction_id = data.transactionId || null;

        await db('fixed_expense_payments').where('id', id).update(dbData);
        console.log(`✅ Fixed expense payment updated in database: ${id}`);
      } catch (err: any) {
        console.error(`❌ Error persisting fixed expense payment update to database: ${err.message}`);
      }
    }

    return this.findById(id)!;
  }

  /**
   * Delete payment
   */
  async delete(id: string): Promise<void> {
    store.deleteFixedExpensePayment(id);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('fixed_expense_payments').where('id', id).del();
        console.log(`✅ Fixed expense payment deleted from database: ${id}`);
      } catch (err: any) {
        console.error(`❌ Error persisting fixed expense payment deletion to database: ${err.message}`);
      }
    }
  }

  /**
   * Clear all payments
   */
  clear(): void {
    const payments = this.findAll();
    payments.forEach(p => this.delete(p.id));
  }
}

export const fixedExpenseRepository = new FixedExpenseRepository();
