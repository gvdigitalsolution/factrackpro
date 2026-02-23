const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwksRsa = require('jwks-rsa');

const clientsRouter = require('./routes/clients');
const documentsRouter = require('./routes/documents');
const paymentsRouter = require('./routes/payments');
const productsRouter = require('./routes/products');
const expensesRouter = require('./routes/expenses');
const accountingRouter = require('./routes/accounting');
const intervatRouter = require('./routes/intervat');
const settingsRouter = require('./routes/settings');
const authRouter = require('./routes/auth');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

// Neon Auth Configuration (JWKS)
const jwksClient = jwksRsa({
  jwksUri: 'https://ep-floral-night-ago6isor.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth/.well-known/jwks.json'
});

// Helper function to verify token with JWKS (Neon Auth)
const verifyNeonToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, (header, callback) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    }, {}, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

// Middleware to set RLS context
const setRlsContext = async (req, res, next) => {
  if (req.originalUrl.startsWith('/api/auth')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé (Token manquant)' });
  }

  try {
    // Strategy: Try Local JWT first (Default for dev), if fails, try Neon Auth (Production/Cloud)
    // In a real scenario, you might want to flip this or use an ENV var to switch modes.
    // Given the user request "rend ceci possible... si vous souhaitez basculer...", 
    // we enable BOTH.
    
    let decoded;
    try {
      // 1. Try Local
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (localErr) {
      // 2. Try Neon Auth (JWKS) if local fails
      try {
        decoded = await verifyNeonToken(token);
        // Map Neon sub/id to our internal structure if needed
        // Neon tokens usually have 'sub' as the user ID.
        // We might need to ensure this user exists in our DB?
        // For now, we assume 'sub' or 'email' matches our users table 'auth_id' or 'email'.
        if (!decoded.id && decoded.sub) {
            decoded.id = decoded.sub; // Map sub to id for compatibility
        }
      } catch (remoteErr) {
        throw new Error('Invalid Token');
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api', setRlsContext);

app.get('/', (req, res) => {
  res.send('FactTrack Pro API Running');
});

app.use('/api/clients', clientsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/products', productsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/intervat', intervatRouter);
app.use('/api/settings', settingsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
