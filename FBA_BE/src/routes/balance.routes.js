/**
 * Balance Routes
 */

import { Router} from 'express';
import { BalanceController} from '../controllers/balance.controller';

export const balanceRoutes = Router();

balanceRoutes.get('/', BalanceController.getBalance);
balanceRoutes.put('/', BalanceController.updateBalance);
balanceRoutes.get('/history', BalanceController.getHistory);


