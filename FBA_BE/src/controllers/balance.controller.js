/**
 * Balance Controller
 */

import { Request, Response, NextFunction} from 'express';
import { balanceService} from '../services/balance.service';
import { updateBalanceSchema} from '../validators/schemas';
import { successResponse} from '../utils/response.utils';
import { formatCentsAsRinggit} from '../utils/money.utils';

export class BalanceController {
  /**
   * GET /api/balance
   * Get current balance
   */
  static async getBalance(_req, res, next): Promise<void> {
    try {
      const currentBalanceCents = balanceService.getCurrentBalance();
      res.json(
        successResponse(
          {
            currentBalanceCents,
            currentBalance: formatCentsAsRinggit(currentBalanceCents),},
          'Balance retrieved'));} catch (err) {
      next(err);}}

  /**
   * PUT /api/balance
   * Update current balance with reason
   */
  static async updateBalance(req, res, next): Promise<void> {
    try {
      const data = updateBalanceSchema.parse(req.body);
      const adjustment = await balanceService.updateBalance(data.newBalanceCents, data.reason);
      res.json(
        successResponse(
          {
            adjustment,
            newBalance: formatCentsAsRinggit(adjustment.newBalanceCents),},
          'Balance updated successfully'));} catch (err) {
      next(err);}}

  /**
   * GET /api/balance/history
   * Get balance adjustment history
   */
  static async getHistory(_req, res, next): Promise<void> {
    try {
      const history = balanceService.getAdjustmentHistory();
      const enriched = history.map(adj => ({
        ...adj,
        previousBalance: formatCentsAsRinggit(adj.previousBalanceCents),
        newBalance: formatCentsAsRinggit(adj.newBalanceCents),
        adjustmentAmount: formatCentsAsRinggit(adj.adjustmentAmountCents),}));
      res.json(successResponse(enriched, 'Adjustment history retrieved'));} catch (err) {
      next(err);}}}

