const { Pool } = require('pg');
require('dotenv').config();

// When DATABASE_URL is set use it (production / Railway).
// Locally on macOS, pg connects via Unix socket automatically when
// no connectionString is provided — so we just omit it.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : { database: 'medping' };   // local fallback — uses OS user + Unix socket

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

module.exports = pool;
