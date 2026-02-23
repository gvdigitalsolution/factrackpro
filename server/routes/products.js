const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE user_id = $1 ORDER BY name ASC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST new product
router.post('/', async (req, res) => {
  const { name, description, price, sku, category, vat_rate, active } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nom et prix requis' });
  }

  try {
    const query = `
      INSERT INTO products (name, description, price, sku, category, vat_rate, active, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [name, description, price, sku, category, vat_rate || 21.00, active !== undefined ? active : true, req.user.id];
    
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku, category, vat_rate, active } = req.body;

  try {
    const query = `
      UPDATE products 
      SET name = $1, description = $2, price = $3, sku = $4, category = $5, vat_rate = $6, active = $7
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `;
    const values = [name, description, price, sku, category, vat_rate, active, id, req.user.id];
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
