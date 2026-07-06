/**
 * Spending Category Repository
 */

import { store } from '../storage/in-memory.store.js';
import { generateId } from '../utils/id.utils.js';
import { getDatabase } from '../database/connection.js';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export const categoryRepository = {
  create(data) {
    const now = new Date().toISOString();
    const category = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.addCategory(category);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = {
          id: category.id,
          name: category.name,
          type: category.type,
          allocated_amount_cents: category.allocatedAmountCents,
          preferred_daily_amount_cents: category.preferredDailyAmountCents || null,
          expected_amount_cents: category.expectedAmountCents || null,
          due_date: category.dueDate || null,
          recurring: category.recurring || false,
          protected: category.protected || false,
          display_order: category.displayOrder,
          active: category.active,
          created_at: now,
          updated_at: now,
        };
        db('spending_categories').insert(dbData).catch((err) => {
          console.error('Error inserting category:', err);
        });
      } catch (err) {
        console.error('Error persisting category:', err);
      }
    }

    return category;
  },

  findById(id) {
    return store.getCategory(id);
  },

  findAll() {
    return store.getAllCategories().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async update(id, data) {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Category not found: ${id}`);

    const now = new Date().toISOString();
    store.updateCategory(id, { ...data, updatedAt: now });

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData = { updated_at: now };
        if (data.name !== undefined) dbData.name = data.name;
        if (data.allocatedAmountCents !== undefined) dbData.allocated_amount_cents = data.allocatedAmountCents;
        if (data.active !== undefined) dbData.active = data.active;
        if (data.displayOrder !== undefined) dbData.display_order = data.displayOrder;
        await db('spending_categories').where('id', id).update(dbData);
        console.log(`✅ Category updated in database: ${id}`);
      } catch (err) {
        console.error(`❌ Error updating category: ${err.message}`);
      }
    }

    return this.findById(id);
  },

  async delete(id) {
    store.deleteCategory(id);

    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        await db('spending_categories').where('id', id).del();
        console.log(`✅ Category deleted from database: ${id}`);
      } catch (err) {
        console.error(`❌ Error deleting category: ${err.message}`);
      }
    }
  },

  findByType(type) {
    return this.findAll().filter(c => c.type === type);
  },

  findActive() {
    return this.findAll().filter(c => c.active === true);
  },

  clear() {
    const all = this.findAll();
    all.forEach(c => this.delete(c.id));
  },
};
