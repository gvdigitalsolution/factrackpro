const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Nécessaire pour Neon/AWS RDS dans certains contextes
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
