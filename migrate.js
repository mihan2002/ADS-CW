import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const connection = await createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Dropping existing tables if any...');
    const dropTables = [
      'alumni_event_participation',
      'employment_history',
      'licenses',
      'certifications',
      'degrees',
      'sponsorship_offers',
      'sponsors',
      'bids',
      'feature_days',
      'password_reset_tokens',
      'email_verification_tokens',
      'alumni_profiles',
      'users'
    ];
    
    for (const table of dropTables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
      } catch (e) {
        // Ignore errors
      }
    }
    console.log('✓ Existing tables dropped');
    
    console.log('Reading migration file...');
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'drizzle', '0000_complex_darkhawk.sql'),
      'utf-8'
    );
    
    // Fix MariaDB syntax issues
    let fixedSql = sqlFile;
    
    // Replace serial AUTO_INCREMENT with bigint unsigned AUTO_INCREMENT
    fixedSql = fixedSql.replace(/serial AUTO_INCREMENT/g, 'bigint unsigned AUTO_INCREMENT');
    
    // Fix foreign key type mismatches - change int references to bigint unsigned
    // to match serial primary keys
    fixedSql = fixedSql.replace(/`user_id` int NOT NULL,/g, '`user_id` bigint unsigned NOT NULL,');
    fixedSql = fixedSql.replace(/`user_id` int NOT NULL\n/g, '`user_id` bigint unsigned NOT NULL\n');
    fixedSql = fixedSql.replace(/`user_id` int,/g, '`user_id` bigint unsigned,');
    fixedSql = fixedSql.replace(/`user_id` int\n/g, '`user_id` bigint unsigned\n');
    
    fixedSql = fixedSql.replace(/`sponsor_id` int NOT NULL,/g, '`sponsor_id` bigint unsigned NOT NULL,');
    fixedSql = fixedSql.replace(/`sponsor_id` int NOT NULL\n/g, '`sponsor_id` bigint unsigned NOT NULL\n');
    
    fixedSql = fixedSql.replace(/`winner_user_id` int,/g, '`winner_user_id` bigint unsigned,');
    fixedSql = fixedSql.replace(/`winner_user_id` int\n/g, '`winner_user_id` bigint unsigned\n');
    
    fixedSql = fixedSql.replace(/`winning_bid_id` int,/g, '`winning_bid_id` bigint unsigned,');
    fixedSql = fixedSql.replace(/`winning_bid_id` int\n/g, '`winning_bid_id` bigint unsigned\n');
    
    // Fix ALL timestamp fields to have proper defaults for MariaDB
    // First make all nullable timestamps explicitly null
    fixedSql = fixedSql.replace(/`(\w+)` timestamp,/g, '`$1` timestamp NULL DEFAULT NULL,');
    fixedSql = fixedSql.replace(/`(\w+)` timestamp\n/g, '`$1` timestamp NULL DEFAULT NULL\n');
    
    // Then fix NOT NULL timestamps
    fixedSql = fixedSql.replace(/`(\w+)` timestamp NOT NULL,/g, '`$1` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,');
    fixedSql = fixedSql.replace(/`(\w+)` timestamp NOT NULL\n/g, '`$1` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP\n');
    
    // Special handling for updated_at to add ON UPDATE
    fixedSql = fixedSql.replace(/`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,/g, '`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,');
    fixedSql = fixedSql.replace(/`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP\n/g, '`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n');
    
    // Split by statement breakpoint and execute each statement
    const statements = fixedSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      await connection.execute(statement);
    }
    
    console.log('✓ Database migration completed successfully!');
    console.log('✓ All tables created.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate().catch(console.error);
