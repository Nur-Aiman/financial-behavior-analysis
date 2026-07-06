/**
 * Dashboard Controller
 */

import { dashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.utils.js';
import { formatCentsAsRinggit } from '../utils/money.utils.js';

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get dashboard summary
   */
  static async getSummary(_req, res, next) {
    try {
      const summary = dashboardService.getDashboardSummary();

      const enriched = {
        ...summary,
        currentBalance: formatCentsAsRinggit(summary.currentBalanceCents),
        reservedFixedExpenses: formatCentsAsRinggit(summary.reservedFixedExpensesCents),
        protectedUsageAllocation: formatCentsAsRinggit(summary.protectedUsageAllocationCents),
        safelyAvailableBalance: formatCentsAsRinggit(summary.safelyAvailableBalanceCents),
        recommendedSpendingToday: formatCentsAsRinggit(summary.recommendedSpendingTodayCents),
        projectedBalanceOnPayday: formatCentsAsRinggit(summary.projectedBalanceOnPaydayCents),
        expectedSalary: formatCentsAsRinggit(summary.expectedSalaryCents),};

      res.json(successResponse(enriched, 'Dashboard summary retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/dashboard/category-utilisation
   * Get category utilisation data
   */
  static async getCategoryUtilisation(_req, res, next) {
    try {
      const utilisation = dashboardService.getCategoryUtilisation();

      const enriched = utilisation.map(u => ({
        ...u,
        allocatedAmount: formatCentsAsRinggit(u.allocatedAmountCents),
        spentAmount: formatCentsAsRinggit(u.spentAmountCents),
        remainingAmount: formatCentsAsRinggit(u.remainingAmountCents),}));

      res.json(successResponse(enriched, 'Category utilisation retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/dashboard/spending-trend
   * Get spending trend for last 30 days
   */
  static async getSpendingTrend(_req, res, next) {
    try {
      const trend = dashboardService.getSpendingTrend();

      const enriched = trend.map(t => ({
        ...t,
        totalSpent: formatCentsAsRinggit(t.totalSpentCents),
        byCategory: Object.entries(t.byCategory).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: formatCentsAsRinggit(value),}),
          {}),}));

      res.json(successResponse(enriched, 'Spending trend retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/dashboard/planned-vs-actual
   * Get planned vs actual spending
   */
  static async getPlannedVsActual(_req, res, next) {
    try {
      const data = dashboardService.getPlannedVsActual();

      const enriched = data.map(d => ({
        ...d,
        plannedAmount: formatCentsAsRinggit(d.plannedAmountCents),
        actualAmount: formatCentsAsRinggit(d.actualAmountCents),
        variance: formatCentsAsRinggit(d.varianceCents),}));

      res.json(successResponse(enriched, 'Planned vs actual retrieved'));} catch (err) {
      next(err);}}

  /**
   * GET /api/dashboard/projected-balances
   * Get projected balance for remaining days
   */
  static async getProjectedBalances(_req, res, next) {
    try {
      const projections = dashboardService.getProjectedBalances();

      const enriched = projections.map(p => ({
        ...p,
        balance: formatCentsAsRinggit(p.balanceCents),}));

      res.json(successResponse(enriched, 'Projected balances retrieved'));} catch (err) {
      next(err);}}





}
