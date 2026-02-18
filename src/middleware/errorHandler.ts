import type { Request, Response, NextFunction } from 'express';

export class ErrorHandler {
  static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  static notFound(req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  }
}
