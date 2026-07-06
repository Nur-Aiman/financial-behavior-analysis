/**
 * Enums and Models for Financial Behavior Analysis
 * All currency values are stored in cents (e.g., 100000 = RM1000.00)
 */

// Spending Category Types
export const SpendingCategoryType = {
  DAILY_TIME_BASED: 'DAILY_TIME_BASED',
  USAGE_BASED: 'USAGE_BASED',
  FIXED_ONE_TIME: 'FIXED_ONE_TIME',
};

// Transaction Types
export const TransactionType = {
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
  BALANCE_ADJUSTMENT: 'BALANCE_ADJUSTMENT',
};

// Transaction Sources
export const TransactionSource = {
  MANUAL: 'MANUAL',
  FIXED_EXPENSE_PAYMENT: 'FIXED_EXPENSE_PAYMENT',
  SYSTEM_ADJUSTMENT: 'SYSTEM_ADJUSTMENT',
};

// Fixed Expense Payment Status
export const FixedExpensePaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
};

/**
 * Model interfaces for documentation purposes
 * (TypeScript interfaces converted to JSDoc comments for documentation)
 */

/**
 * FinancialProfile: Single per application
 * All amounts in cents
 * @typedef {Object} FinancialProfile
 * @property {string} id
 * @property {string} currency - e.g., 'MYR'
 * @property {number} expectedSalaryCents
 * @property {number} openingBalanceCents
 * @property {number} currentBalanceCents
 * @property {string} salaryCycleStartDate - ISO date string: YYYY-MM-DD
 * @property {string} nextPayday - ISO date string: YYYY-MM-DD
 * @property {boolean} [useCalculatedBalance] - If true, use expected salary - total spent for balance display
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * SpendingCategory
 * Supports three types with different validation rules
 * @typedef {Object} SpendingCategory
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} allocatedAmountCents
 * @property {number} [preferredDailyAmountCents] - Required for DAILY_TIME_BASED
 * @property {boolean} [protected] - Only for USAGE_BASED
 * @property {number} [expectedAmountCents] - For FIXED_ONE_TIME
 * @property {string} [dueDate] - ISO date: YYYY-MM-DD, for FIXED_ONE_TIME
 * @property {boolean} [recurring] - For FIXED_ONE_TIME
 * @property {boolean} active
 * @property {number} displayOrder - Controls sort order in UI
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Transaction: Record of actual money movement
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} [categoryId] - Null for INCOME or BALANCE_ADJUSTMENT
 * @property {string} type
 * @property {string} source
 * @property {number} amountCents
 * @property {string} transactionDate - ISO date: YYYY-MM-DD
 * @property {string} [merchant]
 * @property {string} [description]
 * @property {string} [notes]
 * @property {string} [linkedFixedExpensePaymentId] - Link to fixed expense payment
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * FixedExpensePayment: Tracks bill payments
 * @typedef {Object} FixedExpensePayment
 * @property {string} id
 * @property {string} categoryId - Reference to FIXED_ONE_TIME category
 * @property {number} expectedAmountCents
 * @property {number} [actualAmountCents]
 * @property {string} dueDate - ISO date: YYYY-MM-DD
 * @property {string} [paymentDate] - ISO date: YYYY-MM-DD
 * @property {string} status
 * @property {string} [transactionId] - Link to created transaction
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * BalanceAdjustment: Track manual balance corrections
 * @typedef {Object} BalanceAdjustment
 * @property {string} id
 * @property {number} previousBalanceCents
 * @property {number} newBalanceCents
 * @property {number} adjustmentAmountCents
 * @property {string} reason
 * @property {string} createdAt
 */

/**
 * DailyForecast: Forecast for a single daily category
 * @typedef {Object} DailyForecast
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {string} forecastDate - ISO date: YYYY-MM-DD
 * @property {number} remainingDays
 * @property {number} preferredDailyAmountCents
 * @property {number} recommendedDailyAmountCents
 * @property {number} actualSpentTodayCents
 * @property {number} remainingCategoryAllocationCents
 * @property {string} explanation
 * @property {string} status
 */

/**
 * Comprehensive forecast summary
 * @typedef {Object} ForecastSummary
 * @property {string} forecastDate
 * @property {number} currentBalanceCents
 * @property {number} remainingDays
 * @property {string} nextPayday
 * @property {number} reservedFixedExpensesCents
 * @property {number} protectedUsageAllocationCents
 * @property {number} dailySpendingPoolCents
 * @property {number} safelyAvailableBalanceCents
 * @property {number} recommendedTotalSpendingTodayCents
 * @property {number} projectedBalanceOnPaydayCents
 * @property {DailyForecast[]} dailyForecasts
 * @property {Warning[]} warnings
 */

/**
 * Warning: Financial alerts for user
 * @typedef {Object} Warning
 * @property {string} level
 * @property {string} code
 * @property {string} message
 * @property {*} [details]
 */

/**
 * Dashboard Summary
 * @typedef {Object} DashboardSummary
 * @property {number} currentBalanceCents
 * @property {number} reservedFixedExpensesCents
 * @property {number} protectedUsageAllocationCents
 * @property {number} safelyAvailableBalanceCents
 * @property {number} remainingDays
 * @property {string} nextPayday
 * @property {number} expectedSalaryCents
 * @property {number} recommendedSpendingTodayCents
 * @property {number} projectedBalanceOnPaydayCents
 * @property {number} totalCategories
 * @property {number} activeTransactionsThisMonth
 */

/**
 * Category Utilisation
 * @typedef {Object} CategoryUtilisation
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {string} type
 * @property {number} allocatedAmountCents
 * @property {number} spentAmountCents
 * @property {number} remainingAmountCents
 * @property {number} utilisationPercentage
 * @property {string} status
 */

/**
 * Spending trend
 * @typedef {Object} SpendingTrend
 * @property {string} date
 * @property {number} totalSpentCents
 * @property {Object} byCategory
 */

/**
 * Planned vs Actual
 * @typedef {Object} PlannedVsActual
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {number} plannedAmountCents
 * @property {number} actualAmountCents
 * @property {number} varianceCents
 * @property {number} variancePercentage
 */




