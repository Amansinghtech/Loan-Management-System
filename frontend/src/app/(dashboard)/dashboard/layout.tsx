'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { LoadingState } from '@/components/states';
import { Topbar } from '@/components/topbar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-secondary/30">
      <Topbar homeHref="/dashboard" />
      <div className="container py-6">
        {isLoading || !user ? (
          <LoadingState />
        ) : (
          <div className="flex flex-col gap-6 md:flex-row">
            <Sidebar role={user.role} />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        )}
      </div>
    </div>
  );
}
