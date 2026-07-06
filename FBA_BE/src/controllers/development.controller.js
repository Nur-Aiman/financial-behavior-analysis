/**
 * Development Controller
 * 
 * Only available outside production
 */

import { clearAllData, seedData } from '../storage/seed-data.js';
import { store } from '../storage/in-memory.store.js';
import { successResponse } from '../utils/response.utils.js';

export class DevelopmentController {
  /**
   * POST /api/dev/reset
   * Clear all data
   */
  static async reset(_req, res, next) {
    try {
      clearAllData();
      res.json(successResponse({ cleared}, 'All data cleared'));} catch (err) {
      next(err);}}

  /**
   * POST /api/dev/seed
   * Load seed data with example scenario
   */
  static async seed(_req, res, next) {
    try {
      store.clear();
      seedData();
      res.json(
        successResponse(
          {
            seeded,
            message: 'Example scenario loaded, 5 categories',},
          'Seed data loaded'));} catch (err) {
      next(err);}}





}
