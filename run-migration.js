import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await createConnection(process.env.DATABASE_URL);
    console.log('✓ Connected to database');
    
    console.log('Reading migration file...');
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'drizzle', '0001_good_nightmare.sql'),
      'utf-8'
    );
    
    console.log('Applying migration...');
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement}`);
      await connection.execute(statement);
    }
    
    console.log('✓ Migration applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
