import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class ErrorHandler {
  static handle(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    // Handle Zod validation errors (v4 uses .issues)
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    console.error("Error:", err);

    const status = (err as any).statusCode ?? 500;

    res.status(status).json({
      success: false,
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  static notFound(_req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
}
