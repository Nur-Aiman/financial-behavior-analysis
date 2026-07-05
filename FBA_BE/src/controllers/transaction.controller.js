/**
 * Transaction Controller
 */

import { Request, Response, NextFunction} from 'express';
import { transactionService} from '../services/transaction.service';
import { createTransactionSchema, updateTransactionSchema, transactionFilterSchema} from '../validators/schemas';
import { successResponse} from '../utils/response.utils';
import { formatCentsAsRinggit} from '../utils/money.utils';

export class TransactionController {
  /**
   * POST /api/transactions
   * Create transaction
   */
  static async create(req, res, next) {
    try {
      const data = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.createTransaction(data);
      res.status(201).json(
        successResponse(
          {
            ...transaction,
            amount: formatCentsAsRinggit(transaction.amountCents),},
          'Transaction created'));} catch (err) {
      next(err);}}

  /**
   * GET /api/transactions
   * Get all transactions with optional filters
   */
  static async getAll(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      // Remove null values for service function
      const cleanFilters = Object.fromEntries(
        Object.entries({
          categoryId: filters.categoryId,
          type: filters.type,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,}).filter(([_, v]) => v !== null));
      const transactions = transactionService.getTransactions(cleanFilters);

      const enriched = transactions
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .map(t => ({
          ...t,
          amount: formatCentsAsRinggit(t.amountCents),}));

      res.json(successResponse(enriched, 'Transactions retrieved'));} catch (err) {
      next(err);}}

  static async getById(req, res, next) {
    try {
      const transaction = transactionService.getTransaction(req.params.id);
      res.json(
        successResponse(
          {
            ...transaction,
            amount: formatCentsAsRinggit(transaction.amountCents),},
          'Transaction retrieved'));} catch (err) {
      next(err);}}

  /**
   * PUT /api/transactions/:id
   * Update transaction
   */
  static async update(req, res, next) {
    try {
      const data = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.updateTransaction(req.params.id, data);
      res.json(
        successResponse(
          {
            ...transaction,
            amount: formatCentsAsRinggit(transaction.amountCents),},
          'Transaction updated'));} catch (err) {
      next(err);}}

  /**
   * DELETE /api/transactions/:id
   * Delete transaction
   */
  static async delete(req, res, next) {
    try {
      await transactionService.deleteTransaction(req.params.id);
      res.json(successResponse({ id: req.params.id}, 'Transaction deleted'));} catch (err) {
      next(err);}}



