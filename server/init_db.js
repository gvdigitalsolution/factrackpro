const db = require('./db');

const createTables = async () => {
  const createClientsTable = `
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      tva VARCHAR(50),
      email VARCHAR(255),
      phone VARCHAR(50),
      balance DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      type VARCHAR(20) NOT NULL,
      number VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      due_date DATE,
      status VARCHAR(20) DEFAULT 'draft',
      total DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createDocumentItemsTable = `
    CREATE TABLE IF NOT EXISTS document_items (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL
    );
  `;

  const createPaymentsTable = `
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      method VARCHAR(50),
      reference VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const seedClients = `
    INSERT INTO clients (name, tva, email, phone, balance)
    VALUES 
      ('Client A', 'BE0123456789', 'client.a@example.com', '0123456789', 1000.00),
      ('Client B', 'BE9876543210', 'client.b@example.com', '0987654321', 0.00),
      ('Client C', 'BE1122334455', 'client.c@example.com', '0223344556', 50.50)
    ON CONFLICT DO NOTHING;
  `;

  try {
    console.log('Création de la table clients...');
    await db.query(createClientsTable);
    console.log('Table clients créée ou déjà existante.');

    console.log('Création de la table documents...');
    await db.query(createDocumentsTable);
    console.log('Table documents créée ou déjà existante.');

    console.log('Création de la table document_items...');
    await db.query(createDocumentItemsTable);
    console.log('Table document_items créée ou déjà existante.');

    console.log('Création de la table payments...');
    await db.query(createPaymentsTable);
    console.log('Table payments créée ou déjà existante.');

    // Check if empty before seeding
    const result = await db.query('SELECT COUNT(*) FROM clients');
    if (parseInt(result.rows[0].count) === 0) {
        console.log('Insertion des données de test...');
        await db.query(seedClients);
        console.log('Données insérées.');
    } else {
        console.log('La table contient déjà des données, pas de seed.');
    }

  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la DB:', err);
  } finally {
    process.exit();
  }
};

createTables();
