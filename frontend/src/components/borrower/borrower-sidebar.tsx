'use client';

import { cn } from '@/lib/utils';
import { FileText, LayoutDashboard, LifeBuoy, PlusCircle, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/apply', label: 'Apply', icon: PlusCircle },
  { href: '/loans', label: 'My Loans', icon: FileText },
  { href: '/profile', label: 'My Profile', icon: UserRound },
  { href: '/support', label: 'Support', icon: LifeBuoy },
];

export function BorrowerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 md:w-60">
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'brand-gradient font-medium text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
