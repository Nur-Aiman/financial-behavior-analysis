/**
 * Validation Error Handler Middleware
 */

import { Request, Response, NextFunction} from 'express';
import { ZodError} from 'zod';
import { errorResponse} from '../utils/response.utils';

export const validationErrorHandler = (err, _req, res, next)=> {
  if (err instanceof ZodError) {
    res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Request validation failed',
        {
          issues: err.issues.map(issue => ({
            path: issue.path.join('.'),
            code: issue.code,
            message: issue.message,})),}));
    return;}

  next(err);};

