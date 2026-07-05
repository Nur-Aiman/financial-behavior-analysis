const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Financial Behavior Analysis API' });
});

// API endpoints
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Example: Get all users (works with mock DB)
router.get('/api/users', async (req, res) => {
  try {
    const users = await db.table('users').select();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Example: Get user by ID (works with mock DB)
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.table('users').where({ id: parseInt(req.params.id) });
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Example: Get transactions (works with mock DB)
router.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.table('transactions').select();
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
