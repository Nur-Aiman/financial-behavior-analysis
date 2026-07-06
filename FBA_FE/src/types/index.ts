/**
 * Type definitions for Financial Behavior Analysis
 * Mirrored from backend models
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

export enum FixedExpensePaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export type ForecastStatus = 'SAFE' | 'CAUTION' | 'AT_RISK' | 'EXCEEDED';
export type WarningLevel = 'INFO' | 'WARNING' | 'CRITICAL';

// Financial Profile
export interface FinancialProfile {
  id: string;
  currency: string;
  expectedSalaryCents: number;
  openingBalanceCents: number;
  currentBalanceCents: number;
  salaryCycleStartDate: string;
  nextPayday: string;
  active: boolean;
  useCalculatedBalance?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Spending Category
export interface SpendingCategory {
  id: string;
  profileId: string;
  name: string;
  type: SpendingCategoryType;
  allocatedAmountCents: number;
  preferredDailyAmountCents?: number;
  protected: boolean;
  expectedAmountCents?: number;
  dueDate?: string;
  recurring: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transaction
export interface Transaction {
  id: string;
  profileId: string;
  categoryId?: string;
  type: TransactionType;
  amountCents: number;
  transactionDate: string;
  merchant?: string;
  description?: string;
  notes?: string;
  source: string;
  linkedTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Fixed Expense Payment
export interface FixedExpensePayment {
  id: string;
  categoryId: string;
  status: FixedExpensePaymentStatus;
  paymentDate?: string;
  actualAmountCents?: number;
  expectedAmountCents: number;
  dueDate: string;
  linkedTransactionId?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

// Balance Adjustment
export interface BalanceAdjustment {
  id: string;
  profileId: string;
  previousBalanceCents: number;
  newBalanceCents: number;
  adjustmentAmountCents: number;
  reason: string;
  createdAt: string;
}

// Daily Forecast
export interface DailyForecast {
  categoryId: string;
  categoryName: string;
  forecastDate: string;
  preferredDailyAmountCents: number;
  recommendedDailyAmountCents: number;
  actualSpentTodayCents: number;
  remainingCategoryAllocationCents: number;
  status: ForecastStatus;
  explanation: string;
}

// Warning
export interface Warning {
  id: string;
  code: string;
  level: WarningLevel;
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Financial Forecast
export interface FinancialForecast {
  profileId: string;
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
  status: ForecastStatus;
  dailyForecasts: DailyForecast[];
  warnings: Warning[];
  explanation: string;
}

// Dashboard Summary
export interface DashboardSummary {
  currentBalanceCents: number;
  remainingDays: number;
  nextPayday: string;
  expectedSalaryCents: number;
  reservedFixedExpensesCents: number;
  protectedUsageAllocationCents: number;
  safelyAvailableBalanceCents: number;
  recommendedSpendingTodayCents: number;
  projectedBalanceOnPaydayCents: number;
  status: ForecastStatus;
  warningCount: number;
}

// Category Utilisation
export interface CategoryUtilisation {
  categoryId: string;
  categoryName: string;
  categoryType: SpendingCategoryType;
  allocatedAmountCents: number;
  spentAmountCents: number;
  remainingAmountCents: number;
  utilisationPercentage: number;
  status: 'SAFE' | 'CAUTION' | 'AT_RISK' | 'EXCEEDED';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
