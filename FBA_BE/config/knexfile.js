import 'dotenv/config';

export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'financial-behavior-analysis',
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      directory: '../migrations',
    },
    seeds: {
      directory: '../seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: '../migrations',
    },
    seeds: {
      directory: '../seeds',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'fba_test',
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      directory: '../migrations',
    },
  },
};
