/**
 * Database Connection Module
 * Provides a singleton connection to PostgreSQL via Knex
 */

import knex from 'knex';
import knexfile from '../config/knexfile.js';

let dbInstance = null;

export function initializeDatabase() {
  if (!dbInstance) {
    const env = process.env.NODE_ENV || 'development';
    try {
      dbInstance = knex(knexfile[env]);
      console.log(`✅ Database connection initialized for environment: ${env}`);
    } catch (err) {
      console.error('Error initializing database:', err);
      process.exit(1);
    }
  }
  return dbInstance;
}

export function getDatabase() {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}

export const db = getDatabase;




