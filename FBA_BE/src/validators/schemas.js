/**
 * Request Validation Schemas using Zod
 */

import { z } from 'zod';
import { SpendingCategoryType, TransactionType } from '../models/index';

// Common schemas
const currencySchema = z.string().length(3, 'Currency code must be 3 characters');
const amountCentsSchema = z.number().int().nonnegative('Amount must be a non-negative integer');
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format (YYYY-MM-DD)');
// Accepts both YYYY-MM-DD and full ISO datetime strings
const nullableIsoDateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid ISO date format').transform((val) => val.split('T')[0]), // Extract date from ISO datetime
  z.null(),
  z.literal(''), // Allow empty strings
]).transform((val) => val === '' ? null ); // Convert empty strings to null
const uuidSchema = z.string().uuid('Invalid UUID format');

// Financial Profile schemas
export const createFinancialProfileSchema = z.object({
  currency: currencySchema.default('MYR'),
  expectedSalaryCents,
  openingBalanceCents: amountCentsSchema.optional(),
  currentBalanceCents,
  salaryCycleStartDate,
  nextPayday}).transform((data) => ({
  ...data,
  openingBalanceCents: data.openingBalanceCents ?? data.currentBalanceCents,
}));

export const updateFinancialProfileSchema = z.object({
  expectedSalaryCents: amountCentsSchema.optional(),
  openingBalanceCents: amountCentsSchema.optional(),
  currentBalanceCents: amountCentsSchema.optional(),
  salaryCycleStartDate: nullableIsoDateSchema.optional(),
  nextPayday: nullableIsoDateSchema.optional(),
});




// Balance schemas
export const updateBalanceSchema = z.object({
  newBalanceCents: z.number().int(),
  reason: z.string().min(1, 'Reason is required').max(255),
});



// Category schemas
const categoryTypeSchema = z.enum([
  SpendingCategoryType.DAILY_TIME_BASED,
  SpendingCategoryType.USAGE_BASED,
  SpendingCategoryType.FIXED_ONE_TIME,
]);

export const createCategorySchema = z
  .object({
    name: z.string().min(1, 'Category name is required').max(50),
    type,
    allocatedAmountCents,
    preferredDailyAmountCents: amountCentsSchema.optional(),
    protected: z.boolean().optional().default(false),
    expectedAmountCents: amountCentsSchema.optional(),
    dueDate: nullableIsoDateSchema.optional(),
    recurring: z.boolean().optional().default(false),
    active: z.boolean().optional().default(true),
  })
  .refine(
    data => {
      // DAILY_TIME_BASED must have preferredDailyAmountCents
      if (data.type === SpendingCategoryType.DAILY_TIME_BASED) {
        return data.preferredDailyAmountCents !== undefined && data.preferredDailyAmountCents > 0;
      }
      return true;
    },
    {
      message: 'DAILY_TIME_BASED categories must have preferredDailyAmountCents > 0',
      path: ['preferredDailyAmountCents'],
    }
  )
  .refine(
    data => {
      // FIXED_ONE_TIME must have expectedAmountCents and dueDate
      if (data.type === SpendingCategoryType.FIXED_ONE_TIME) {
        return data.expectedAmountCents !== undefined && data.dueDate !== undefined;
      }
      return true;
    },
    {
      message: 'FIXED_ONE_TIME categories must have expectedAmountCents and dueDate',
      path: ['expectedAmountCents'],
    }
  );

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  allocatedAmountCents: amountCentsSchema.optional(),
  preferredDailyAmountCents: amountCentsSchema.optional(),
  protected: z.boolean().optional(),
  expectedAmountCents: amountCentsSchema.optional(),
  dueDate: nullableIsoDateSchema.optional(),
  recurring: z.boolean().optional(),
  active: z.boolean().optional(),
});




// Transaction schemas
const transactionTypeSchema = z.nativeEnum(TransactionType);

export const createTransactionSchema = z.object({
  categoryId: uuidSchema.optional(),
  type,
  amountCents: z.number().int().positive('Amount must be positive'),
  transactionDate,
  merchant: z.string().max(100).optional(),
  description: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();




// Fixed Expense Payment schemas
export const payFixedExpenseSchema = z.object({
  actualAmountCents,
  paymentDate});



// Query filter schemas
export const categoryFilterSchema = z.object({
  type: categoryTypeSchema.optional(),
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

export const transactionFilterSchema = z.object({
  categoryId: uuidSchema.optional(),
  type: transactionTypeSchema.optional(),
  dateFrom: nullableIsoDateSchema.optional(),
  dateTo: nullableIsoDateSchema.optional(),
});



