/**
 * Fixed Expense Service
 * 
 * Manages fixed expenses (bills, subscriptions, loans)
 * Handles payment tracking and reversals
 */

import {
  FixedExpensePayment,
  FixedExpensePaymentStatus,
  Transaction,
  TransactionType,
  TransactionSource,} from '../models/index';
import { fixedExpenseRepository} from '../repositories/fixed-expense.repository';
import { categoryService} from './category.service';
import { transactionRepository} from '../repositories/transaction.repository';
import { balanceService} from './balance.service';
import { AppError} from '../errors/app-error';
import { getTodayIsoString} from '../utils/date.utils';

export class FixedExpenseService {
  /**
   * Get all fixed expenses
   */
  getAllFixedExpenses()] {
    return fixedExpenseRepository.findAll();}

  /**
   * Get unpaid fixed expenses
   */
  getUnpaidExpenses()] {
    return fixedExpenseRepository.findUnpaid();}

  /**
   * Get paid fixed expenses
   */
  getPaidExpenses()] {
    return fixedExpenseRepository.findPaid();}

  /**
   * Get overdue fixed expenses
   */
  getOverdueExpenses()] {
    return fixedExpenseRepository.findOverdue();}

  /**
   * Get fixed expense for a category
   */
  getExpenseForCategory(categoryId): FixedExpensePayment | null {
    return fixedExpenseRepository.findUnpaidByCategory(categoryId);}

  /**
   * Create fixed expense payment record
   */
  async createFixedExpense(categoryId): Promise<FixedExpensePayment> {
    // Verify category is FIXED_ONE_TIME type
    const category = categoryService.getById(categoryId);

    const { SpendingCategoryType} = require('../models');
    if (category.type !== SpendingCategoryType.FIXED_ONE_TIME) {
      throw new AppError({
        code: 'CATEGORY_TYPE_MISMATCH',
        message: `Category must be FIXED_ONE_TIME type, got ${category.type}`,
        statusCode});}

    // Create payment record
    return await fixedExpenseRepository.create({
      categoryId,
      expectedAmountCents: category.expectedAmountCents!,
      dueDate: category.dueDate!,
      status: FixedExpensePaymentStatus.UNPAID,});}

  /**
   * Pay fixed expense
   */
  async payFixedExpense(categoryId, actualAmountCents, paymentDate): Promise<Transaction> {
    if (actualAmountCents <= 0) {
      throw new AppError({
        code: 'NEGATIVE_TRANSACTION_AMOUNT',
        message: 'Payment amount must be positive',
        statusCode});}

    // Find unpaid payment
    const payment = fixedExpenseRepository.findUnpaidByCategory(categoryId);
    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_ALREADY_PAID',
        message: `No unpaid fixed expense for category: ${categoryId}`,
        statusCode});}

    // Check balance
    const currentBalance = balanceService.getCurrentBalance();
    if (currentBalance < actualAmountCents) {
      throw new AppError({
        code: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance for payment`,
        statusCode,
        details: {
          available,
          required},});}

    // Deduct from balance
    await balanceService.deductFromBalance(actualAmountCents);

    // Create linked expense transaction
    const transaction = await transactionRepository.create({
      categoryId,
      type: TransactionType.EXPENSE,
      source: TransactionSource.FIXED_EXPENSE_PAYMENT,
      amountCents,
      transactionDate,
      description: `Fixed expense payment: ${categoryService.getById(categoryId).name}`,
      linkedFixedExpensePaymentId: payment.id,});

    // Update payment record
    await fixedExpenseRepository.update(payment.id, {
      status: FixedExpensePaymentStatus.PAID,
      actualAmountCents,
      paymentDate,
      transactionId: transaction.id,});

    return transaction;}

  /**
   * Reverse fixed expense payment
   */
  reverseFixedExpensePayment(categoryId): void {
    const payment = fixedExpenseRepository.findByCategory(categoryId).find(
      p => p.status === FixedExpensePaymentStatus.PAID);

    if (!payment) {
      throw new AppError({
        code: 'FIXED_EXPENSE_NOT_PAID',
        message: `No paid fixed expense to reverse for category: ${categoryId}`,
        statusCode});}

    // Find linked transaction
    const transaction = transactionRepository.findByFixedExpensePaymentId(payment.id);
    if (!transaction) {
      throw new AppError({
        code: 'INVALID_OPERATION',
        message: `No linked transaction found for payment: ${payment.id}`,
        statusCode});}

    // Restore balance
    const currentBalance = balanceService.getCurrentBalance();
    const financialProfileRepository = require('../repositories/financial-profile.repository')
      .financialProfileRepository;
    const profile = financialProfileRepository.getActive();

    financialProfileRepository.update(profile.id, {
      currentBalanceCents: currentBalance + transaction.amountCents,});

    // Delete transaction
    transactionRepository.delete(transaction.id);

    // Mark payment.update(payment.id, {
      status: FixedExpensePaymentStatus.UNPAID,
      actualAmountCents,
      paymentDate,
      transactionId});}

  /**
   * Check if fixed expense is overdue
   */
  isOverdue(categoryId): boolean {
    const payment = this.getExpenseForCategory(categoryId);
    if (!payment) return false;

    const today = getTodayIsoString();
    return payment.dueDate < today;}

  /**
   * Get days until due
   */
  getDaysUntilDue(categoryId): number {
    const { calculateRemainingDays} = require('../utils/date.utils');
    const payment = this.getExpenseForCategory(categoryId);
    if (!payment) return -1;

    const today = getTodayIsoString();
    return calculateRemainingDays(today, payment.dueDate);}

  /**
   * Mark*/
  updateOverdueStatus(): void {
    const unpaid = fixedExpenseRepository.findUnpaid();
    const today = getTodayIsoString();

    for (const payment of unpaid) {
      if (payment.dueDate < today && payment.status !== FixedExpensePaymentStatus.OVERDUE) {
        fixedExpenseRepository.update(payment.id, {
          status: FixedExpensePaymentStatus.OVERDUE,});}}}}

export const fixedExpenseService = new FixedExpenseService();

