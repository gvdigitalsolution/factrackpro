const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    // Nécessaire pour éviter les erreurs de certificat auto-signé sur certaines machines locales
    rejectUnauthorized: false 
  }
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erreur de connexion à Neon:', err.stack);
  }
  console.log('Connecté avec succès à Neon DB');
  release();
});

module.exports = pool;
