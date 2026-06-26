'use client';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useAuth, useAuthActions } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/roles';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Topbar({ homeHref }: { homeHref: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { clear } = useAuthActions();

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clear();
      router.replace('/login');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
      <div className="brand-gradient h-1 w-full" />
      <div className="container flex h-16 items-center justify-between">
        <Link href={homeHref}>
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
