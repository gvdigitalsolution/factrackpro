const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients WHERE user_id = $1 ORDER BY name ASC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients' });
  }
});

// GET client by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM clients WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du client' });
  }
});

// POST new client
router.post('/', async (req, res) => {
  const { 
    name, tva, email, phone,
    client_number, group_name, assigned_user, identification_number, website, routing_id, vat_valid, tax_exempt, classification,
    contact_first_name, contact_last_name, contact_email, contact_phone, contact_add_to_invoices,
    billing_street, billing_apt, billing_city, billing_region, billing_zip, billing_country,
    shipping_street, shipping_apt, shipping_city, shipping_region, shipping_zip, shipping_country
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }
  try {
    const query = `
      INSERT INTO clients (
        name, tva, email, phone,
        client_number, group_name, assigned_user, identification_number, website, routing_id, vat_valid, tax_exempt, classification,
        contact_first_name, contact_last_name, contact_email, contact_phone, contact_add_to_invoices,
        billing_street, billing_apt, billing_city, billing_region, billing_zip, billing_country,
        shipping_street, shipping_apt, shipping_city, shipping_region, shipping_zip, shipping_country,
        user_id
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29, $30,
        $31
      ) RETURNING *`;
    
    const values = [
      name, tva, email, phone,
      client_number, group_name, assigned_user, identification_number, website, routing_id, vat_valid || false, tax_exempt || false, classification,
      contact_first_name, contact_last_name, contact_email, contact_phone, contact_add_to_invoices || false,
      billing_street, billing_apt, billing_city, billing_region, billing_zip, billing_country,
      shipping_street, shipping_apt, shipping_city, shipping_region, shipping_zip, shipping_country,
      req.user.id
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création du client' });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    name, tva, email, phone,
    client_number, group_name, assigned_user, identification_number, website, routing_id, vat_valid, tax_exempt, classification,
    contact_first_name, contact_last_name, contact_email, contact_phone, contact_add_to_invoices,
    billing_street, billing_apt, billing_city, billing_region, billing_zip, billing_country,
    shipping_street, shipping_apt, shipping_city, shipping_region, shipping_zip, shipping_country
  } = req.body;
  
  try {
    const query = `
      UPDATE clients SET 
        name = $1, tva = $2, email = $3, phone = $4,
        client_number = $5, group_name = $6, assigned_user = $7, identification_number = $8, website = $9, routing_id = $10, vat_valid = $11, tax_exempt = $12, classification = $13,
        contact_first_name = $14, contact_last_name = $15, contact_email = $16, contact_phone = $17, contact_add_to_invoices = $18,
        billing_street = $19, billing_apt = $20, billing_city = $21, billing_region = $22, billing_zip = $23, billing_country = $24,
        shipping_street = $25, shipping_apt = $26, shipping_city = $27, shipping_region = $28, shipping_zip = $29, shipping_country = $30
      WHERE id = $31 AND user_id = $32 RETURNING *`;

    const values = [
      name, tva, email, phone,
      client_number, group_name, assigned_user, identification_number, website, routing_id, vat_valid || false, tax_exempt || false, classification,
      contact_first_name, contact_last_name, contact_email, contact_phone, contact_add_to_invoices || false,
      billing_street, billing_apt, billing_city, billing_region, billing_zip, billing_country,
      shipping_street, shipping_apt, shipping_city, shipping_region, shipping_zip, shipping_country,
      id,
      req.user.id
    ];

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du client' });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if client has documents
    const checkQuery = 'SELECT COUNT(*) FROM documents WHERE client_id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, req.user.id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer ce client car il possède des documents liés.' });
    }

    const query = 'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du client' });
  }
});

module.exports = router;
