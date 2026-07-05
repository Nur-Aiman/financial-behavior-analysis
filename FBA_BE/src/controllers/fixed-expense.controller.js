/**
 * Fixed Expense Controller
 */

import { Request, Response, NextFunction} from 'express';
import { fixedExpenseService} from '../services/fixed-expense.service';
import { payFixedExpenseSchema} from '../validators/schemas';
import { successResponse} from '../utils/response.utils';
import { formatCentsAsRinggit} from '../utils/money.utils';

export class FixedExpenseController {
  /**
   * GET /api/fixed-expenses
   * Get all fixed expenses
   */
  static async getAll(_req, res, next) {
    try {
      const payments = fixedExpenseService.getAllFixedExpenses();
      fixedExpenseService.updateOverdueStatus();

      const enriched = payments.map(p => ({
        ...p,
        expectedAmount: formatCentsAsRinggit(p.expectedAmountCents),
        actualAmount: p.actualAmountCents ? formatCentsAsRinggit(p.actualAmountCents)}));

      res.json(successResponse(enriched, 'Fixed expenses retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/fixed-expenses/unpaid
   * Get unpaid fixed expenses
   */
  static async getUnpaid(_req, res, next) {
    try {
      const payments = fixedExpenseService.getUnpaidExpenses();

      const enriched = payments.map(p => ({
        ...p,
        expectedAmount: formatCentsAsRinggit(p.expectedAmountCents),
        daysUntilDue: fixedExpenseService.getDaysUntilDue(p.categoryId),}));

      res.json(successResponse(enriched, 'Unpaid expenses retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/fixed-expenses/overdue
   * Get overdue fixed expenses
   */
  static async getOverdue(_req, res, next) {
    try {
      fixedExpenseService.updateOverdueStatus();
      const payments = fixedExpenseService.getOverdueExpenses();

      const enriched = payments.map(p => ({
        ...p,
        expectedAmount: formatCentsAsRinggit(p.expectedAmountCents),}));

      res.json(successResponse(enriched, 'Overdue expenses retrieved'));} catch (err) {
      next(err);}}

  /**
   * POST /api/fixed-expenses/:categoryId/pay
   * Pay fixed expense
   */
  static async payExpense(req, res, next) {
    try {
      const data = payFixedExpenseSchema.parse(req.body);
      const transaction = await fixedExpenseService.payFixedExpense(
        req.params.categoryId,
        data.actualAmountCents,
        data.paymentDate);

      res.status(201).json(
        successResponse(
          {
            ...transaction,
            amount: formatCentsAsRinggit(transaction.amountCents),},
          'Payment recorded'));} catch (err) {
      next(err);}}

  /**
   * POST /api/fixed-expenses/:categoryId/reverse-payment
   * Reverse fixed expense payment
   */
  static async reversePayment(req, res, next) {
    try {
      fixedExpenseService.reverseFixedExpensePayment(req.params.categoryId);
      res.json(successResponse({ categoryId: req.params.categoryId}, 'Payment reversed'));} catch (err) {
      next(err);}}




