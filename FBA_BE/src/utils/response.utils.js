/**
 * API Response Utilities
 * 
 * Provides consistent response formatting across all endpoints
 */


  success;
  data;
  message?;}


  success;
  error: {
    code;
    message;
    details?;};}

/**
 * Create a success response
 */
export function successResponse<T>(
  data,
  message?): SuccessResponse<T> {
  return {
    success};}

/**
 * Create an error response
 */
export function errorResponse(
  code,
  message,
  details?): ErrorResponse {
  return {
    success,
    error: {
      code,
      message,
      details,},};}

/**
 * Create a paginated response
 */

  success;
  data;
  pagination: {
    total;
    page;
    pageSize;
    totalPages;};}

export function paginatedResponse<T>(
  data,
  page= 1,
  pageSize= 20): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    success,
    data: data.slice((page - 1) * pageSize, page * pageSize),
    pagination: {
      total,
      page,
      pageSize,
      totalPages,},};}

