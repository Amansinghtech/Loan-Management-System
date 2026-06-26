import { NextFunction, Request, Response } from 'express';
import { Role } from '../types';
import { ApiError } from '../utils/ApiError';
import { AUTH_COOKIE, verifyToken } from '../utils/jwt';

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Verifies the JWT cookie and attaches the user to the request. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) {
    throw ApiError.unauthorized();
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }
}
