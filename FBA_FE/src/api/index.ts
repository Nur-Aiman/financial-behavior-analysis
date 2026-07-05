/**
 * API Services Index
 * Export all API service modules
 */

export { profileAPI } from './profile';
export { balanceAPI } from './balance';
export { categoryAPI } from './categories';
export { transactionAPI } from './transactions';
export { forecastAPI } from './forecast';
export { dashboardAPI } from './dashboard';
export { apiClient } from './client';
export type { BalanceResponse, AdjustmentResponse } from './balance';
export type { CategoryFilters, CategoryWithStats } from './categories';
export type { TransactionFilters, TransactionWithAmount } from './transactions';
export type { ProjectedBalance } from './forecast';
export type { SpendingTrendItem, PlannedVsActualItem, ProjectedBalanceItem } from './dashboard';
