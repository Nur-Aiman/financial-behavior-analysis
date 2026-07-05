/**
 * Spending Category Repository
 */

import { SpendingCategory, SpendingCategoryType } from '../models/index';
import { store } from '../storage/in-memory.store';
import { generateId } from '../utils/id.utils';
import { getDatabase } from '../database/connection';

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';

export class CategoryRepository {
  /**
   * Create a new category
   */
  create(data, 'id' | 'createdAt' | 'updatedAt'>): SpendingCategory {
    const now = new Date().toISOString();
    const category= {
      id: generateId(),
      ...data,
      createdAt,
      updatedAt};
    store.addCategory(category);

    // Persist to database
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
          created_at,
          updated_at};
        db('spending_categories').insert(dbData).catch((err) => {
          console.error('Error inserting category to database:', err);
        });
      } catch (err) {
        console.error('Error persisting category to database:', err);
      }
    }

    return category;
  }

  /**
   * Find category by ID
   */
  findById(id): SpendingCategory | null {
    return store.getCategory(id);
  }

  /**
   * Find all categories, sorted by displayOrder
   */
  findAll()] {
    return store.getAllCategories().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Find all active categories
   */
  findActive()] {
    return this.findAll().filter(c => c.active);
  }

  /**
   * Find categories by type
   */
  findByType(type)] {
    return this.findAll().filter(c => c.type === type);
  }

  /**
   * Find active categories by type
   */
  findActiveByType(type)] {
    return this.findActive().filter(c => c.type === type);
  }

  /**
   * Update category
   */
  update(id, data, 'id' | 'createdAt'>>): SpendingCategory {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Category not found: ${id}`);
    }

    const now = new Date().toISOString();
    store.updateCategory(id, {
      ...data,
      updatedAt});

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const dbData= {
          updated_at};

        if (data.name !== undefined) dbData.name = data.name;
        if (data.type !== undefined) dbData.type = data.type;
        if (data.allocatedAmountCents !== undefined) dbData.allocated_amount_cents = data.allocatedAmountCents;
        if (data.preferredDailyAmountCents !== undefined) dbData.preferred_daily_amount_cents = data.preferredDailyAmountCents || null;
        if (data.expectedAmountCents !== undefined) dbData.expected_amount_cents = data.expectedAmountCents || null;
        if (data.dueDate !== undefined) dbData.due_date = data.dueDate || null;
        if (data.recurring !== undefined) dbData.recurring = data.recurring;
        if (data.protected !== undefined) dbData.protected = data.protected;
        if (data.displayOrder !== undefined) dbData.display_order = data.displayOrder;
        if (data.active !== undefined) dbData.active = data.active;

        db('spending_categories').where('id', id).update(dbData).catch((err) => {
          console.error('Error updating category in database:', err);
        });
      } catch (err) {
        console.error('Error persisting category update to database:', err);
      }
    }

    return this.findById(id)!;
  }

  /**
   * Deactivate category (soft delete)
   */
  deactivate(id): SpendingCategory {
    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        const now = new Date().toISOString();
        db('spending_categories')
          .where('id', id)
          .update({ active, updated_at})
          .catch((err) => {
            console.error('Error deactivating category in database:', err);
          });
      } catch (err) {
        console.error('Error persisting category deactivation to database:', err);
      }
    }

    return this.update(id, { active});
  }

  /**
   * Delete category (hard delete)
   */
  delete(id): void {
    store.deleteCategory(id);

    // Persist to database
    if (USE_REAL_DB) {
      try {
        const db = getDatabase();
        db('spending_categories').where('id', id).del().catch((err) => {
          console.error('Error deleting category from database:', err);
        });
      } catch (err) {
        console.error('Error persisting category deletion to database:', err);
      }
    }
  }

  /**
   * Clear all categories
   */
  clear(): void {
    const categories = this.findAll();
    categories.forEach(c => this.delete(c.id));
  }
}

export const categoryRepository = new CategoryRepository();
