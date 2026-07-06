/**
 * Category Controller
 */

import { categoryService } from '../services/category.service.js';
import { createCategorySchema, updateCategorySchema, categoryFilterSchema } from '../validators/schemas.js';
import { successResponse } from '../utils/response.utils.js';
import { formatCentsAsRinggit } from '../utils/money.utils.js';

export class CategoryController {
  /**
   * POST /api/categories
   * Create spending category
   */
  static async create(req, res, next) {
    try {
      const data = createCategorySchema.parse(req.body);
      // Zod allows nullable optional fields, but service doesn't accept null
      // This is safe because we only pass non-null values
      const category = categoryService.create(data);
      res.status(201).json(successResponse(category, 'Category created'));} catch (err) {
      next(err);}}

  /**
   * GET /api/categories
   * Get all categories with optional filters
   */
  static async getAll(req, res, next) {
    try {
      const filters = categoryFilterSchema.parse(req.query);
      let categories = categoryService.getAll();

      if (filters.type) {
        categories = categories.filter(c => c.type === filters.type);}

      if (filters.active !== undefined) {
        categories = categories.filter(c => c.active === filters.active);}

      const enriched = categories.map(cat => {
        const spent = categoryService.getSpendingTotal(cat.id);
        const remaining = categoryService.getRemainingAllocation(cat.id);
        return {
          ...cat,
          allocatedAmount: formatCentsAsRinggit(cat.allocatedAmountCents),
          preferredDailyAmount: cat.preferredDailyAmountCents
            ? formatCentsAsRinggit(cat.preferredDailyAmountCents) : undefined,
          expectedAmount: cat.expectedAmountCents ? formatCentsAsRinggit(cat.expectedAmountCents) : undefined,
          spent,
          remaining,
          spentAmount: formatCentsAsRinggit(spent),
          remainingAmount: formatCentsAsRinggit(remaining),};});

      res.json(successResponse(enriched, 'Categories retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/categories/:id
   * Get category by ID
   */
  static async getById(req, res, next) {
    try {
      const category = categoryService.getById(req.params.id);
      const spent = categoryService.getSpendingTotal(category.id);
      const remaining = categoryService.getRemainingAllocation(category.id);
      const utilisationPercent = categoryService.getUtilisationPercentage(category.id);

      res.json(
        successResponse(
          {
            ...category,
            allocatedAmount: formatCentsAsRinggit(category.allocatedAmountCents),
            spent: formatCentsAsRinggit(spent),
            remaining: formatCentsAsRinggit(remaining),
            utilisationPercentage},
          'Category retrieved'));} catch (err) {
      next(err);}}

  /**
   * PUT /api/categories/:id
   * Update category
   */
  static async update(req, res, next) {
    try {
      const data = updateCategorySchema.parse(req.body);
      // Zod allows nullable optional fields, but service doesn't accept null
      // This is safe because we only pass non-null values
      const category = categoryService.update(req.params.id, data);
      res.json(successResponse(category, 'Category updated'));} catch (err) {
      next(err);}}

  /**
   * PATCH /api/categories/:id/deactivate
   * Deactivate category
   */
  static async deactivate(req, res, next) {
    try {
      const category = await categoryService.deactivate(req.params.id);
      res.json(successResponse(category, 'Category deactivated'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/categories/:id
   * Delete category
   */
  static async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);
      res.json(successResponse({ id: req.params.id}, 'Category deleted'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/categories/reorder
   * Update category display order
   */
  static async reorder(req, res, next) {
    try {
      const { categoryIds } = req.body;
      if (!Array.isArray(categoryIds)) {
        throw new Error('categoryIds must be an array');
      }
      const categories = categoryService.reorder(categoryIds);
      res.json(successResponse(categories, 'Categories reordered successfully'));
    } catch (err) {
      next(err);
    }
  }
}




