/**
 * Development Route Protection Middleware
 * Prevents /api/dev routes from being accessible in production
 */

import { developmentEndpointsNotAvailableError } from '../errors/app-error.js';

export const devRouteProtection = (_req, _res, next) => {
  if (process.env.NODE_ENV === 'production') {
    throw developmentEndpointsNotAvailableError();}
  next();};




