'use client';

import { Badge } from '@/components/ui/badge';
import { modulesForRole, ROLE_LABELS } from '@/lib/roles';
import { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Banknote, HandCoins, Receipt, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS: Record<string, React.ReactNode> = {
  sales: <Users className="h-4 w-4" />,
  sanction: <Banknote className="h-4 w-4" />,
  disbursement: <HandCoins className="h-4 w-4" />,
  collection: <Receipt className="h-4 w-4" />,
  payments: <Wallet className="h-4 w-4" />,
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const modules = modulesForRole(role);

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-3">
        <span className="text-sm font-medium">Operations</span>
        <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
        {modules.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.key}
              href={m.href}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors md:border-transparent',
                active
                  ? 'border-primary/20 bg-primary/10 font-medium text-primary'
                  : 'hover:bg-accent',
              )}
            >
              {ICONS[m.key]}
              <span className="flex flex-col">
                <span>{m.label}</span>
                <span className="hidden text-xs text-muted-foreground md:inline">
                  {m.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
