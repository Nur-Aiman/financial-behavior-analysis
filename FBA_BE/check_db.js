const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'financial-behavior-analysis',
    port: 5432
  }
});

async function checkDatabase() {
  try {
    const txs = await db('transactions')
      .orderBy('created_at', 'desc')
      .limit(3)
      .select('id', 'description', 'amount_cents', 'transaction_date', 'created_at');
    
    console.log('✅ Successfully connected to PostgreSQL');
    console.log('Recent transactions in database:');
    txs.forEach(tx => {
      console.log(\  - ID: \...\);
      console.log(\    Description: \\);
      console.log(\    Amount: \ cents\);
      console.log(\    Date: \\);
      console.log('');
    });
    
    const testTx = txs.find(tx => tx.description.includes('Test DB Persistence'));
    if (testTx) {
      console.log('✅✅✅ TEST TRANSACTION FOUND IN PostgreSQL DATABASE!');
      console.log('DATABASE PERSISTENCE CONFIRMED FOR CREATE OPERATION');
    } else {
      console.log('❌ Test transaction NOT found in database');
    }
  } catch (err) {
    console.error('Database query error:', err.message);
  }
  process.exit(0);
}

checkDatabase();
