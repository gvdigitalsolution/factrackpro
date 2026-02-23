const db = require('./db');

const updateSchema = async () => {
  const alterQuery = `
    ALTER TABLE clients 
    ADD COLUMN IF NOT EXISTS client_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS group_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS assigned_user VARCHAR(100),
    ADD COLUMN IF NOT EXISTS identification_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS routing_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vat_valid BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS classification VARCHAR(100),
    
    ADD COLUMN IF NOT EXISTS contact_first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS contact_last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS contact_add_to_invoices BOOLEAN DEFAULT false,
    
    ADD COLUMN IF NOT EXISTS billing_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS billing_apt VARCHAR(100),
    ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS billing_region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20),
    ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100),
    
    ADD COLUMN IF NOT EXISTS shipping_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_apt VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_zip VARCHAR(20),
    ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100);
  `;

  try {
    console.log('Mise à jour du schéma de la base de données (v2)...');
    await db.query(alterQuery);
    console.log('Schéma mis à jour avec succès.');
  } catch (err) {
    console.error('Erreur lors de la mise à jour du schéma:', err);
  } finally {
    process.exit();
  }
};

updateSchema();
