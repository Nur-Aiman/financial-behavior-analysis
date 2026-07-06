/**
 * Fixed Expense Controller
 */

import { fixedExpenseService } from '../services/fixed-expense.service.js';
import { successResponse } from '../utils/response.utils.js';

export class FixedExpenseController {
  static async getAll(_req, res, next) {
    try {
      const payments = fixedExpenseService.getAllFixedExpenses();
      res.json(successResponse(payments || [], 'Fixed expenses retrieved'));
    } catch (err) {
      next(err);
    }
  }

  static async getUnpaid(_req, res, next) {
    try {
      const payments = fixedExpenseService.getUnpaidExpenses();
      res.json(successResponse(payments || [], 'Unpaid expenses retrieved'));
    } catch (err) {
      next(err);
    }
  }

  static async getOverdue(_req, res, next) {
    try {
      fixedExpenseService.updateOverdueStatus();
      const payments = fixedExpenseService.getOverdueExpenses();
      res.json(successResponse(payments || [], 'Overdue expenses retrieved'));
    } catch (err) {
      next(err);
    }
  }

  static async pay(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { actualAmountCents, paymentDate } = req.body;
      const payment = fixedExpenseService.payExpense(categoryId, { actualAmountCents, paymentDate });
      res.json(successResponse(payment, 'Fixed expense paid'));
    } catch (err) {
      next(err);
    }
  }

  static async reversePayment(req, res, next) {
    try {
      const { categoryId } = req.params;
      const payment = fixedExpenseService.deleteExpense(categoryId);
      res.json(successResponse(payment, 'Payment reversed'));
    } catch (err) {
      next(err);
    }
  }
}
