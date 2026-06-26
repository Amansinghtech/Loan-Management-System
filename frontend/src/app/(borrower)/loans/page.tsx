'use client';

import { LoanCard } from '@/components/borrower/loan-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function MyLoansPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-loans'],
    queryFn: async () => {
      const { data } = await api.get<{ loans: Loan[] }>('/loans/mine');
      return data.loans;
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My loans</h1>
          <p className="text-sm text-muted-foreground">Track every application and its status.</p>
        </div>
        <Button asChild>
          <Link href="/apply">New application</Link>
        </Button>
      </div>

      {isLoading && <LoadingState label="Loading your loans..." />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          title="No loans yet"
          description="Start a new application to request your first loan."
        />
      )}
      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
