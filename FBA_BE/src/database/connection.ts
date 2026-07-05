/**
 * Database Connection Module
 * Provides a singleton connection to PostgreSQL via Knex
 */

import knex, { Knex } from 'knex';

let dbInstance: Knex | null = null;

export function initializeDatabase(): Knex {
  if (!dbInstance) {
    const knexfile = require('../../config/knexfile') as any;
    dbInstance = knex(knexfile.development);
  }
  return dbInstance;
}

export function getDatabase(): Knex {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}

export const db = getDatabase;
