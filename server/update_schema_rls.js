const db = require('./db');
const bcrypt = require('bcryptjs');

const updateSchema = async () => {
  try {
    console.log('Début de la migration RLS...');

    // 1. Create Users Table
    // Note: 'auth_id' will store the ID from Neon Auth / Clerk / Internal
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        auth_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db.query(createUsersTable);
    console.log('Table users créée.');

    // 2. Add user_id column to all tables
    const tables = ['clients', 'documents', 'expenses', 'products', 'company_settings', 'payments'];
    
    for (const table of tables) {
      console.log(`Mise à jour de la table ${table}...`);
      
      // Add column
      // We use auth_id (string) as the reference, not the serial ID, to be compatible with external Auth providers easily
      // OR we link to our local 'users.id'. Let's link to 'users.id' (SERIAL) for better DB performance, 
      // and map auth_id -> user_id in the backend.
      await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
      
      // Enable RLS
      await db.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      
      // Create Policy
      // We check if policy exists first to avoid error? Postgres 'CREATE POLICY IF NOT EXISTS' is only in newer versions (9.5+ supports CREATE POLICY but not IF NOT EXISTS until 16?)
      // Let's drop and recreate to be safe
      await db.query(`DROP POLICY IF EXISTS "Users can only access their own data" ON ${table}`);
      
      // Policy: access if user_id matches the session variable 'app.current_user_id'
      await db.query(`
        CREATE POLICY "Users can only access their own data" 
        ON ${table}
        USING (user_id = current_setting('app.current_user_id', true)::INTEGER)
        WITH CHECK (user_id = current_setting('app.current_user_id', true)::INTEGER)
      `);
    }
    console.log('RLS activé sur toutes les tables.');

    // 3. Create a default user for existing data (Migration)
    // We'll create a default user 'admin@example.com' / 'password'
    const defaultEmail = 'admin@example.com';
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    // Insert default user if not exists
    const userRes = await db.query(`
      INSERT INTO users (auth_id, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `, ['default_admin', defaultEmail, hash]);
    
    const defaultUserId = userRes.rows[0].id;
    console.log(`Utilisateur par défaut ID: ${defaultUserId}`);

    // 4. Assign existing data to default user
    for (const table of tables) {
      await db.query(`UPDATE ${table} SET user_id = $1 WHERE user_id IS NULL`, [defaultUserId]);
    }
    console.log('Données existantes assignées à l\'utilisateur par défaut.');

  } catch (err) {
    console.error('Erreur lors de la migration RLS:', err);
  } finally {
    process.exit();
  }
};

updateSchema();
