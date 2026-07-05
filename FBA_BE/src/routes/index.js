/**
 * Main Routes Index
 */

import { Router} from 'express';
import { financialProfileRoutes} from './financial-profile.routes.js';
import { balanceRoutes} from './balance.routes.js';
import { categoryRoutes} from './category.routes.js';
import { transactionRoutes} from './transaction.routes.js';
import { fixedExpenseRoutes} from './fixed-expense.routes.js';
import { forecastRoutes} from './forecast.routes.js';
import { dashboardRoutes} from './dashboard.routes.js';
import { developmentRoutes} from './development.routes.js';

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




