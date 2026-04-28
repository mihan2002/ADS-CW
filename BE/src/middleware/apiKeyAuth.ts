import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { apiClientsTable, apiKeysTable, apiKeyPermissionsTable, apiKeyUsageTable } from "../db/schema.js";

const API_KEY_PREFIX = "api_";

function getPresentedApiKey(req: Request): string | null {
  const xApiKey = req.header("x-api-key");
  if (xApiKey && typeof xApiKey === "string") return xApiKey.trim();

  const auth = req.header("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token.startsWith(API_KEY_PREFIX)) return null;
  return token;
}

function hashApiKey(rawKey: string): string {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) {
    throw new Error("API_KEY_PEPPER is not configured");
  }
  return crypto.createHash("sha256").update(`${rawKey}.${pepper}`).digest("hex");
}

async function loadApiKeyAuth(rawKey: string) {
  const keyHash = hashApiKey(rawKey);

  const keyRows = await db
    .select({
      id: apiKeysTable.id,
      client_id: apiKeysTable.client_id,
      key_prefix: apiKeysTable.key_prefix,
      revoked_at: apiKeysTable.revoked_at,
      client_name: apiClientsTable.name,
      client_revoked_at: apiClientsTable.revoked_at,
    })
    .from(apiKeysTable)
    .innerJoin(apiClientsTable, eq(apiClientsTable.id, apiKeysTable.client_id))
    .where(and(eq(apiKeysTable.key_hash, keyHash), isNull(apiKeysTable.revoked_at)))
    .limit(1);

  if (keyRows.length === 0) return null;

  const keyRow = keyRows[0]!;
  if (keyRow.client_revoked_at) return null;

  const perms = await db
    .select({ permission: apiKeyPermissionsTable.permission })
    .from(apiKeyPermissionsTable)
    .where(eq(apiKeyPermissionsTable.api_key_id, keyRow.id));

  return {
    apiKeyId: keyRow.id,
    clientName: keyRow.client_name,
    permissions: perms.map((p) => p.permission),
  };
}

function trackUsage(req: Request, res: Response) {
  const auth = req.apiKeyAuth;
  if (!auth) return;

  res.on("finish", () => {
    const endpoint = req.originalUrl.split("?")[0] ?? req.originalUrl;
    void db.insert(apiKeyUsageTable).values({
      api_key_id: auth.apiKeyId,
      endpoint,
      method: req.method,
      status_code: res.statusCode,
      used_at: new Date(),
    });

    void db
      .update(apiKeysTable)
      .set({ last_used_at: new Date() })
      .where(eq(apiKeysTable.id, auth.apiKeyId));
  });
}

export function requireApiKey(requiredPermissions: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawKey = getPresentedApiKey(req);
      if (!rawKey) {
        res.status(401).json({ success: false, message: "API key required" });
        return;
      }

      const auth = await loadApiKeyAuth(rawKey);
      if (!auth) {
        res.status(401).json({ success: false, message: "Invalid API key" });
        return;
      }

      if (requiredPermissions.length > 0) {
        const ok = requiredPermissions.every((p) => auth.permissions.includes(p));
        if (!ok) {
          res.status(403).json({ success: false, message: "Forbidden" });
          return;
        }
      }

      req.apiKeyAuth = auth;
      trackUsage(req, res);
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  };
}

