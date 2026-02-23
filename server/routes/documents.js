const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all documents
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT d.*, c.name as client_name 
      FROM documents d
      JOIN clients c ON d.client_id = c.id
      WHERE d.user_id = $1
      ORDER BY d.date DESC, d.id DESC
    `;
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des documents' });
  }
});

// GET single document by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docQuery = `
      SELECT d.*, c.name as client_name, c.email as client_email, c.tva as client_tva, c.address as client_address
      FROM documents d
      JOIN clients c ON d.client_id = c.id
      WHERE d.id = $1 AND d.user_id = $2
    `;
    const docResult = await db.query(docQuery, [id, req.user.id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Items don't have user_id but are linked to document which we checked
    const itemsQuery = 'SELECT * FROM document_items WHERE document_id = $1';
    const itemsResult = await db.query(itemsQuery, [id]);

    const document = docResult.rows[0];
    document.items = itemsResult.rows;

    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du document' });
  }
});

// POST new document
router.post('/', async (req, res) => {
  const { client_id, type, number, date, due_date, items } = req.body;
  
  // Basic validation
  if (!client_id || !type || !number || !date || !items || items.length === 0) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Calculate total
    const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
    // Calculate total VAT (assuming simple calculation for now or item based if frontend sends vat)
    // For now we default to 0 vat total if not computed, but expenses added vat logic.
    // Let's assume 21% default or use item vat if available.
    // Ideally frontend sends vat_rate per item.
    // Migration added vat_rate to document_items.
    
    let vatTotal = 0;
    
    // Insert document
    const docQuery = `
      INSERT INTO documents (client_id, type, number, date, due_date, total, vat_total, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8)
      RETURNING id
    `;
    // We update vatTotal after iterating items if needed, or compute here.
    // Let's compute iteratively.
    
    const docValues = [client_id, type, number, date, due_date, total, 0, req.user.id]; // 0 placeholder
    const docResult = await client.query(docQuery, docValues);
    const documentId = docResult.rows[0].id;

    // Insert items
    const itemQuery = `
      INSERT INTO document_items (document_id, description, quantity, unit_price, total, vat_rate)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const itemTotal = quantity * unitPrice;
      const vatRate = item.vat_rate || 21.00; // Default to 21 if missing
      
      vatTotal += itemTotal * (vatRate / 100);

      await client.query(itemQuery, [documentId, item.description, quantity, unitPrice, itemTotal, vatRate]);
    }

    // Update document total VAT
    await client.query('UPDATE documents SET vat_total = $1 WHERE id = $2', [vatTotal, documentId]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Document créé avec succès', id: documentId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du document' });
  } finally {
    client.release();
  }
});

// DELETE document
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document non trouvé' });
        }
        res.json({ message: 'Document supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression du document' });
    }
});

module.exports = router;
