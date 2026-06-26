import { Badge } from '@/components/ui/badge';
import { LoanStatus } from '@/lib/types';

const STATUS_VARIANT: Record<LoanStatus, React.ComponentProps<typeof Badge>['variant']> = {
  [LoanStatus.APPLIED]: 'info',
  [LoanStatus.SANCTIONED]: 'warning',
  [LoanStatus.REJECTED]: 'destructive',
  [LoanStatus.DISBURSED]: 'default',
  [LoanStatus.CLOSED]: 'success',
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
