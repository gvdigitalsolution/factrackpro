const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_secure';

app.use(cors());
app.use(express.json());

// Point 3: Créer la table users si elle n'existe pas et ajouter colonnes de reset et settings
const createUsersTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP WITH TIME ZONE,
            
            company_name VARCHAR(255),
            tva_number VARCHAR(100),
            phone VARCHAR(100),
            website VARCHAR(255),
            street VARCHAR(255),
            city VARCHAR(255),
            zip_code VARCHAR(20),
            country VARCHAR(100),
            bank_name VARCHAR(255),
            iban VARCHAR(100),
            bic VARCHAR(50),
            logo_path VARCHAR(255),

            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createAccountingTables = `
        CREATE TABLE IF NOT EXISTS clients (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            name VARCHAR(255) NOT NULL,
            vat_number VARCHAR(50),
            email VARCHAR(255),
            street VARCHAR(255),
            city VARCHAR(255),
            zip_code VARCHAR(20),
            country VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            client_id INTEGER REFERENCES clients(id),
            number VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            due_date DATE,
            status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue
            total_excl_tax DECIMAL(10, 2) DEFAULT 0,
            total_vat DECIMAL(10, 2) DEFAULT 0,
            total_incl_tax DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS invoice_items (
            id SERIAL PRIMARY KEY,
            invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
            description VARCHAR(255),
            quantity DECIMAL(10, 2),
            unit_price DECIMAL(10, 2),
            vat_rate INTEGER, -- 0, 6, 12, 21
            total DECIMAL(10, 2)
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            description VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            amount_excl DECIMAL(10, 2) NOT NULL,
            vat_rate INTEGER, -- 0, 6, 12, 21
            vat_amount DECIMAL(10, 2),
            category VARCHAR(50) NOT NULL, -- '81' (Marchandises), '82' (Services), '83' (Investissements)
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        await pool.query(createAccountingTables);
        
        // Migration au cas où la table existait déjà
        const columns = [
            'reset_token VARCHAR(255)',
            'reset_token_expires TIMESTAMP WITH TIME ZONE',
            'company_name VARCHAR(255)',
            'tva_number VARCHAR(100)',
            'phone VARCHAR(100)',
            'website VARCHAR(255)',
            'street VARCHAR(255)',
            'city VARCHAR(255)',
            'zip_code VARCHAR(20)',
            'country VARCHAR(100)',
            'bank_name VARCHAR(255)',
            'iban VARCHAR(100)',
            'bic VARCHAR(50)',
            'logo_path VARCHAR(255)'
        ];
        
        for (const col of columns) {
            try {
                await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col}`);
            } catch (e) {
                // Ignore columns that might already exist
            }
        }
        
        console.log("Tables 'users' et comptabilité vérifiées/créées avec succès.");
    } catch (err) {
        console.error("Erreur lors de la création des tables:", err);
    }
};

createUsersTable();

// --- Middleware d'authentification ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Accès refusé" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        req.user = user;
        next();
    });
};

// --- Routes d'authentification ---

// Inscription
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insérer l'utilisateur
        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );

        res.status(201).json({ 
            message: "Utilisateur créé avec succès",
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    try {
        // Chercher l'utilisateur
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Identifiants invalides" });
        }

        const user = result.rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Identifiants invalides" });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la connexion" });
    }
});

