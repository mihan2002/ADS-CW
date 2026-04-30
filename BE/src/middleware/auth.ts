import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

function unauthorized(res: Response, message = "Unauthorized") {
  res.status(401).json({ success: false, message });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log('[Auth Debug] Authorization Header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'undefined');
  
  if (!authHeader?.startsWith("Bearer ")) {
    console.log('[Auth Debug] No Bearer token found in header');
    return unauthorized(res, "No token provided");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  console.log('[Auth Debug] Extracted Token:', token ? `${token.substring(0, 20)}...` : 'empty');
  
  if (!token) {
    console.log('[Auth Debug] Token is empty after extraction');
    return unauthorized(res, "No token provided");
  }

  try {
    const payload = AuthService.verifyToken(token);
    console.log('[Auth Debug] Decoded Payload:', JSON.stringify(payload, null, 2));
    
    // Validate payload structure
    if (!payload || typeof payload.userId !== 'number' || !payload.role) {
      console.error('[Auth Debug] JWT Payload Invalid:', payload);
      return unauthorized(res, "Invalid token payload");
    }
    
    console.log('[Auth Debug] Token validated successfully for user:', payload.userId, 'role:', payload.role);
    req.auth = payload;
    next();
  } catch (err) {
    console.error('[Auth Debug] Token verification failed:', (err as Error).message);
    console.error('[Auth Debug] Error details:', err);
    const status = (err as any).statusCode ?? 401;
    res.status(status).json({ success: false, message: (err as Error).message });
  }
}

export function requireSelfOrRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return unauthorized(res);

    const rawUserId = req.params.userId ?? req.params.id;
    const targetUserId = rawUserId ? Number(rawUserId) : NaN;

    // Ensure both userId values are numbers for comparison
    const authUserId = Number(req.auth.userId);
    
    // Check if user is accessing their own resource
    const isSelf = Number.isInteger(targetUserId) && 
                   Number.isInteger(authUserId) && 
                   targetUserId === authUserId;
    
    // Check if user has required role
    const hasRole = roles.includes(req.auth.role);

    // Debug logging for authorization failures (remove in production)
    if (!isSelf && !hasRole) {
      console.error('[Authorization Failed]', {
        targetUserId,
        authUserId,
        userRole: req.auth.role,
        requiredRoles: roles,
        isSelf,
        hasRole
      });
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

