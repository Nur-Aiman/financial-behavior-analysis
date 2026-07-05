/**
 * Dashboard Routes
 */

import { Router} from 'express';
import { DashboardController} from '../controllers/dashboard.controller';

export const dashboardRoutes = Router();

dashboardRoutes.get('/summary', DashboardController.getSummary);
dashboardRoutes.get('/category-utilisation', DashboardController.getCategoryUtilisation);
dashboardRoutes.get('/spending-trend', DashboardController.getSpendingTrend);
dashboardRoutes.get('/planned-vs-actual', DashboardController.getPlannedVsActual);
dashboardRoutes.get('/projected-balances', DashboardController.getProjectedBalances);




