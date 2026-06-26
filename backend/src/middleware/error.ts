import { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, errors: err.details });
    return;
  }

  // Duplicate key (e.g. unique email or UTR number)
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({ message: `Duplicate value for ${field}.` });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(env.nodeEnv === 'development' && err instanceof Error ? { detail: err.message } : {}),
  });
}
