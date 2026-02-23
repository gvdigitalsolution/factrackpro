const db = require('./db');

const updateSchema = async () => {
  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      vat_amount DECIMAL(10, 2) DEFAULT 0.00,
      total_amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const alterDocumentsTable = `
    ALTER TABLE documents 
    ADD COLUMN IF NOT EXISTS vat_total DECIMAL(10, 2) DEFAULT 0.00;
  `;

  const alterDocumentItemsTable = `
    ALTER TABLE document_items 
    ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2) DEFAULT 21.00;
  `;

  try {
    console.log('Création de la table expenses...');
    await db.query(createExpensesTable);
    console.log('Table expenses créée.');

    console.log('Mise à jour de la table documents (ajout vat_total)...');
    await db.query(alterDocumentsTable);
    console.log('Table documents mise à jour.');

    console.log('Mise à jour de la table document_items (ajout vat_rate)...');
    await db.query(alterDocumentItemsTable);
    console.log('Table document_items mise à jour.');

  } catch (err) {
    console.error('Erreur lors de la mise à jour du schéma comptable:', err);
  } finally {
    process.exit();
  }
};

updateSchema();
