import { LoanStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Ban, Check } from 'lucide-react';

interface Stage {
  key: string;
  label: string;
  hint: string;
}

const STAGES: Stage[] = [
  { key: 'applied', label: 'Applied', hint: 'Application submitted' },
  { key: 'sanctioned', label: 'Sanctioned', hint: 'Reviewed & approved' },
  { key: 'disbursed', label: 'Disbursed', hint: 'Funds released' },
  { key: 'closed', label: 'Closed', hint: 'Fully repaid' },
];

const REACHED: Record<LoanStatus, number> = {
  [LoanStatus.APPLIED]: 0,
  [LoanStatus.REJECTED]: 0,
  [LoanStatus.SANCTIONED]: 1,
  [LoanStatus.DISBURSED]: 2,
  [LoanStatus.CLOSED]: 3,
};

export function ApplicationTimeline({ status }: { status: LoanStatus }) {
  const reached = REACHED[status];
  const rejected = status === LoanStatus.REJECTED;

  return (
    <ol className="flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
      {STAGES.map((stage, idx) => {
        const isDone = idx <= reached && !(rejected && idx > 0);
        const isCurrent = !rejected && idx === reached + 1 && status !== LoanStatus.CLOSED;
        const showRejected = rejected && idx === 1;

        return (
          <li key={stage.key} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
            <div className="flex items-center md:w-full md:flex-col">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                  showRejected && 'border-destructive bg-destructive text-destructive-foreground',
                  !showRejected && isDone && 'border-primary bg-primary text-primary-foreground',
                  !showRejected && isCurrent && 'border-primary text-primary',
                  !showRejected && !isDone && !isCurrent && 'border-input text-muted-foreground',
                )}
              >
                {showRejected ? (
                  <Ban className="h-4 w-4" />
                ) : isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={cn(
                    'mx-2 hidden h-0.5 flex-1 md:block',
                    idx < reached ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className="md:mt-2">
              <p
                className={cn(
                  'text-sm font-medium',
                  showRejected ? 'text-destructive' : isDone || isCurrent ? '' : 'text-muted-foreground',
                )}
              >
                {showRejected ? 'Rejected' : stage.label}
              </p>
              <p className="text-xs text-muted-foreground">{showRejected ? 'Not approved' : stage.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
