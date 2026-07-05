/**
 * Financial Profile Controller
 */

import { Request, Response, NextFunction} from 'express';
import { financialProfileService} from '../services/financial-profile.service';
import { createFinancialProfileSchema, updateFinancialProfileSchema} from '../validators/schemas';
import { successResponse} from '../utils/response.utils';

export class FinancialProfileController {
  /**
   * POST /api/profile
   * Create financial profile
   */
  static async create(req, res, next) {
    try {
      const data = createFinancialProfileSchema.parse(req.body);
      const profile = financialProfileService.create(data);
      res.status(201).json(successResponse(profile, 'Profile created successfully'));} catch (err) {
      next(err);}}

  /**
   * GET /api/profile
   * Get active financial profile
   */
  static async getProfile(_req, res, next) {
    try {
      const profile = financialProfileService.getProfile();
      res.json(successResponse(profile, 'Profile retrieved successfully'));} catch (err) {
      next(err);}}

  /**
   * PUT /api/profile
   * Update financial profile
   */
  static async update(req, res, next) {
    try {
      const data = updateFinancialProfileSchema.parse(req.body);
      // Zod allows nullable optional fields, but service doesn't accept null
      // This is safe because we only pass non-null values
      const profile = financialProfileService.updateProfile(data);
      res.json(successResponse(profile, 'Profile updated successfully'));} catch (err) {
      next(err);}}

  /**
   * GET /api/profile/remaining-days
   * Get remaining days until payday
   */
  static async getRemainingDays(_req, res, next) {
    try {
      const remainingDays = financialProfileService.getRemainingDays();
      res.json(successResponse({ remainingDays}, 'Remaining days calculated'));} catch (err) {
      next(err);}}