// Mot de passe oublié (Demande)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Pour des raisons de sécurité, on ne dit pas si l'email n'existe pas
            return res.json({ message: "Si cet email existe, un lien a été envoyé." });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Expire dans 1 heure

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [token, expires, email]
        );

        // Simulation d'envoi d'email
        console.log(`--- [SIMULATION EMAIL] ---`);
        console.log(`Pour: ${email}`);
        console.log(`Lien de reset: http://localhost:5173/reset-password/${token}`);
        console.log(`--------------------------`);

        res.json({ message: "Si cet email existe, un lien a été envoyé." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Réinitialisation réelle
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Le lien est invalide ou a expiré." });
        }

        const user = result.rows[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({ message: "Votre mot de passe a été modifié avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- Routes Paramètres (Settings) ---

// Récupérer les paramètres
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT company_name, tva_number, phone, website, street, city, zip_code, country, bank_name, iban, bic, logo_path FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(result.rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des paramètres" });
    }
});

// Mettre à jour les paramètres
app.put('/api/settings', authenticateToken, async (req, res) => {
    const { 
        company_name, tva_number, phone, website, 
        street, city, zip_code, country, 
        bank_name, iban, bic 
    } = req.body;

    try {
        await pool.query(
            `UPDATE users SET 
                company_name = $1, tva_number = $2, phone = $3, website = $4, 
                street = $5, city = $6, zip_code = $7, country = $8, 
                bank_name = $9, iban = $10, bic = $11 
            WHERE id = $12`,
            [
                company_name, tva_number, phone, website, 
                street, city, zip_code, country, 
                bank_name, iban, bic, 
                req.user.id
            ]
        );
        res.json({ message: "Paramètres mis à jour avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres" });
    }
});

// --- Route Comptabilité (VAT Calculation) ---

app.get('/api/accounting/vat', authenticateToken, async (req, res) => {
    const { year, quarter } = req.query;

    if (!year || !quarter) {
        return res.status(400).json({ error: "Year and Quarter are required" });
    }

    // Determine date range for the quarter
    const startMonth = (parseInt(quarter) - 1) * 3; // 0 for Q1, 3 for Q2...
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0); // Last day of the quarter

    // Format dates for SQL (YYYY-MM-DD)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
        // --- 1. CALCUL DES VENTES (SORTIES) ---
        // On récupère toutes les lignes de factures payées ou envoyées (selon la logique comptable choisie, ici 'sent' ou 'paid')
        // En Belgique, la TVA est due à la facturation.
        const salesQuery = `
            SELECT 
                ii.vat_rate, 
                SUM(ii.quantity * ii.unit_price) as total_base,
                SUM(ii.quantity * ii.unit_price * (ii.vat_rate / 100.0)) as total_vat
            FROM invoice_items ii
            JOIN invoices i ON ii.invoice_id = i.id
            WHERE i.user_id = $1 
            AND i.date >= $2 AND i.date <= $3
            AND i.status != 'draft' -- On ne compte pas les brouillons
            GROUP BY ii.vat_rate
        `;
        const salesResult = await pool.query(salesQuery, [req.user.id, startDateStr, endDateStr]);

        // --- 2. CALCUL DES ACHATS (ENTREES) ---
        const expensesQuery = `
            SELECT 
                category,
                SUM(amount_excl) as total_base,
                SUM(vat_amount) as total_vat
            FROM expenses
            WHERE user_id = $1
            AND date >= $2 AND date <= $3
            GROUP BY category
        `;
        const expensesResult = await pool.query(expensesQuery, [req.user.id, startDateStr, endDateStr]);

        // --- 3. REMPLISSAGE DE LA GRILLE ---
        let grid = {
            '00': 0, '01': 0, '02': 0, '03': 0, // Ventes
            '54': 0, // Total TVA Due
            '81': 0, '82': 0, '83': 0, // Achats (Bases)
            '59': 0, // Total TVA Déductible
            '71': 0, '72': 0 // Solde
        };

        // Traitement des Ventes
        salesResult.rows.forEach(row => {
            const rate = parseInt(row.vat_rate);
            const base = parseFloat(row.total_base);
            const vat = parseFloat(row.total_vat);

            if (rate === 0) grid['00'] += base;
            else if (rate === 6) grid['01'] += base;
            else if (rate === 12) grid['02'] += base;
            else if (rate === 21) grid['03'] += base;

            grid['54'] += vat;
        });

        // Traitement des Achats
        expensesResult.rows.forEach(row => {
            const cat = row.category; // '81', '82', '83'
            const base = parseFloat(row.total_base);
            const vat = parseFloat(row.total_vat);

            if (grid[cat] !== undefined) {
                grid[cat] += base;
            }
            grid['59'] += vat;
        });

        // Calcul du Solde
        // Case 71: Dû à l'état (TVA Ventes - TVA Achats)
        // Case 72: Dû par l'état (TVA Achats - TVA Ventes)
        const balance = grid['54'] - grid['59'];

        if (balance > 0) {
            grid['71'] = balance;
        } else {
            grid['72'] = Math.abs(balance);
        }

        res.json({ grid });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors du calcul TVA" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur API démarré sur http://localhost:${PORT}`);
});
