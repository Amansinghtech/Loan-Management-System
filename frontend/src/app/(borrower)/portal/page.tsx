'use client';

import { ApplicationTimeline } from '@/components/borrower/application-timeline';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan, LoanStatus } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-loans'],
    queryFn: async () => {
      const { data } = await api.get<{ loans: Loan[] }>('/loans/mine');
      return data.loans;
    },
  });

  const latest = data?.[0];
  const active = data?.find(
    (l) => l.status === LoanStatus.DISBURSED || l.status === LoanStatus.SANCTIONED,
  );
  const totalBorrowed =
    data?.reduce((sum, l) => (l.status !== LoanStatus.REJECTED ? sum + l.amount : sum), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
          <p className="text-sm text-muted-foreground">Here is an overview of your loans.</p>
        </div>
        <Button asChild>
          <Link href="/apply">
            New application <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total applications" value={String(data.length)} />
            <StatCard label="Active loans" value={String(active ? 1 : 0)} />
            <StatCard label="Total borrowed" value={formatINR(totalBorrowed)} />
          </div>

          {!latest && (
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="No applications yet"
              description="Start your first loan application — it only takes a few minutes."
            />
          )}

          {latest && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Latest application
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      {latest.applicationNo}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {formatINR(latest.amount)} over {latest.tenureDays} days
                  </CardDescription>
                </div>
                <StatusBadge status={latest.status} />
              </CardHeader>
              <CardContent className="space-y-6">
                <ApplicationTimeline status={latest.status} />
                <div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/loans">
                      <FileText className="h-4 w-4" /> View all loans
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
