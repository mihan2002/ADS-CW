import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from './schema.js';

/**
 * Database initialization script
 * Creates all database tables if they don't exist
 * Can be run multiple times safely (idempotent)
 */

async function initializeDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔧 Initializing database...\n');

  try {
    // Create connection pool
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection, { schema, mode: 'default' });

    console.log('✅ Database connection established');

    // Run migrations from the drizzle folder
    console.log('📦 Running migrations...');
    try {
      await migrate(db, { migrationsFolder: './drizzle' });
      console.log('✅ Migrations completed successfully');
    } catch (error: any) {
      if (error.message?.includes('no migration files found')) {
        console.log('⚠️  No migration files found, creating tables manually...');
        await createTablesManually(connection);
      } else if (error.message?.includes('SQL syntax') || error.cause?.code === 'ER_PARSE_ERROR') {
        console.log('⚠️  Migration has SQL syntax errors (MariaDB compatibility issue)');
        console.log('⚠️  Falling back to manual table creation...\n');
        await createTablesManually(connection);
      } else {
        throw error;
      }
    }

    // Verify tables exist
    console.log('\n📊 Verifying database tables...');
    const tables = await verifyTables(connection);
    
    console.log('\n✅ Database initialization complete!');
    console.log(`📋 Total tables: ${tables.length}`);
    console.log('Tables:', tables.join(', '));

    await connection.end();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Verify which tables exist in the database
 */
