const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 // 500KB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// GET settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM company_settings WHERE user_id = $1 LIMIT 1', [req.user.id]);
    if (result.rows.length === 0) {
      // Create default if not exists (fail-safe) for THIS user
      const insert = await db.query(
        "INSERT INTO company_settings (company_name, user_id) VALUES ('Ma Société', $1) RETURNING *",
        [req.user.id]
      );
      return res.json(insert.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  const { 
    company_name, tva_number, email, phone, website,
    street, city, zip_code, country,
    bank_name, iban, bic
  } = req.body;

  try {
    const query = `
      UPDATE company_settings 
      SET company_name = $1, tva_number = $2, email = $3, phone = $4, website = $5,
          street = $6, city = $7, zip_code = $8, country = $9,
          bank_name = $10, iban = $11, bic = $12, updated_at = NOW()
      WHERE user_id = $13
      RETURNING *
    `;
    const values = [
      company_name, tva_number, email, phone, website,
      street, city, zip_code, country,
      bank_name, iban, bic,
      req.user.id
    ];

    const result = await db.query(query, values);
    // If no row updated, maybe it doesn't exist yet (if flow was weird), but GET creates it.
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

// POST upload logo
router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier uploadé' });
  }

  // TODO: Add image dimension check (512x512) if needed using a library like sharp
  // For now, we rely on client-side check + file size limit

  try {
    const logoPath = '/uploads/' + req.file.filename;
    await db.query('UPDATE company_settings SET logo_path = $1 WHERE user_id = $2', [logoPath, req.user.id]);
    res.json({ message: 'Logo mis à jour', path: logoPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du logo' });
  }
});

module.exports = router;
