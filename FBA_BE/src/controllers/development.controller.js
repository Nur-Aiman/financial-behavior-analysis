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
  static async reset(_req, res, next): Promise<void> {
    try {
      clearAllData();
      res.json(successResponse({ cleared}, 'All data cleared'));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/dev/seed
   * Load seed data with example scenario
   */
  static async seed(_req, res, next): Promise<void> {
    try {
      store.clear();
      seedData();
      res.json(
        successResponse(
          {
            seeded,
            message: 'Example scenario loaded, 5 categories',
          },
          'Seed data loaded'
        )
      );
    } catch (err) {
      next(err);
    }
  }
}
