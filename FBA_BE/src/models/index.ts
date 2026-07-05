/**
 * Enums and Models for Financial Behavior Analysis
 * All currency values are stored as integer cents (e.g., 100000 = RM1000.00)
 */

export enum SpendingCategoryType {
  DAILY_TIME_BASED = 'DAILY_TIME_BASED',
  USAGE_BASED = 'USAGE_BASED',
  FIXED_ONE_TIME = 'FIXED_ONE_TIME',
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT',
}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  FIXED_EXPENSE_PAYMENT = 'FIXED_EXPENSE_PAYMENT',
  SYSTEM_ADJUSTMENT = 'SYSTEM_ADJUSTMENT',
}

export enum FixedExpensePaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export type ForecastStatus = 'SAFE' | 'CAUTION' | 'AT_RISK' | 'EXCEEDED';
export type WarningLevel = 'INFO' | 'WARNING' | 'CRITICAL';

/**
 * FinancialProfile: Single per application
 * All amounts in cents
 */
export interface FinancialProfile {
  id: string;
  currency: string; // e.g., 'MYR'
  expectedSalaryCents: number;
  openingBalanceCents: number;
  currentBalanceCents: number;
  salaryCycleStartDate: string; // ISO date string: YYYY-MM-DD
  nextPayday: string; // ISO date string: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

/**
 * SpendingCategory
 * Supports three types with different validation rules
 */
export interface SpendingCategory {
  id: string;
  name: string;
  type: SpendingCategoryType;
  allocatedAmountCents: number;
  preferredDailyAmountCents?: number; // Required for DAILY_TIME_BASED
  protected?: boolean; // Only for USAGE_BASED
  expectedAmountCents?: number; // For FIXED_ONE_TIME
  dueDate?: string; // ISO date: YYYY-MM-DD, for FIXED_ONE_TIME
  recurring?: boolean; // For FIXED_ONE_TIME
  active: boolean;
  displayOrder: number; // Controls sort order in UI
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction: Record of actual money movement
 */
export interface Transaction {
  id: string;
  categoryId?: string; // Null for INCOME or BALANCE_ADJUSTMENT
  type: TransactionType;
  source: TransactionSource;
  amountCents: number;
  transactionDate: string; // ISO date: YYYY-MM-DD
  merchant?: string;
  description?: string;
  notes?: string;
  linkedFixedExpensePaymentId?: string; // Link to fixed expense payment
  createdAt: string;
  updatedAt: string;
}

/**
 * FixedExpensePayment: Tracks bill payments
 */
export interface FixedExpensePayment {
  id: string;
  categoryId: string; // Reference to FIXED_ONE_TIME category
  expectedAmountCents: number;
  actualAmountCents?: number;
  dueDate: string; // ISO date: YYYY-MM-DD
  paymentDate?: string; // ISO date: YYYY-MM-DD
  status: FixedExpensePaymentStatus;
  transactionId?: string; // Link to created transaction
  createdAt: string;
  updatedAt: string;
}

/**
 * BalanceAdjustment: Track manual balance corrections
 */
export interface BalanceAdjustment {
  id: string;
  previousBalanceCents: number;
  newBalanceCents: number;
  adjustmentAmountCents: number;
  reason: string;
  createdAt: string;
}

/**
 * DailyForecast: Forecast for a single daily category
 */
export interface DailyForecast {
  categoryId: string;
  categoryName: string;
  forecastDate: string; // ISO date: YYYY-MM-DD
  remainingDays: number;
  preferredDailyAmountCents: number;
  recommendedDailyAmountCents: number;
  actualSpentTodayCents: number;
  remainingCategoryAllocationCents: number;
  explanation: string;
  status: ForecastStatus;
}

/**
 * Comprehensive forecast summary
 */
export interface FinancialForecast {
  forecastDate: string;
  currentBalanceCents: number;
  remainingDays: number;
  nextPayday: string;
  reservedFixedExpensesCents: number;
  protectedUsageAllocationCents: number;
  dailySpendingPoolCents: number;
  safelyAvailableBalanceCents: number;
  recommendedTotalSpendingTodayCents: number;
  projectedBalanceOnPaydayCents: number;
  dailyForecasts: DailyForecast[];
  warnings: Warning[];
}

/**
 * Warning: Financial alerts for user
 */
export interface Warning {
  level: WarningLevel;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Dashboard Summary
 */
export interface DashboardSummary {
  currentBalanceCents: number;
  reservedFixedExpensesCents: number;
  protectedUsageAllocationCents: number;
  safelyAvailableBalanceCents: number;
  remainingDays: number;
  nextPayday: string;
  expectedSalaryCents: number;
  recommendedSpendingTodayCents: number;
  projectedBalanceOnPaydayCents: number;
  totalCategories: number;
  activeTransactionsThisMonth: number;
}

/**
 * Category Utilisation
 */
export interface CategoryUtilisation {
  categoryId: string;
  categoryName: string;
  type: SpendingCategoryType;
  allocatedAmountCents: number;
  spentAmountCents: number;
  remainingAmountCents: number;
  utilisationPercentage: number;
  status: ForecastStatus;
}

/**
 * Spending trend
 */
export interface SpendingTrend {
  date: string;
  totalSpentCents: number;
  byCategory: Record<string, number>;
}

/**
 * Planned vs Actual
 */
export interface PlannedVsActual {
  categoryId: string;
  categoryName: string;
  plannedAmountCents: number;
  actualAmountCents: number;
  varianceCents: number;
  variancePercentage: number;
}
