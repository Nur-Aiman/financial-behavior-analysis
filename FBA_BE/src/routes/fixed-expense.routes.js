/**
 * Fixed Expense Routes
 */

import { Router } from 'express';
import { FixedExpenseController } from '../controllers/fixed-expense.controller.js';

export const fixedExpenseRoutes = Router();

fixedExpenseRoutes.get('/', FixedExpenseController.getAll);
fixedExpenseRoutes.get('/unpaid', FixedExpenseController.getUnpaid);
fixedExpenseRoutes.get('/overdue', FixedExpenseController.getOverdue);
fixedExpenseRoutes.post('/:categoryId/pay', FixedExpenseController.pay);
fixedExpenseRoutes.post('/:categoryId/reverse-payment', FixedExpenseController.reversePayment);




