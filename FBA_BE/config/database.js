const knex = require('knex');
const knexfile = require('./knexfile');
const mockDb = require('./mockDb');

// Use mock database by default, set USE_REAL_DB=true to connect to real database
const useRealDb = process.env.USE_REAL_DB === 'true';

let db;

if (useRealDb) {
  const environment = process.env.NODE_ENV || 'development';
  const config = knexfile[environment];
  db = knex(config);
  console.log('Connected to real database');
} else {
  db = mockDb;
  console.log('Using mock database (set USE_REAL_DB=true to connect to real database)');
}

module.exports = db;
