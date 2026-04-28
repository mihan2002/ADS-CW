import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

function unauthorized(res: Response, message = "Unauthorized") {
  res.status(401).json({ success: false, message });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return unauthorized(res, "No token provided");

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return unauthorized(res, "No token provided");

  try {
    req.auth = AuthService.verifyToken(token);
    next();
  } catch (err) {
    const status = (err as any).statusCode ?? 401;
    res.status(status).json({ success: false, message: (err as Error).message });
  }
}

export function requireSelfOrRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return unauthorized(res);

    const rawUserId = req.params.userId ?? req.params.id;
    const targetUserId = rawUserId ? Number(rawUserId) : NaN;

    const isSelf = Number.isInteger(targetUserId) && targetUserId === req.auth.userId;
    const hasRole = roles.includes(req.auth.role);

    if (!isSelf && !hasRole) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    next();
  };
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return unauthorized(res);
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    next();
  };
}

