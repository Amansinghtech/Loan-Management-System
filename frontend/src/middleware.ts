import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'lms_token';

type Role = 'ADMIN' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'BORROWER';

interface TokenPayload {
  sub: string;
  role: Role;
  exp?: number;
}

/**
 * Decodes (does NOT verify) the JWT payload. This is only for UX-level redirects;
 * the backend re-verifies the signature on every API call.
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    // base64url -> base64, then atob (available in the Edge runtime)
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

const MODULE_ROLE: Record<string, Role> = {
  sales: 'SALES',
  sanction: 'SANCTION',
  disbursement: 'DISBURSEMENT',
  collection: 'COLLECTION',
  // Admin-only overview page; admin bypasses this check entirely. Collection
  // sees the same ledger inline on its own module page.
  payments: 'ADMIN',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  const isAuthed = Boolean(payload) && (!payload?.exp || payload.exp * 1000 > Date.now());
  const role = payload?.role;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const borrowerRoutes = ['/portal', '/apply', '/loans', '/profile', '/support'];
  const isBorrowerRoute = borrowerRoutes.some((r) => pathname.startsWith(r));
  const isProtected = isBorrowerRoute || pathname.startsWith('/dashboard');

  // Unauthenticated users hitting protected routes -> login
  if (!isAuthed && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users on auth pages -> their home
  if (isAuthed && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = role === 'BORROWER' ? '/portal' : '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isAuthed && role) {
    // Borrowers cannot access the dashboard
    if (role === 'BORROWER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/portal', req.url));
    }
    // Executives cannot access the borrower portal
    if (role !== 'BORROWER' && isBorrowerRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Module-level RBAC: non-admins can only open their own module
    const moduleMatch = pathname.match(/^\/dashboard\/(\w+)/);
    if (moduleMatch && role !== 'ADMIN') {
      const requiredRole = MODULE_ROLE[moduleMatch[1]];
      if (requiredRole && requiredRole !== role) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/apply/:path*',
    '/loans/:path*',
    '/profile/:path*',
    '/support/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
