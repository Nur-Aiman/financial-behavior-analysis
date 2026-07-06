/**
 * Fixed Expense Repository
 */

import { store } from '../storage/in-memory.store.js';
import { generateId } from '../utils/id.utils.js';
import { getDatabase } from '../database/connection.js';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export const fixedExpenseRepository = {
  async create(data) {
    const now = new Date().toISOString();
    const expense = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.addFixedExpense(expense);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: expense.id,
          category_id: expense.categoryId,
          expected_amount_cents: expense.expectedAmountCents,
          due_date: expense.dueDate,
          status: expense.status,
          actual_amount_cents: expense.actualAmountCents || null,
          payment_date: expense.paymentDate || null,
          transaction_id: expense.transactionId || null,
          created_at: now,
          updated_at: now,
        };
        await db('fixed_expenses').insert(dbData);
        console.log(`✅ Fixed expense saved to database: ${expense.id}`);
      } catch (err) {
        console.error(`❌ Error persisting fixed expense: ${err.message}`);
      }
    }

    return expense;
  },

  findById(id) {
    return store.getFixedExpense(id);
  },

  findAll() {
    return store.getAllFixedExpenses();
  },

  async update(id, data) {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Fixed expense not found: ${id}`);

    const now = new Date().toISOString();
    store.updateFixedExpense(id, { ...data, updatedAt: now });

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = { updated_at: now };
        if (data.status !== undefined) dbData.status = data.status;
        if (data.actualAmountCents !== undefined) dbData.actual_amount_cents = data.actualAmountCents;
        if (data.paymentDate !== undefined) dbData.payment_date = data.paymentDate;
        if (data.transactionId !== undefined) dbData.transaction_id = data.transactionId;
        await db('fixed_expenses').where('id', id).update(dbData);
        console.log(`✅ Fixed expense updated in database: ${id}`);
      } catch (err) {
        console.error(`❌ Error updating fixed expense: ${err.message}`);
      }
    }

    return this.findById(id);
  },

  async delete(id) {
    store.deleteFixedExpense(id);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('fixed_expenses').where('id', id).del();
        console.log(`✅ Fixed expense deleted from database: ${id}`);
      } catch (err) {
        console.error(`❌ Error deleting fixed expense: ${err.message}`);
      }
    }
  },

  findByCategory(categoryId) {
    return this.findAll().filter(e => e.categoryId === categoryId);
  },

  findByStatus(status) {
    return this.findAll().filter(e => e.status === status);
  },

  clear() {
    const all = this.findAll();
    all.forEach(e => this.delete(e.id));
  },
};
