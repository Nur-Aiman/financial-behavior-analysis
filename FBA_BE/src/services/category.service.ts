/**
 * Category Service
 * 
 * Manages spending categories (Daily, Usage-based, Fixed)
 */

import { SpendingCategory, SpendingCategoryType } from '../models/index';
import { categoryRepository } from '../repositories/category.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { AppError } from '../errors/app-error';

export class CategoryService {
  /**
   * Create spending category
   */
  create(data: {
    name: string;
    type: SpendingCategoryType;
    allocatedAmountCents: number;
    preferredDailyAmountCents?: number;
    protected?: boolean;
    expectedAmountCents?: number;
    dueDate?: string;
    recurring?: boolean;
  }): SpendingCategory {
    // Validate required fields by type
    if (data.type === SpendingCategoryType.DAILY_TIME_BASED) {
      if (!data.preferredDailyAmountCents || data.preferredDailyAmountCents <= 0) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Daily categories must have preferredDailyAmountCents > 0',
          statusCode: 400,
        });
      }
    } else if (data.type === SpendingCategoryType.FIXED_ONE_TIME) {
      if (!data.expectedAmountCents || !data.dueDate) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Fixed categories must have expectedAmountCents and dueDate',
          statusCode: 400,
        });
      }
    }

    // Calculate next displayOrder based on existing categories
    const allCategories = categoryRepository.findAll();
    const nextDisplayOrder = allCategories.length > 0
      ? Math.max(...allCategories.map(cat => cat.displayOrder)) + 1
      : 0;

    return categoryRepository.create({
      ...data,
      active: true,
      displayOrder: nextDisplayOrder,
    });
  }

  /**
   * Get all categories
   */
  getAll(): SpendingCategory[] {
    return categoryRepository.findAll();
  }

  /**
   * Get active categories
   */
  getActive(): SpendingCategory[] {
    return categoryRepository.findActive();
  }

  /**
   * Get category by ID
   */
  getById(id: string): SpendingCategory {
    const category = categoryRepository.findById(id);
    if (!category) {
      throw new AppError({
        code: 'CATEGORY_NOT_FOUND',
        message: `Category not found: ${id}`,
        statusCode: 404,
      });
    }
    return category;
  }

  /**
   * Get categories by type
   */
  getByType(type: SpendingCategoryType): SpendingCategory[] {
    return categoryRepository.findByType(type);
  }

  /**
   * Update category
   */
  update(
    id: string,
    data: Partial<Omit<SpendingCategory, 'id' | 'createdAt'>>
  ): SpendingCategory {
    const category = this.getById(id);

    // Validate updates by type
    if (category.type === SpendingCategoryType.DAILY_TIME_BASED) {
      if (data.preferredDailyAmountCents !== undefined && data.preferredDailyAmountCents <= 0) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Daily categories must have preferredDailyAmountCents > 0',
          statusCode: 400,
        });
      }
    }

    return categoryRepository.update(id, data);
  }

  /**
   * Deactivate category (soft delete)
   */
  deactivate(id: string): SpendingCategory {
    this.getById(id);
    return categoryRepository.deactivate(id);
  }

  /**
   * Delete category (hard delete)
   * Only if no transactions reference it
   */
  delete(id: string): void {
    this.getById(id);

    // Check for transactions
    const transactions = transactionRepository.findByCategory(id);
    if (transactions.length > 0) {
      throw new AppError({
        code: 'CATEGORY_HAS_TRANSACTIONS',
        message: `Cannot delete category with ${transactions.length} transactions. Deactivate instead.`,
        statusCode: 400,
        details: { transactionCount: transactions.length },
      });
    }

    categoryRepository.delete(id);
  }

  /**
   * Get category spending total
   */
  getSpendingTotal(categoryId: string): number {
    const transactions = transactionRepository.findByCategory(categoryId);
    return transactions.reduce((sum, t) => sum + t.amountCents, 0);
  }

  /**
   * Get category remaining allocation
   */
  getRemainingAllocation(categoryId: string): number {
    const category = this.getById(categoryId);
    const spent = this.getSpendingTotal(categoryId);
    return Math.max(0, category.allocatedAmountCents - spent);
  }

  /**
   * Get category utilisation percentage
   */
  getUtilisationPercentage(categoryId: string): number {
    const category = this.getById(categoryId);
    const spent = this.getSpendingTotal(categoryId);

    if (category.allocatedAmountCents === 0) return 0;
    return (spent / category.allocatedAmountCents) * 100;
  }

  /**
   * Reorder categories by ID array
   */
  reorder(categoryIds: string[]): SpendingCategory[] {
    // Validate all IDs exist
    categoryIds.forEach(id => this.getById(id));

    // Update display order for each category
    categoryIds.forEach((id, index) => {
      categoryRepository.update(id, {
        displayOrder: index,
      });
    });

    // Return categories in new order
    return categoryIds.map(id => this.getById(id));
  }
}

export const categoryService = new CategoryService();
