/**
 * Enums and Models for Financial Behavior Analysis
 * All currency values are stored(e.g., 100000 = RM1000.00)
 */

export enum SpendingCategoryType {
  DAILY_TIME_BASED = 'DAILY_TIME_BASED',
  USAGE_BASED = 'USAGE_BASED',
  FIXED_ONE_TIME = 'FIXED_ONE_TIME',}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT',}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  FIXED_EXPENSE_PAYMENT = 'FIXED_EXPENSE_PAYMENT',
  SYSTEM_ADJUSTMENT = 'SYSTEM_ADJUSTMENT',}

export enum FixedExpensePaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',}




/**
 * FinancialProfile: Single per application
 * All amounts in cents
 */

  id;
  currency; // e.g., 'MYR'
  expectedSalaryCents;
  openingBalanceCents;
  currentBalanceCents;
  salaryCycleStartDate; // ISO date string: YYYY-MM-DD
  nextPayday; // ISO date string: YYYY-MM-DD
  createdAt;
  updatedAt;}

/**
 * SpendingCategory
 * Supports three types with different validation rules
 */

  id;
  name;
  type;
  allocatedAmountCents;
  preferredDailyAmountCents?; // Required for DAILY_TIME_BASED
  protected?; // Only for USAGE_BASED
  expectedAmountCents?; // For FIXED_ONE_TIME
  dueDate?; // ISO date: YYYY-MM-DD, for FIXED_ONE_TIME
  recurring?; // For FIXED_ONE_TIME
  active;
  displayOrder; // Controls sort order in UI
  createdAt;
  updatedAt;}

/**
 * Transaction: Record of actual money movement
 */

  id;
  categoryId?; // Null for INCOME or BALANCE_ADJUSTMENT
  type;
  source;
  amountCents;
  transactionDate; // ISO date: YYYY-MM-DD
  merchant?;
  description?;
  notes?;
  linkedFixedExpensePaymentId?; // Link to fixed expense payment
  createdAt;
  updatedAt;}

/**
 * FixedExpensePayment: Tracks bill payments
 */

  id;
  categoryId; // Reference to FIXED_ONE_TIME category
  expectedAmountCents;
  actualAmountCents?;
  dueDate; // ISO date: YYYY-MM-DD
  paymentDate?; // ISO date: YYYY-MM-DD
  status;
  transactionId?; // Link to created transaction
  createdAt;
  updatedAt;}

/**
 * BalanceAdjustment: Track manual balance corrections
 */

  id;
  previousBalanceCents;
  newBalanceCents;
  adjustmentAmountCents;
  reason;
  createdAt;}

/**
 * DailyForecast: Forecast for a single daily category
 */

  categoryId;
  categoryName;
  forecastDate; // ISO date: YYYY-MM-DD
  remainingDays;
  preferredDailyAmountCents;
  recommendedDailyAmountCents;
  actualSpentTodayCents;
  remainingCategoryAllocationCents;
  explanation;
  status;}

/**
 * Comprehensive forecast summary
 */

  forecastDate;
  currentBalanceCents;
  remainingDays;
  nextPayday;
  reservedFixedExpensesCents;
  protectedUsageAllocationCents;
  dailySpendingPoolCents;
  safelyAvailableBalanceCents;
  recommendedTotalSpendingTodayCents;
  projectedBalanceOnPaydayCents;
  dailyForecasts;
  warnings;}

/**
 * Warning: Financial alerts for user
 */

  level;
  code;
  message;
  details?;}

/**
 * Dashboard Summary
 */

  currentBalanceCents;
  reservedFixedExpensesCents;
  protectedUsageAllocationCents;
  safelyAvailableBalanceCents;
  remainingDays;
  nextPayday;
  expectedSalaryCents;
  recommendedSpendingTodayCents;
  projectedBalanceOnPaydayCents;
  totalCategories;
  activeTransactionsThisMonth;}

/**
 * Category Utilisation
 */

  categoryId;
  categoryName;
  type;
  allocatedAmountCents;
  spentAmountCents;
  remainingAmountCents;
  utilisationPercentage;
  status;}

/**
 * Spending trend
 */

  date;
  totalSpentCents;
  byCategory;}

/**
 * Planned vs Actual
 */

  categoryId;
  categoryName;
  plannedAmountCents;
  actualAmountCents;
  varianceCents;
  variancePercentage;}




