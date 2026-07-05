/**
 * Seed Data for Development and Testing
 * 
 * Implements the example scenario:
 * - Current balance: RM1,000 (100,000 cents)
 * - Next payday: 20 days away
 */

import { v4 as uuidv4 } from 'uuid';
import { store } from './in-memory.store';
import {
  FinancialProfile,
  SpendingCategory,
  SpendingCategoryType,
  Transaction,
  TransactionType,
  TransactionSource,
  FixedExpensePayment,
  FixedExpensePaymentStatus,
} from '../models/index';

export function seedData(): void {
  store.clear();

  // Calculate dates: today + 20 days
  const today = new Date();
  const payday = new Date(today);
  payday.setDate(payday.getDate() + 20);

  const todayStr = today.toISOString().split('T')[0];
  const paydayStr = payday.toISOString().split('T')[0];
  const cycleStartStr = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // 1. Create Financial Profile
  const profileId = uuidv4();
  const profile: FinancialProfile = {
    id: profileId,
    currency: 'MYR',
    expectedSalaryCents: 500000, // RM5000
    openingBalanceCents: 100000, // RM1000
    currentBalanceCents: 100000, // RM1000
    salaryCycleStartDate: cycleStartStr,
    nextPayday: paydayStr,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addProfile(profile);

  // 2. Create Categories - All Husby spending items from sheet

  // DAILY VARIABLE: Food (Husby)
  const foodCategoryId = uuidv4();
  const foodCategory: SpendingCategory = {
    id: foodCategoryId,
    name: 'Husby food',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents: 60000, // RM600
    preferredDailyAmountCents: 2000, // RM20
    active: true,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(foodCategory);

  // PERSONAL CARE: Shampoo
  const shampooCategoryId = uuidv4();
  const shampooCategory: SpendingCategory = {
    id: shampooCategoryId,
    name: 'Shampoo (Husby)',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents: 2500, // RM25
    preferredDailyAmountCents: 83, // ~RM0.83 per day
    active: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(shampooCategory);

  // PERSONAL CARE: Shower soap
  const soapCategoryId = uuidv4();
  const soapCategory: SpendingCategory = {
    id: soapCategoryId,
    name: 'Shower soap (Husby)',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents: 2500, // RM25
    preferredDailyAmountCents: 83, // ~RM0.83 per day
    active: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(soapCategory);

  // USAGE-BASED: Petrol (Husby)
  const petrolCategoryId = uuidv4();
  const petrolCategory: SpendingCategory = {
    id: petrolCategoryId,
    name: 'Petrol (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents: 20000, // RM200
    protected: true,
    active: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(petrolCategory);

  // USAGE-BASED: Parking fee (Husby)
  const parkingCategoryId = uuidv4();
  const parkingCategory: SpendingCategory = {
    id: parkingCategoryId,
    name: 'Parking fee (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents: 14000, // RM140
    active: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(parkingCategory);

  // FIXED: Phone bill (Husby)
  const phoneCategoryId = uuidv4();
  const phoneCategory: SpendingCategory = {
    id: phoneCategoryId,
    name: 'Phone bill (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 16000, // RM160
    expectedAmountCents: 16000,
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(phoneCategory);

  // FIXED: Electricity bill
  const electricityCategoryId = uuidv4();
  const electricityCategory: SpendingCategory = {
    id: electricityCategoryId,
    name: 'Electricity bill',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 15000, // RM150
    expectedAmountCents: 15000,
    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(electricityCategory);

  // FIXED: Water bill
  const waterCategoryId = uuidv4();
  const waterCategory: SpendingCategory = {
    id: waterCategoryId,
    name: 'Water bill',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 4000, // RM40
    expectedAmountCents: 4000,
    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(waterCategory);

  // FIXED: Toll (Husby)
  const tollCategoryId = uuidv4();
  const tollCategory: SpendingCategory = {
    id: tollCategoryId,
    name: 'Toll (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 15000, // RM150
    expectedAmountCents: 15000,
    dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(tollCategory);

  // FIXED: Road tax
  const roadTaxCategoryId = uuidv4();
  const roadTaxCategory: SpendingCategory = {
    id: roadTaxCategoryId,
    name: 'Road tax',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 6667, // RM66.67
    expectedAmountCents: 6667,
    dueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(roadTaxCategory);

  // FIXED: Haircut (Husby)
  const haircutCategoryId = uuidv4();
  const haircutCategory: SpendingCategory = {
    id: haircutCategoryId,
    name: 'Haircut (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 2000, // RM20
    expectedAmountCents: 2000,
    dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(haircutCategory);

  // FIXED: Medical card (Husby)
  const medicalCategoryId = uuidv4();
  const medicalCategory: SpendingCategory = {
    id: medicalCategoryId,
    name: 'Medical card (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 15000, // RM150
    expectedAmountCents: 15000,
    dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(medicalCategory);

  // FIXED: Religious class (Quran)
  const religiousCategoryId = uuidv4();
  const religiousCategory: SpendingCategory = {
    id: religiousCategoryId,
    name: 'Religious class (Quran)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 10000, // RM100
    expectedAmountCents: 10000,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(religiousCategory);

  // FIXED: Parents pocket money (Husby)
  const parentsCategoryId = uuidv4();
  const parentsCategory: SpendingCategory = {
    id: parentsCategoryId,
    name: 'Parents pocket money (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 30000, // RM300
    expectedAmountCents: 30000,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(parentsCategory);

  // FIXED: EPF, SOCSO, EIS, PCB (Husby)
  const epfCategoryId = uuidv4();
  const epfCategory: SpendingCategory = {
    id: epfCategoryId,
    name: 'EPF, SOCSO, EIS, PCB (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents: 96800, // RM968
    expectedAmountCents: 96800,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring: true,
    active: true,
    displayOrder: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(epfCategory);

  // EMERGENCY: Car service
  const carServiceCategoryId = uuidv4();
  const carServiceCategory: SpendingCategory = {
    id: carServiceCategoryId,
    name: 'Car service (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents: 30000, // RM300 estimated
    active: true,
    displayOrder: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(carServiceCategory);

  // EMERGENCY: Car tyre
  const tyreCategoryId = uuidv4();
  const tyreCategory: SpendingCategory = {
    id: tyreCategoryId,
    name: 'Car tyre (Emergency)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents: 50000, // RM500 estimated
    active: true,
    displayOrder: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(tyreCategory);

  // EMERGENCY: Car battery
  const batteryCategoryId = uuidv4();
  const batteryCategory: SpendingCategory = {
    id: batteryCategoryId,
    name: 'Car battery (Emergency)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents: 30000, // RM300 estimated
    active: true,
    displayOrder: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(batteryCategory);

  // 3. Create Transactions (Food spending: RM200 already spent)
  const foodTransactionId = uuidv4();
  const foodTransaction: Transaction = {
    id: foodTransactionId,
    categoryId: foodCategoryId,
    type: TransactionType.EXPENSE,
    source: TransactionSource.MANUAL,
    amountCents: 20000, // RM200
    transactionDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    merchant: 'Various restaurants',
    description: 'Food expenses earlier in cycle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addTransaction(foodTransaction);

  // 4. Create Fixed Expense Payments (unpaid)
  const paymentIds = [
    { categoryId: phoneCategory.id, category: phoneCategory },
    { categoryId: electricityCategory.id, category: electricityCategory },
    { categoryId: waterCategory.id, category: waterCategory },
    { categoryId: tollCategory.id, category: tollCategory },
    { categoryId: roadTaxCategory.id, category: roadTaxCategory },
    { categoryId: haircutCategory.id, category: haircutCategory },
    { categoryId: medicalCategory.id, category: medicalCategory },
    { categoryId: religiousCategory.id, category: religiousCategory },
    { categoryId: parentsCategory.id, category: parentsCategory },
    { categoryId: epfCategory.id, category: epfCategory },
  ];

  paymentIds.forEach(({ categoryId, category }) => {
    const paymentId = uuidv4();
    const payment: FixedExpensePayment = {
      id: paymentId,
      categoryId: categoryId,
      expectedAmountCents: category.expectedAmountCents || category.allocatedAmountCents,
      dueDate: category.dueDate || todayStr,
      status: FixedExpensePaymentStatus.UNPAID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addFixedExpensePayment(payment);
  });

  console.log('✓ Seed data loaded:');
  console.log(`  - Financial Profile (RM1652 balance, ${todayStr} to ${paydayStr})`);
  console.log('  - 19 Husby spending categories');
  console.log('  - 1 Food transaction (RM200 spent)');
  console.log('  - 10 Unpaid fixed expenses (~RM2,087.67 total)');
}

/**
 * Clear all data
 */
export function clearAllData(): void {
  store.clear();
  console.log('✓ All data cleared');
}
