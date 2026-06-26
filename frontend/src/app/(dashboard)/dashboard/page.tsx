'use client';

import { LoadingState } from '@/components/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { modulesForRole } from '@/lib/roles';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <LoadingState />;

  const modules = modulesForRole(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-sm text-muted-foreground">
          Select a module to manage loans at your stage of the lifecycle.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.key} href={m.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {m.label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>{m.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Open the {m.label.toLowerCase()} module.
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
