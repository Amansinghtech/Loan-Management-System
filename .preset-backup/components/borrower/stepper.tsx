import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary text-primary',
                !done && !active && 'border-input text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={cn(
                'hidden text-sm sm:inline',
                active ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={cn('mx-1 h-px flex-1', done ? 'bg-primary' : 'bg-border')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
