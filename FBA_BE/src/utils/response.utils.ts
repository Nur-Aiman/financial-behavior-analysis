/**
 * API Response Utilities
 * 
 * Provides consistent response formatting across all endpoints
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Create a paginated response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function paginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 20
): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    success: true,
    data: data.slice((page - 1) * pageSize, page * pageSize),
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}
