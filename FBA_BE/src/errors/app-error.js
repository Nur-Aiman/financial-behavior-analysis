/**
 * Application Error Class
 */

import { ERROR_CODES } from './error-codes.js';

export class AppError extends Error {
  constructor(options) {
    super(options.message);
    this.code = options.code;
    this.statusCode = options.statusCode || 400;
    this.details = options.details;
    this.name = 'AppError';

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert to API error response format
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }

  /**
   * Log error for debugging
   */
  log() {
    console.error(`[${this.code}] ${this.message}`, this.details);
  }
}

/**
 * Helper functions for common errors
 */

export function notFoundError(resource, id) {
  const message = id ? `${resource} not found: ${id}` : `${resource} not found`;
  return new AppError({
    code: 'NOT_FOUND',
    message,
    statusCode: 404,
  });
}

export function validationError(message, details) {
  return new AppError({
    code: 'VALIDATION_FAILED',
    message,
    statusCode: 400,
    details,
  });
}

export function insufficientBalanceError(current, required) {
  return new AppError({
    code: 'INSUFFICIENT_BALANCE',
    message: `Insufficient balance. Current: ${current}, Required: ${required}`,
    statusCode: 400,
    details: { current, required },
  });
}

export function alreadyPaidError(expenseId) {
  return new AppError({
    code: 'FIXED_EXPENSE_ALREADY_PAID',
    message: `Fixed expense already paid: ${expenseId}`,
    statusCode: 400,
  });
}

export function internalError(message) {
  return new AppError({
    code: 'INTERNAL_ERROR',
    message,
    statusCode: 500,
  });
}

export function developmentEndpointsNotAvailableError() {
  return new AppError({
    code: 'DEVELOPMENT_ENDPOINTS_NOT_AVAILABLE',
    message: 'Development endpoints are not available in production',
    statusCode: 403,
  });
}
