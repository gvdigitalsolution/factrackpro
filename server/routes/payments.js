const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, d.number as document_number, c.name as client_name
      FROM payments p
      LEFT JOIN documents d ON p.document_id = d.id
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE p.user_id = $1
      ORDER BY p.date DESC
    `;
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des paiements' });
  }
});

// POST new payment
router.post('/', async (req, res) => {
  const { document_id, amount, date, method, reference } = req.body;

  if (!document_id || !amount || !date || !method) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Check document ownership
    const docQuery = 'SELECT total FROM documents WHERE id = $1 AND user_id = $2';
    const docResult = await client.query(docQuery, [document_id, req.user.id]);
    
    if (docResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Document non trouvé' });
    }

    // 2. Insert payment
    const paymentQuery = `
      INSERT INTO payments (document_id, amount, date, method, reference, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const paymentResult = await client.query(paymentQuery, [document_id, amount, date, method, reference, req.user.id]);
    const paymentId = paymentResult.rows[0].id;

    // 3. Update document status
    const total = parseFloat(docResult.rows[0].total);
    
    const paymentsSumQuery = 'SELECT SUM(amount) as paid FROM payments WHERE document_id = $1';
    const paymentsSumResult = await client.query(paymentsSumQuery, [document_id]);
    const paid = parseFloat(paymentsSumResult.rows[0].paid) || 0;

    let newStatus = 'sent';
    if (paid >= total) {
      newStatus = 'paid';
    } else if (paid > 0) {
      newStatus = 'partially_paid'; 
    }

    await client.query('UPDATE documents SET status = $1 WHERE id = $2', [newStatus, document_id]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Paiement enregistré', id: paymentId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement' });
  } finally {
    client.release();
  }
});

module.exports = router;
