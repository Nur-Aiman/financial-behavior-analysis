/**
 * Request Logger Middleware
 */

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req, res, next)=> {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode < 400 ? '✓' : res.statusCode < 500 ? '⚠' : '✗';
    console.log(
      `${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
