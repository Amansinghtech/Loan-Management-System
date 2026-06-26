import { NextFunction, Request, Response } from 'express';
import { Role } from '../types';
import { ApiError } from '../utils/ApiError';

/**
 * Restricts a route to the given roles. ADMIN always passes (full access).
 * Must run after `authenticate`. Returns 403 for an authenticated-but-wrong role.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (req.user.role === Role.ADMIN || roles.includes(req.user.role)) {
      next();
      return;
    }
    throw ApiError.forbidden();
  };
}
