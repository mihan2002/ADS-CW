import * as mysql from "mysql2/promise";

type EnsureResult = { changed: boolean; messages: string[] };

async function tableExists(conn: mysql.Connection, tableName: string): Promise<boolean> {
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    `,
    [tableName],
  );
  const cnt = Number((rows[0] as mysql.RowDataPacket | undefined)?.cnt ?? 0);
  return cnt > 0;
}

async function columnExists(
  conn: mysql.Connection,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName],
  );
  const cnt = Number((rows[0] as mysql.RowDataPacket | undefined)?.cnt ?? 0);
  return cnt > 0;
}

/**
 * Best-effort, idempotent schema bootstrap for local dev.
 * This avoids 500s when the DB exists but is missing newer tables/columns.
 */
export async function ensureSchema(): Promise<EnsureResult> {
  const url = process.env.DATABASE_URL;
  if (!url) return { changed: false, messages: ["DATABASE_URL not set; skipping schema ensure"] };

  const conn = await mysql.createConnection(url);
  const messages: string[] = [];
  let changed = false;

  try {
    // ---- API key tables ----
    // These are safe to create if absent.
    const hasApiClients = await tableExists(conn, "api_clients");
    if (!hasApiClients) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`api_clients\` (
          \`id\` INT AUTO_INCREMENT NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`revoked_at\` TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        )
      `);
      changed = true;
      messages.push("created table api_clients");
    }

    const hasApiKeys = await tableExists(conn, "api_keys");
    if (!hasApiKeys) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`api_keys\` (
          \`id\` INT AUTO_INCREMENT NOT NULL,
          \`client_id\` INT NOT NULL,
          \`key_prefix\` VARCHAR(32) NOT NULL,
          \`key_hash\` VARCHAR(255) NOT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`last_used_at\` TIMESTAMP NULL DEFAULT NULL,
          \`revoked_at\` TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE (\`key_hash\`),
          FOREIGN KEY (\`client_id\`) REFERENCES \`api_clients\`(\`id\`) ON DELETE CASCADE
        )
      `);
      changed = true;
      messages.push("created table api_keys");
    }

    const hasApiKeyPermissions = await tableExists(conn, "api_key_permissions");
    if (!hasApiKeyPermissions) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`api_key_permissions\` (
          \`id\` INT AUTO_INCREMENT NOT NULL,
          \`api_key_id\` INT NOT NULL,
          \`permission\` VARCHAR(64) NOT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          FOREIGN KEY (\`api_key_id\`) REFERENCES \`api_keys\`(\`id\`) ON DELETE CASCADE
        )
      `);
      changed = true;
      messages.push("created table api_key_permissions");
    }

    const hasApiKeyUsage = await tableExists(conn, "api_key_usage");
    if (!hasApiKeyUsage) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`api_key_usage\` (
          \`id\` INT AUTO_INCREMENT NOT NULL,
          \`api_key_id\` INT NOT NULL,
          \`endpoint\` VARCHAR(255) NOT NULL,
          \`method\` VARCHAR(16) NOT NULL,
          \`status_code\` INT NOT NULL,
          \`used_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          FOREIGN KEY (\`api_key_id\`) REFERENCES \`api_keys\`(\`id\`) ON DELETE CASCADE
        )
      `);
      changed = true;
      messages.push("created table api_key_usage");
    }

    // ---- Alumni profile extra columns ----
    // If alumni_profiles table doesn't exist yet, don't attempt partial creation here;
    // the base schema should be created via the initial migration.
    const hasAlumniProfiles = await tableExists(conn, "alumni_profiles");
    if (hasAlumniProfiles) {
      const profileColumns: Array<[string, string]> = [
        ["programme", "VARCHAR(255) NULL"],
        ["graduation_date", "DATE NULL"],
        ["industry_sector", "VARCHAR(255) NULL"],
        ["geography", "VARCHAR(255) NULL"],
      ];

      for (const [col, ddl] of profileColumns) {
        const exists = await columnExists(conn, "alumni_profiles", col);
        if (!exists) {
          await conn.query(`ALTER TABLE \`alumni_profiles\` ADD COLUMN \`${col}\` ${ddl}`);
          changed = true;
          messages.push(`added alumni_profiles.${col}`);
        }
      }
    } else {
      messages.push("table alumni_profiles missing; run initial DB migration (0000) to create base tables");
    }

    // ---- bids.target_day ----
    const hasBids = await tableExists(conn, "bids");
    if (hasBids) {
      const hasTargetDay = await columnExists(conn, "bids", "target_day");
      if (!hasTargetDay) {
        await conn.query(`ALTER TABLE \`bids\` ADD COLUMN \`target_day\` DATE NULL`);
        await conn.query(`
          UPDATE \`bids\`
          SET \`target_day\` = DATE(DATE_ADD(\`created_at\`, INTERVAL 1 DAY))
          WHERE \`target_day\` IS NULL
        `);
        await conn.query(`ALTER TABLE \`bids\` MODIFY COLUMN \`target_day\` DATE NOT NULL`);
        changed = true;
        messages.push("added bids.target_day");
      }
    } else {
      messages.push("table bids missing; run initial DB migration (0000) to create base tables");
    }

    return { changed, messages };
  } finally {
    await conn.end();
  }
}

