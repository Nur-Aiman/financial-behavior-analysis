/**
 * Fixed Expense Routes
 */

import { Router} from 'express';
import { FixedExpenseController} from '../controllers/fixed-expense.controller';

export const fixedExpenseRoutes = Router();

fixedExpenseRoutes.get('/', FixedExpenseController.getAll);
fixedExpenseRoutes.get('/unpaid', FixedExpenseController.getUnpaid);
fixedExpenseRoutes.get('/overdue', FixedExpenseController.getOverdue);
fixedExpenseRoutes.post('/:categoryId/pay', FixedExpenseController.payExpense);
fixedExpenseRoutes.post('/:categoryId/reverse-payment', FixedExpenseController.reversePayment);




