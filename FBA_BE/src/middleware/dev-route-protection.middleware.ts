/**
 * Development Route Protection Middleware
 * Prevents /api/dev routes from being accessible in production
 */

import { Request, Response, NextFunction } from 'express';
import { developmentEndpointsNotAvailableError } from '../errors/app-error';

export const devRouteProtection = (_req: Request, _res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    throw developmentEndpointsNotAvailableError();
  }
  next();
};
