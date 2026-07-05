/**
 * Development Controller
 * 
 * Only available outside production
 */

import { Request, Response, NextFunction } from 'express';
import { clearAllData, seedData } from '../storage/seed-data';
import { store } from '../storage/in-memory.store';
import { successResponse } from '../utils/response.utils';

export class DevelopmentController {
  /**
   * POST /api/dev/reset
   * Clear all data
   */
  static async reset(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearAllData();
      res.json(successResponse({ cleared: true }, 'All data cleared'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/dev/seed
   * Load seed data with example scenario
   */
  static async seed(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      store.clear();
      seedData();
      res.json(
        successResponse(
          {
            seeded: true,
            message: 'Example scenario loaded: RM1000 budget, 20 days until payday, 5 categories',
          },
          'Seed data loaded'
        )
      );
    } catch (err) {
      next(err);
    }
  }
}
