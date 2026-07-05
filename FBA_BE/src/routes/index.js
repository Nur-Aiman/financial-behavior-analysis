/**
 * Main Routes Index
 */

import { Router} from 'express';
import { financialProfileRoutes} from './financial-profile.routes';
import { balanceRoutes} from './balance.routes';
import { categoryRoutes} from './category.routes';
import { transactionRoutes} from './transaction.routes';
import { fixedExpenseRoutes} from './fixed-expense.routes';
import { forecastRoutes} from './forecast.routes';
import { dashboardRoutes} from './dashboard.routes';
import { developmentRoutes} from './development.routes';

const router = Router();

router.use('/profile', financialProfileRoutes);
router.use('/balance', balanceRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/fixed-expenses', fixedExpenseRoutes);
router.use('/forecast', forecastRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/dev', developmentRoutes);

export default router;

