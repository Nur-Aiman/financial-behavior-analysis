/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { errorResponse } from '../utils/response.utils';

export const errorHandler = (err, _req, res, _next)=> {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const { issues } = err;
    res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Validation failed',
        {
          issues: issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        }
      )
    );
    return;
  }

  // Handle unexpected errors
  res.status(500).json(
    errorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? { error: err.message } )
  );
};
