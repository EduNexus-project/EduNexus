import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
};

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
