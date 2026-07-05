/**
 * Financial Profile Routes
 */

import { Router} from 'express';
import { FinancialProfileController} from '../controllers/financial-profile.controller';

export const financialProfileRoutes = Router();

financialProfileRoutes.post('/', FinancialProfileController.create);
financialProfileRoutes.get('/', FinancialProfileController.getProfile);
financialProfileRoutes.put('/', FinancialProfileController.update);
financialProfileRoutes.get('/remaining-days', FinancialProfileController.getRemainingDays);

