/**
 * Integration Tests - API Routes
 */

import request from 'supertest';
import app from '../../src/app';
import { clearAllData, seedData } from '../../src/storage/seed-data';

describe('Financial Behavior Analysis API', () => {
  beforeEach(() => {
    clearAllData();
    seedData();
  });

  // Health Check
  describe('Health Check', () => {
    it('GET /health should return ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  // Financial Profile Routes
  describe('Financial Profile Routes', () => {
    it('GET /api/profile should return active profile', async () => {
      const response = await request(app).get('/api/profile');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nextPayday');
    });

    it('GET /api/profile/remaining-days should return days until payday', async () => {
      const response = await request(app).get('/api/profile/remaining-days');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('remainingDays');
      expect(typeof response.body.data.remainingDays).toBe('number');
    });

    it('PUT /api/profile should update profile', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({
          expectedSalaryCents: 200000,
          nextPayday: '2024-12-25',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Balance Routes
  describe('Balance Routes', () => {
    it('GET /api/balance should return current balance', async () => {
      const response = await request(app).get('/api/balance');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentBalanceCents');
      expect(response.body.data).toHaveProperty('currentBalance');
    });

    it('PUT /api/balance should update balance', async () => {
      const response = await request(app)
        .put('/api/balance')
        .send({
          newBalanceCents: 150000,
          reason: 'Manual adjustment for testing',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('adjustment');
    });

    it('GET /api/balance/history should return adjustment history', async () => {
      const response = await request(app).get('/api/balance/history');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Category Routes
  describe('Category Routes', () => {
    it('GET /api/categories should return all categories', async () => {
      const response = await request(app).get('/api/categories');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /api/categories should create new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Entertainment',
          type: 'DAILY_TIME_BASED',
          allocatedAmountCents: 100000,
          preferredDailyAmountCents: 10000,
        });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('GET /api/categories?type=DAILY_TIME_BASED should filter by type', async () => {
      const response = await request(app)
        .get('/api/categories')
        .query({ type: 'DAILY_TIME_BASED' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((cat: any) => {
        expect(cat.type).toBe('DAILY_TIME_BASED');
      });
    });

    it('GET /api/categories/:id should return category details', async () => {
      // Get first category
      const listResponse = await request(app).get('/api/categories');
      const categoryId = listResponse.body.data[0].id;

      const response = await request(app).get(`/api/categories/${categoryId}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(categoryId);
    });
  });

  // Transaction Routes
  describe('Transaction Routes', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Get a category ID from seed data
      const catResponse = await request(app).get('/api/categories');
      categoryId = catResponse.body.data[0].id;
    });

    it('POST /api/transactions should create transaction', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          categoryId,
          type: 'EXPENSE',
          amountCents: 50000,
          description: 'Lunch',
          transactionDate: new Date().toISOString().split('T')[0],
        });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('GET /api/transactions should return all transactions', async () => {
      const response = await request(app).get('/api/transactions');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/transactions?categoryId=xxx should filter by category', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ categoryId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Forecast Routes
  describe('Forecast Routes', () => {
    it('GET /api/forecast/today should return today\'s forecast', async () => {
      const response = await request(app).get('/api/forecast/today');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentBalance');
      expect(response.body.data).toHaveProperty('remainingDays');
    });

    it('GET /api/forecast/categories should return category forecasts', async () => {
      const response = await request(app).get('/api/forecast/categories');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/forecast/projected-balance should return projected balance', async () => {
      const response = await request(app).get('/api/forecast/projected-balance');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentBalance');
      expect(response.body.data).toHaveProperty('projectedBalanceOnPayday');
    });
  });

  // Dashboard Routes
  describe('Dashboard Routes', () => {
    it('GET /api/dashboard/summary should return dashboard summary', async () => {
      const response = await request(app).get('/api/dashboard/summary');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentBalance');
      expect(response.body.data).toHaveProperty('remainingDays');
    });

    it('GET /api/dashboard/category-utilisation should return category data', async () => {
      const response = await request(app).get('/api/dashboard/category-utilisation');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/dashboard/spending-trend should return spending trend', async () => {
      const response = await request(app).get('/api/dashboard/spending-trend');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Development Routes (only in non-production)
  describe('Development Routes', () => {
    it('POST /api/dev/seed should load seed data', async () => {
      const response = await request(app).post('/api/dev/seed');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('POST /api/dev/reset should clear all data', async () => {
      const response = await request(app).post('/api/dev/reset');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Error Cases
  describe('Error Handling', () => {
    it('GET /non-existent-route should return 404', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('POST /api/categories with invalid data should return 400', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Test',
          // Missing required fields
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/categories/invalid-id should return error', async () => {
      const response = await request(app).get('/api/categories/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
