'use client';

import { ErrorState } from '@/components/states';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useOpsLoans';
import { getApiErrorMessage } from '@/lib/api';
import { LoanStatus } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Banknote, HandCoins, TrendingUp, Users, Wallet } from 'lucide-react';

function Kpi({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function AdminKpis() {
  const { data, isLoading, isError, error } = useStats();

  if (isError) return <ErrorState message={getApiErrorMessage(error)} />;

  const skeleton = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-8">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading || !data) return skeleton;

  const decided =
    data.byStatus.SANCTIONED + data.byStatus.REJECTED + data.byStatus.DISBURSED + data.byStatus.CLOSED;
  const approved = data.byStatus.SANCTIONED + data.byStatus.DISBURSED + data.byStatus.CLOSED;
  const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;

  const STATUS_ORDER: LoanStatus[] = [
    LoanStatus.APPLIED,
    LoanStatus.SANCTIONED,
    LoanStatus.DISBURSED,
    LoanStatus.CLOSED,
    LoanStatus.REJECTED,
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Borrowers"
          value={String(data.borrowers)}
          icon={<Users className="h-4 w-4" />}
          hint={`${data.loans} total applications`}
        />
        <Kpi
          label="Disbursed"
          value={formatINR(data.disbursedAmount)}
          icon={<HandCoins className="h-4 w-4" />}
          hint="Principal released"
        />
        <Kpi
          label="Collected"
          value={formatINR(data.collected)}
          icon={<Wallet className="h-4 w-4" />}
          hint="Repayments received"
        />
        <Kpi
          label="Outstanding"
          value={formatINR(data.outstanding)}
          icon={<Banknote className="h-4 w-4" />}
          hint="On active loans"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Portfolio by status</CardTitle>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {approvalRate}% approval rate
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className="text-xl font-semibold tabular-nums">{data.byStatus[status]}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