async function verifyTables(connection: mysql.Connection): Promise<string[]> {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME 
     FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() 
     ORDER BY TABLE_NAME`
  );
  
  return rows.map(row => row.TABLE_NAME as string);
}

/**
 * Manually create all tables if migrations fail
 * This is a fallback method
 */
async function createTablesManually(connection: mysql.Connection) {
  console.log('Creating tables from schema...\n');

  // Create tables in order (respecting foreign key dependencies)
  const createTableQueries = [
    // 1. Users table (no dependencies)
    `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`age\` INT,
      \`email\` VARCHAR(255) NOT NULL UNIQUE,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(50) NOT NULL DEFAULT 'user',
      \`is_email_verified\` INT NOT NULL DEFAULT 0,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`last_login_at\` TIMESTAMP NULL,
      PRIMARY KEY (\`id\`)
    )`,

    // 2. Email verification tokens (depends on users)
    `CREATE TABLE IF NOT EXISTS \`email_verification_tokens\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`token_hash\` VARCHAR(255) NOT NULL UNIQUE,
      \`expires_at\` TIMESTAMP NOT NULL,
      \`used_at\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 3. Password reset tokens (depends on users)
    `CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`token_hash\` VARCHAR(255) NOT NULL UNIQUE,
      \`expires_at\` TIMESTAMP NOT NULL,
      \`used_at\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 4. API clients (no dependencies)
    `CREATE TABLE IF NOT EXISTS \`api_clients\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`revoked_at\` TIMESTAMP NULL,
      PRIMARY KEY (\`id\`)
    )`,

    // 5. API keys (depends on api_clients)
    `CREATE TABLE IF NOT EXISTS \`api_keys\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`client_id\` INT NOT NULL,
      \`key_prefix\` VARCHAR(32) NOT NULL,
      \`key_hash\` VARCHAR(255) NOT NULL UNIQUE,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`last_used_at\` TIMESTAMP NULL,
      \`revoked_at\` TIMESTAMP NULL,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`client_id\`) REFERENCES \`api_clients\`(\`id\`) ON DELETE CASCADE
    )`,

    // 6. API key permissions (depends on api_keys)
    `CREATE TABLE IF NOT EXISTS \`api_key_permissions\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`api_key_id\` INT NOT NULL,
      \`permission\` VARCHAR(64) NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`api_key_id\`) REFERENCES \`api_keys\`(\`id\`) ON DELETE CASCADE
    )`,

    // 7. API key usage (depends on api_keys)
    `CREATE TABLE IF NOT EXISTS \`api_key_usage\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`api_key_id\` INT NOT NULL,
      \`endpoint\` VARCHAR(255) NOT NULL,
      \`method\` VARCHAR(16) NOT NULL,
      \`status_code\` INT NOT NULL,
      \`used_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`api_key_id\`) REFERENCES \`api_keys\`(\`id\`) ON DELETE CASCADE
    )`,

    // 8. Alumni profiles (depends on users)
    `CREATE TABLE IF NOT EXISTS \`alumni_profiles\` (
      \`user_id\` INT NOT NULL,
      \`first_name\` VARCHAR(255) NOT NULL,
      \`last_name\` VARCHAR(255) NOT NULL,
      \`bio\` VARCHAR(1000),
      \`programme\` VARCHAR(255),
      \`graduation_year\` INT,
      \`graduation_date\` DATE,
      \`degree\` VARCHAR(255),
      \`industry_sector\` VARCHAR(255),
      \`geography\` VARCHAR(255),
      \`current_position\` VARCHAR(255),
      \`linkedin_url\` VARCHAR(255),
      \`profile_image_id\` INT,
      \`appearance_count\` INT DEFAULT 0,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 9. Degrees (depends on users)
    `CREATE TABLE IF NOT EXISTS \`degrees\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`institution_name\` VARCHAR(255) NOT NULL,
      \`official_url\` VARCHAR(255),
      \`completed_on\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 10. Certifications (depends on users)
    `CREATE TABLE IF NOT EXISTS \`certifications\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`provider\` VARCHAR(255) NOT NULL,
      \`course_url\` VARCHAR(255),
      \`completed_on\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 11. Licenses (depends on users)
    `CREATE TABLE IF NOT EXISTS \`licenses\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`awarding_body\` VARCHAR(255) NOT NULL,
      \`license_url\` VARCHAR(255),
      \`completed_on\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 12. Professional courses (depends on users)
    `CREATE TABLE IF NOT EXISTS \`professional_courses\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`provider\` VARCHAR(255) NOT NULL,
      \`course_url\` VARCHAR(255),
      \`completed_on\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 13. Employment history (depends on users)
    `CREATE TABLE IF NOT EXISTS \`employment_history\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`company\` VARCHAR(255) NOT NULL,
      \`job_title\` VARCHAR(255) NOT NULL,
      \`start_date\` TIMESTAMP NOT NULL,
      \`end_date\` TIMESTAMP NULL,
      \`description\` VARCHAR(1000),
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 14. Sponsors (no dependencies)
    `CREATE TABLE IF NOT EXISTS \`sponsors\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`website_url\` VARCHAR(255),
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    )`,

    // 15. Bids (depends on users) - must be created before feature_days
    `CREATE TABLE IF NOT EXISTS \`bids\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`target_day\` DATE NOT NULL,
      \`amount\` DECIMAL(10, 2) NOT NULL,
      \`status\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
      INDEX \`target_day_idx\` (\`target_day\`),
      INDEX \`status_idx\` (\`status\`)
    )`,

    // 16. Feature days (depends on users and bids)
    `CREATE TABLE IF NOT EXISTS \`feature_days\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`day\` DATE,
      \`winner_user_id\` INT,
      \`winning_bid_id\` INT,
      \`selected_at\` TIMESTAMP NULL,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`winner_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
      FOREIGN KEY (\`winning_bid_id\`) REFERENCES \`bids\`(\`id\`) ON DELETE SET NULL,
      INDEX \`day_idx\` (\`day\`)
    )`,

    // 17. Sponsorship offers (depends on sponsors and users)
    `CREATE TABLE IF NOT EXISTS \`sponsorship_offers\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`sponsor_id\` INT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`offer_type\` VARCHAR(255) NOT NULL,
      \`reference_id\` INT NOT NULL,
      \`offer_amount\` DECIMAL(10, 2) NOT NULL,
      \`status\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`expires_at\` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`sponsor_id\`) REFERENCES \`sponsors\`(\`id\`) ON DELETE CASCADE,
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,

    // 18. Alumni event participation (depends on users)
    `CREATE TABLE IF NOT EXISTS \`alumni_event_participation\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`event_date\` DATE NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    )`,
  ];

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < createTableQueries.length; i++) {
    try {
      await connection.query(createTableQueries[i]);
      console.log(`✅ Table ${i + 1}/${createTableQueries.length} created`);
      created++;
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
        console.log(`⏭️  Table ${i + 1}/${createTableQueries.length} already exists, skipping`);
        skipped++;
      } else {
        console.error(`❌ Failed to create table ${i + 1}:`, error.message);
        failed++;
      }
    }
  }

  console.log(`\n✅ Manual table creation completed (${created} created, ${skipped} skipped, ${failed} failed)`);
}

// Run the initialization
initializeDatabase();
