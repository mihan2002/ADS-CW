import crypto from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { apiClientsTable, apiKeysTable, apiKeyPermissionsTable } from "../db/schema.js";

export const API_PERMISSIONS = ["read:alumni", "read:analytics", "read:alumni_of_day"] as const;
export type ApiPermission = (typeof API_PERMISSIONS)[number];

function randomKey(): string {
  return `api_${crypto.randomBytes(24).toString("hex")}`;
}

function hashKey(rawKey: string): string {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) throw new Error("API_KEY_PEPPER is not configured");
  return crypto.createHash("sha256").update(`${rawKey}.${pepper}`).digest("hex");
}

export class ApiKeyService {
  static async createKey(input: { clientName: string; permissions: ApiPermission[] }) {
    const now = new Date();
    const raw = randomKey();
    const prefix = raw.slice(0, 12);
    const keyHash = hashKey(raw);

    const clientInsert = await db
      .insert(apiClientsTable)
      .values({ name: input.clientName, created_at: now })
      .$returningId();

    const clientId = clientInsert[0]?.id;
    if (!clientId) throw new Error("Failed to create API client");

    const keyInsert = await db
      .insert(apiKeysTable)
      .values({
        client_id: clientId,
        key_prefix: prefix,
        key_hash: keyHash,
        created_at: now,
      })
      .$returningId();

    const apiKeyId = keyInsert[0]?.id;
    if (!apiKeyId) throw new Error("Failed to create API key");

    const perms = Array.from(new Set(input.permissions));
    if (perms.some((p) => !(API_PERMISSIONS as readonly string[]).includes(p))) {
      const err = new Error("Invalid permission");
      (err as any).statusCode = 400;
      throw err;
    }

    if (perms.length > 0) {
      await db.insert(apiKeyPermissionsTable).values(
        perms.map((p) => ({
          api_key_id: apiKeyId,
          permission: p,
          created_at: now,
        })),
      );
    }

    return {
      client: { id: clientId, name: input.clientName },
      apiKey: { id: apiKeyId, prefix },
      rawKey: raw,
      permissions: perms,
    };
  }

  static async listKeys() {
    const keys = await db
      .select({
        id: apiKeysTable.id,
        key_prefix: apiKeysTable.key_prefix,
        created_at: apiKeysTable.created_at,
        last_used_at: apiKeysTable.last_used_at,
        revoked_at: apiKeysTable.revoked_at,
        client_id: apiKeysTable.client_id,
        client_name: apiClientsTable.name,
      })
      .from(apiKeysTable)
      .innerJoin(apiClientsTable, eq(apiClientsTable.id, apiKeysTable.client_id))
      .where(isNull(apiKeysTable.revoked_at));

    const perms = await db.select().from(apiKeyPermissionsTable);
    const byKeyId = new Map<number, string[]>();
    for (const p of perms) {
      byKeyId.set(p.api_key_id, [...(byKeyId.get(p.api_key_id) ?? []), p.permission]);
    }

    return keys.map((k) => ({
      ...k,
      permissions: byKeyId.get(k.id) ?? [],
    }));
  }

  static async revokeKey(apiKeyId: number) {
    const now = new Date();
    const rows = await db
      .select()
      .from(apiKeysTable)
      .where(and(eq(apiKeysTable.id, apiKeyId), isNull(apiKeysTable.revoked_at)))
      .limit(1);
    if (rows.length === 0) {
      const err = new Error("API key not found");
      (err as any).statusCode = 404;
      throw err;
    }
    await db.update(apiKeysTable).set({ revoked_at: now }).where(eq(apiKeysTable.id, apiKeyId));
  }
}

