/**
 * API Response Utilities
 * 
 * Provides consistent response formatting across all endpoints
 */

/**
 * Create a success response
 */
export function successResponse(data, message) {
  return {
    success: true,
    data,
    message: message || 'Operation successful',
  };
}

/**
 * Create an error response
 */
export function errorResponse(code, message, details) {
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
export function paginatedResponse(data, page = 1, pageSize = 20) {
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
