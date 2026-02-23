const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  const { description, amount, vat_amount, total_amount, date, category } = req.body;
  
  if (!description || !total_amount || !date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const query = `
      INSERT INTO expenses (description, amount, vat_amount, total_amount, date, category, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [description, amount, vat_amount || 0, total_amount, date, category, req.user.id];
    
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Dépense supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
