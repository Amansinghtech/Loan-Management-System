import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload, Role } from '../types';

export const AUTH_COOKIE = 'lms_token';

export function signToken(userId: string, role: Role): string {
  const payload: JwtPayload = { sub: userId, role };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export function cookieOptions() {
  // Frontend (Vercel) and API (Render) live on different domains, so the auth
  // cookie is sent cross-site. Browsers only attach a cross-site cookie when it
  // is `SameSite=None; Secure`. Locally (HTTP) we fall back to `Lax`.
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: (env.cookieSecure ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
