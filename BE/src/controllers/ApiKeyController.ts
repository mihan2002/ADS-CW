import type { Request, Response } from "express";
import { ZodError, z } from "zod";
import { ApiKeyService, API_PERMISSIONS } from "../services/ApiKeyService.js";

const CreateApiKeyDto = z
  .object({
    clientName: z.string().min(1),
    permissions: z.array(z.enum(API_PERMISSIONS)).default([]),
  })
  .strict();

export class ApiKeyController {
  static async create(req: Request, res: Response) {
    try {
      const dto = CreateApiKeyDto.parse(req.body);
      const created = await ApiKeyService.createKey({
        clientName: dto.clientName,
        permissions: dto.permissions,
      });
      res.status(201).json({ success: true, data: created, message: "API key created" });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: err.issues });
        return;
      }
      const status = (err as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (err as Error).message });
    }
  }

  static async list(_req: Request, res: Response) {
    try {
      const keys = await ApiKeyService.listKeys();
      res.status(200).json({ success: true, data: keys, message: "API keys retrieved" });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  static async revoke(req: Request, res: Response) {
    try {
      const id = Number(req.params.apiKeyId);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Valid apiKeyId is required" });
        return;
      }
      await ApiKeyService.revokeKey(id);
      res.status(200).json({ success: true, message: "API key revoked" });
    } catch (err) {
      const status = (err as any).statusCode ?? 500;
      res.status(status).json({ success: false, message: (err as Error).message });
    }
  }
}

