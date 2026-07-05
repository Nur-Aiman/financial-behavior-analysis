/**
 * Forecast Routes
 */

import { Router} from 'express';
import { ForecastController} from '../controllers/forecast.controller';

export const forecastRoutes = Router();

forecastRoutes.get('/today', ForecastController.getToday);
forecastRoutes.get('/categories', ForecastController.getCategories);
forecastRoutes.get('/projected-balance', ForecastController.getProjectedBalance);
forecastRoutes.post('/recalculate', ForecastController.recalculate);

