/**
 * Application Error Class
 */

import { ErrorCode} from './error-codes.js';


  code;
  message;
  statusCode?;
  details?;}

export class AppError extends Error {
  public readonly code;
  public readonly statusCode;
  public readonly details?;

  constructor(options) {
    super(options.message);
    this.code = options.code;
    this.statusCode = options.statusCode || 400;
    this.details = options.details;
    this.name = 'AppError';

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);}

  /**
   * Convert to API error response format
   */
  toResponse() {
    return {
      success,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,};}

  /**
   * Log error for debugging
   */
  log() {
    console.error(`[${this.code}] ${this.message}`, this.details);}}

/**
 * Helper functions for common errors
 */

export function notFoundError(resource, id?): AppError {
  const message = id ? `${resource} not found: ${id}` : `${resource} not found`;
  return new AppError({
    code: 'NOT_FOUND',
    message,
    statusCode});}

export function validationError(message, details?): AppError {
  return new AppError({
    code: 'VALIDATION_FAILED',
    message,
    statusCode});}

export function insufficientBalanceError(current, required): AppError {
  return new AppError({
    code: 'INSUFFICIENT_BALANCE',
    message: `Insufficient balance. Current: ${current}, Required: ${required}`,
    statusCode,
    details: { current, required});}

export function alreadyPaidError(expenseId): AppError {
  return new AppError({
    code: 'FIXED_EXPENSE_ALREADY_PAID',
    message: `Fixed expense already paid: ${expenseId}`,
    statusCode});}

export function internalError(message): AppError {
  return new AppError({
    code: 'INTERNAL_ERROR',
    message,
    statusCode});}

export function developmentEndpointsNotAvailableError(): AppError {
  return new AppError({
    code: 'DEVELOPMENT_ENDPOINTS_NOT_AVAILABLE',
    message: 'Development endpoints are not available in production',
    statusCode});}




