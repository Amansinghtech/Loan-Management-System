import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'brand-gradient inline-flex items-center justify-center rounded-xl text-white shadow-sm',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2" aria-hidden="true">
        <path
          d="M4 16c2.5 0 2.5-8 5-8s2.5 8 5 8 2.5-5 5-5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold', className)}>
      <LogoMark className="h-8 w-8" />
      <span className="text-lg tracking-tight">{BRAND.name}</span>
    </span>
  );
}
