const db = require('./db');

const updateSchema = async () => {
  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS company_settings (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      tva_number VARCHAR(50),
      email VARCHAR(255),
      phone VARCHAR(50),
      website VARCHAR(255),
      
      street VARCHAR(255),
      city VARCHAR(100),
      zip_code VARCHAR(20),
      country VARCHAR(100),
      
      bank_name VARCHAR(100),
      iban VARCHAR(50),
      bic VARCHAR(20),
      
      logo_path VARCHAR(255),
      
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('Création de la table company_settings...');
    await db.query(createSettingsTable);
    console.log('Table company_settings créée.');

    // Seed default settings if empty
    const countRes = await db.query('SELECT COUNT(*) FROM company_settings');
    if (parseInt(countRes.rows[0].count) === 0) {
        console.log('Initialisation des paramètres par défaut...');
        await db.query(`
            INSERT INTO company_settings (company_name, country)
            VALUES ('Ma Société', 'Belgique')
        `);
    }

  } catch (err) {
    console.error('Erreur lors de la mise à jour du schéma settings:', err);
  } finally {
    process.exit();
  }
};

updateSchema();
