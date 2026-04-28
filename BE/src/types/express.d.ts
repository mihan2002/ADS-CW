import type { TokenPayload } from "../services/AuthService.js";

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
      apiKeyAuth?: {
        apiKeyId: number;
        clientName: string;
        permissions: string[];
      };
    }
  }
}

export {};

