/**
 * Transaction Repository
 */

import { store } from '../storage/in-memory.store.js';
import { generateId } from '../utils/id.utils.js';
import { getDatabase } from '../database/connection.js';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export const transactionRepository = {
  async create(data) {
    const now = new Date().toISOString();
    const transaction = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.addTransaction(transaction);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: transaction.id,
          category_id: transaction.categoryId,
          amount_cents: transaction.amountCents,
          type: transaction.type,
          source: transaction.source,
          description: transaction.description,
          transaction_date: transaction.transactionDate,
          created_at: now,
          updated_at: now,
        };
        await db('transactions').insert(dbData);
        console.log(`✅ Transaction saved to database: ${transaction.id}`);
      } catch (err) {
        console.error(`❌ Error persisting transaction: ${err.message}`);
      }
    }

    return transaction;
  },

  findById(id) {
    return store.getTransaction(id);
  },

  findAll() {
    return store.getAllTransactions();
  },

  async update(id, data) {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Transaction not found: ${id}`);

    const now = new Date().toISOString();
    store.updateTransaction(id, { ...data, updatedAt: now });

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = { updated_at: now };
        if (data.categoryId !== undefined) dbData.category_id = data.categoryId;
        if (data.amountCents !== undefined) dbData.amount_cents = data.amountCents;
        if (data.description !== undefined) dbData.description = data.description;
        await db('transactions').where('id', id).update(dbData);
        console.log(`✅ Transaction updated in database: ${id}`);
      } catch (err) {
        console.error(`❌ Error updating transaction: ${err.message}`);
      }
    }

    return this.findById(id);
  },

  async delete(id) {
    store.deleteTransaction(id);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('transactions').where('id', id).del();
        console.log(`✅ Transaction deleted from database: ${id}`);
      } catch (err) {
        console.error(`❌ Error deleting transaction: ${err.message}`);
      }
    }
  },

  findByCategory(categoryId) {
    return this.findAll().filter(t => t.categoryId === categoryId);
  },

  findByDateRange(startDate, endDate) {
    return this.findAll().filter(t => {
      const tDate = new Date(t.transactionDate);
      return tDate >= new Date(startDate) && tDate <= new Date(endDate);
    });
  },

  clear() {
    const all = this.findAll();
    all.forEach(t => this.delete(t.id));
  },
};
