const db = require('./db');

const updateSchema = async () => {
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      sku VARCHAR(50),
      category VARCHAR(100),
      vat_rate DECIMAL(5, 2) DEFAULT 21.00,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('Création de la table products...');
    await db.query(createProductsTable);
    console.log('Table products créée avec succès.');
    
    // Seed some data
    const seedQuery = `
      INSERT INTO products (name, description, price, sku, category)
      VALUES 
        ('Consultation IT', 'Consultation technique horaire', 85.00, 'SRV-IT-001', 'Services'),
        ('Maintenance Mensuelle', 'Contrat de maintenance préventive', 150.00, 'SRV-MAINT-01', 'Services'),
        ('Licence Logiciel Pro', 'Licence annuelle par utilisateur', 299.00, 'LIC-PRO-01', 'Licences')
      ON CONFLICT DO NOTHING;
    `;
    
    const countRes = await db.query('SELECT COUNT(*) FROM products');
    if (parseInt(countRes.rows[0].count) === 0) {
        console.log('Ajout de produits de test...');
        await db.query(seedQuery);
    }

  } catch (err) {
    console.error('Erreur lors de la mise à jour du schéma:', err);
  } finally {
    process.exit();
  }
};

updateSchema();
