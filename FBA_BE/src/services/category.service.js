/**
 * Category Service
 * 
 * Manages spending categories (Daily, Usage-based, Fixed)
 */

import { SpendingCategory, SpendingCategoryType} from '../models/index';
import { categoryRepository} from '../repositories/category.repository';
import { transactionRepository} from '../repositories/transaction.repository';
import { AppError} from '../errors/app-error';

export class CategoryService {
  /**
   * Create spending category
   */
  create(data: {
    name;
    type;
    allocatedAmountCents;
    preferredDailyAmountCents?;
    protected?;
    expectedAmountCents?;
    dueDate?;
    recurring?;}): SpendingCategory {
    // Validate required fields by type
    if (data.type === SpendingCategoryType.DAILY_TIME_BASED) {
      if (!data.preferredDailyAmountCents || data.preferredDailyAmountCents <= 0) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Daily categories must have preferredDailyAmountCents > 0',
          statusCode});}} else if (data.type === SpendingCategoryType.FIXED_ONE_TIME) {
      if (!data.expectedAmountCents || !data.dueDate) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Fixed categories must have expectedAmountCents and dueDate',
          statusCode});}}

    // Calculate next displayOrder based on existing categories
    const allCategories = categoryRepository.findAll();
    const nextDisplayOrder = allCategories.length > 0
      ? Math.max(...allCategories.map(cat => cat.displayOrder)) + 1
      ;

    return categoryRepository.create({
      ...data,
      active,
      displayOrder});}

  /**
   * Get all categories
   */
  getAll()] {
    return categoryRepository.findAll();}

  /**
   * Get active categories
   */
  getActive()] {
    return categoryRepository.findActive();}

  /**
   * Get category by ID
   */
  getById(id): SpendingCategory {
    const category = categoryRepository.findById(id);
    if (!category) {
      throw new AppError({
        code: 'CATEGORY_NOT_FOUND',
        message: `Category not found: ${id}`,
        statusCode});}
    return category;}

  /**
   * Get categories by type
   */
  getByType(type)] {
    return categoryRepository.findByType(type);}

  /**
   * Update category
   */
  update(
    id,
    data, 'id' | 'createdAt'>>): SpendingCategory {
    const category = this.getById(id);

    // Validate updates by type
    if (category.type === SpendingCategoryType.DAILY_TIME_BASED) {
      if (data.preferredDailyAmountCents !== undefined && data.preferredDailyAmountCents <= 0) {
        throw new AppError({
          code: 'INVALID_CATEGORY_DATA',
          message: 'Daily categories must have preferredDailyAmountCents > 0',
          statusCode});}}

    return categoryRepository.update(id, data);}

  /**
   * Deactivate category (soft delete)
   */
  deactivate(id): SpendingCategory {
    this.getById(id);
    return categoryRepository.deactivate(id);}

  /**
   * Delete category (hard delete)
   * Only if no transactions reference it
   */
  delete(id) {
    this.getById(id);

    // Check for transactions
    const transactions = transactionRepository.findByCategory(id);
    if (transactions.length > 0) {
      throw new AppError({
        code: 'CATEGORY_HAS_TRANSACTIONS',
        message: `Cannot delete category with ${transactions.length} transactions. Deactivate instead.`,
        statusCode,
        details: { transactionCount: transactions.length},});}

    categoryRepository.delete(id);}

  /**
   * Get category spending total
   */
  getSpendingTotal(categoryId) {
    const transactions = transactionRepository.findByCategory(categoryId);
    return transactions.reduce((sum, t) => sum + t.amountCents, 0);}

  /**
   * Get category remaining allocation
   */
  getRemainingAllocation(categoryId) {
    const category = this.getById(categoryId);
    const spent = this.getSpendingTotal(categoryId);
    return Math.max(0, category.allocatedAmountCents - spent);}

  /**
   * Get category utilisation percentage
   */
  getUtilisationPercentage(categoryId) {
    const category = this.getById(categoryId);
    const spent = this.getSpendingTotal(categoryId);

    if (category.allocatedAmountCents === 0) return 0;
    return (spent / category.allocatedAmountCents) * 100;}

  /**
   * Reorder categories by ID array
   */
  reorder(categoryIds)] {
    // Validate all IDs exist
    categoryIds.forEach(id => this.getById(id));

    // Update display order for each category
    categoryIds.forEach((id, index) => {
      categoryRepository.update(id, {
        displayOrder});});

    // Return categories in new order
    return categoryIds.map(id => this.getById(id));}}

export const categoryService = new CategoryService();


