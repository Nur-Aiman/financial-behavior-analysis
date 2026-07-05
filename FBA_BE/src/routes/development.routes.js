/**
 * Development Routes
 * Only available outside production
 */

import { Router} from 'express';
import { DevelopmentController} from '../controllers/development.controller';

export const developmentRoutes = Router();

developmentRoutes.post('/reset', DevelopmentController.reset);
developmentRoutes.post('/seed', DevelopmentController.seed);

