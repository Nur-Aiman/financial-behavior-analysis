/**
 * Request Validation Schemas using Zod
 */

import { z } from 'zod';
import { SpendingCategoryType, TransactionType } from '../models/index.js';

// Common schemas
const currencySchema = z.string().length(3, 'Currency code must be 3 characters');
const amountCentsSchema = z.number().int().nonnegative('Amount must be a non-negative integer');
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format (YYYY-MM-DD)');

const nullableIsoDateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid ISO date format').transform((val) => val.split('T')[0]),
  z.null(),
  z.literal(''),
]).transform((val) => val === '' ? null : val);

const uuidSchema = z.string().uuid('Invalid UUID format');

// Financial Profile schemas
export const createFinancialProfileSchema = z.object({
  currency: currencySchema.default('MYR'),
  expectedSalaryCents: amountCentsSchema,
  openingBalanceCents: amountCentsSchema.optional(),
  currentBalanceCents: amountCentsSchema,
  salaryCycleStartDate: isoDateSchema,
  nextPayday: isoDateSchema,
}).transform((data) => ({
  ...data,
  openingBalanceCents: data.openingBalanceCents ?? data.currentBalanceCents,
}));

export const updateFinancialProfileSchema = z.object({
  expectedSalaryCents: amountCentsSchema.optional(),
  openingBalanceCents: amountCentsSchema.optional(),
  currentBalanceCents: amountCentsSchema.optional(),
  salaryCycleStartDate: nullableIsoDateSchema.optional(),
  nextPayday: nullableIsoDateSchema.optional(),
  useCalculatedBalance: z.boolean().optional(),
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
    type: categoryTypeSchema,
    allocatedAmountCents: amountCentsSchema,
    preferredDailyAmountCents: amountCentsSchema.optional(),
    protected: z.boolean().optional().default(false),
    expectedAmountCents: amountCentsSchema.optional(),
    dueDate: nullableIsoDateSchema.optional(),
    recurring: z.boolean().optional().default(false),
    active: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
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
    (data) => {
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
  type: transactionTypeSchema,
  amountCents: z.number().int().positive('Amount must be positive'),
  transactionDate: isoDateSchema,
  merchant: z.string().max(100).optional(),
  description: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTransactionSchema = z.object({
  categoryId: uuidSchema.optional(),
  type: transactionTypeSchema.optional(),
  amountCents: z.number().int().positive('Amount must be positive').optional(),
  transactionDate: isoDateSchema.optional(),
  merchant: z.string().max(100).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// Fixed Expense Payment schemas
export const payFixedExpenseSchema = z.object({
  actualAmountCents: amountCentsSchema,
  paymentDate: isoDateSchema,
});

// Query filter schemas
export const categoryFilterSchema = z.object({
  type: categoryTypeSchema.optional(),
  active: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export const transactionFilterSchema = z.object({
  categoryId: uuidSchema.optional(),
  type: transactionTypeSchema.optional(),
  dateFrom: nullableIsoDateSchema.optional(),
  dateTo: nullableIsoDateSchema.optional(),
});
