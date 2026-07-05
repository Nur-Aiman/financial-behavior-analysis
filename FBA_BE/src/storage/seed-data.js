/**
 * Seed Data for Development and Testing
 * 
 * Implements the example scenario:
 * - Current balance,000 (100,000 cents)
 * - Next payday: 20 days away
 */

import { v4} from 'uuid';
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
  const profile= {
    id,
    currency: 'MYR',
    expectedSalaryCents, // RM5000
    openingBalanceCents, // RM1000
    currentBalanceCents, // RM1000
    salaryCycleStartDate,
    nextPayday,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addProfile(profile);

  // 2. Create Categories - All Husby spending items from sheet

  // DAILY VARIABLE: Food (Husby)
  const foodCategoryId = uuidv4();
  const foodCategory= {
    id,
    name: 'Husby food',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents, // RM600
    preferredDailyAmountCents, // RM20
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(foodCategory);

  // PERSONAL CARE= uuidv4();
  const shampooCategory= {
    id,
    name: 'Shampoo (Husby)',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents, // RM25
    preferredDailyAmountCents, // ~RM0.83 per day
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(shampooCategory);

  // PERSONAL CARE= uuidv4();
  const soapCategory= {
    id,
    name: 'Shower soap (Husby)',
    type: SpendingCategoryType.DAILY_TIME_BASED,
    allocatedAmountCents, // RM25
    preferredDailyAmountCents, // ~RM0.83 per day
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(soapCategory);

  // USAGE-BASED: Petrol (Husby)
  const petrolCategoryId = uuidv4();
  const petrolCategory= {
    id,
    name: 'Petrol (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents, // RM200
    protected,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(petrolCategory);

  // USAGE-BASED: Parking fee (Husby)
  const parkingCategoryId = uuidv4();
  const parkingCategory= {
    id,
    name: 'Parking fee (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents, // RM140
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(parkingCategory);

  // FIXED: Phone bill (Husby)
  const phoneCategoryId = uuidv4();
  const phoneCategory= {
    id,
    name: 'Phone bill (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM160
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(phoneCategory);

  // FIXED= uuidv4();
  const electricityCategory= {
    id,
    name: 'Electricity bill',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM150
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(electricityCategory);

  // FIXED= uuidv4();
  const waterCategory= {
    id,
    name: 'Water bill',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM40
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(waterCategory);

  // FIXED: Toll (Husby)
  const tollCategoryId = uuidv4();
  const tollCategory= {
    id,
    name: 'Toll (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM150
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(tollCategory);

  // FIXED= uuidv4();
  const roadTaxCategory= {
    id,
    name: 'Road tax',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM66.67
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(roadTaxCategory);

  // FIXED: Haircut (Husby)
  const haircutCategoryId = uuidv4();
  const haircutCategory= {
    id,
    name: 'Haircut (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM20
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(haircutCategory);

  // FIXED: Medical card (Husby)
  const medicalCategoryId = uuidv4();
  const medicalCategory= {
    id,
    name: 'Medical card (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM150
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(medicalCategory);

  // FIXED: Religious class (Quran)
  const religiousCategoryId = uuidv4();
  const religiousCategory= {
    id,
    name: 'Religious class (Quran)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM100
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(religiousCategory);

  // FIXED: Parents pocket money (Husby)
  const parentsCategoryId = uuidv4();
  const parentsCategory= {
    id,
    name: 'Parents pocket money (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM300
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(parentsCategory);

  // FIXED, PCB (Husby)
  const epfCategoryId = uuidv4();
  const epfCategory= {
    id,
    name: 'EPF, SOCSO, EIS, PCB (Husby)',
    type: SpendingCategoryType.FIXED_ONE_TIME,
    allocatedAmountCents, // RM968
    expectedAmountCents,
    dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurring,
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(epfCategory);

  // EMERGENCY= uuidv4();
  const carServiceCategory= {
    id,
    name: 'Car service (Husby)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents, // RM300 estimated
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(carServiceCategory);

  // EMERGENCY= uuidv4();
  const tyreCategory= {
    id,
    name: 'Car tyre (Emergency)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents, // RM500 estimated
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(tyreCategory);

  // EMERGENCY= uuidv4();
  const batteryCategory= {
    id,
    name: 'Car battery (Emergency)',
    type: SpendingCategoryType.USAGE_BASED,
    allocatedAmountCents, // RM300 estimated
    active,
    displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.addCategory(batteryCategory);

  // 3. Create Transactions (Food spending)
  const foodTransactionId = uuidv4();
  const foodTransaction= {
    id,
    categoryId,
    type: TransactionType.EXPENSE,
    source: TransactionSource.MANUAL,
    amountCents, // RM200
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
    { categoryId: phoneCategory.id, category},
    { categoryId: electricityCategory.id, category},
    { categoryId: waterCategory.id, category},
    { categoryId: tollCategory.id, category},
    { categoryId: roadTaxCategory.id, category},
    { categoryId: haircutCategory.id, category},
    { categoryId: medicalCategory.id, category},
    { categoryId: religiousCategory.id, category},
    { categoryId: parentsCategory.id, category},
    { categoryId: epfCategory.id, category},
  ];

  paymentIds.forEach(({ categoryId, category }) => {
    const paymentId = uuidv4();
    const payment= {
      id,
      categoryId,
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
