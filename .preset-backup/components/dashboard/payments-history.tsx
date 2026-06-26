'use client';

import { StatusBadge } from '@/components/status-badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { refOf, useAllPayments } from '@/hooks/useOpsLoans';
import { getApiErrorMessage } from '@/lib/api';
import { Loan, User } from '@/lib/types';
import { formatDate, formatINR } from '@/lib/utils';

/**
 * Read-only repayment ledger across all loans. Shared by the Collection module
 * (below the active-loans table) and the Admin Payments page.
 */
export function PaymentsHistory({ heading = 'Payment ledger' }: { heading?: string }) {
  const { data, isLoading, isError, error } = useAllPayments();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-sm text-muted-foreground">
            Every repayment recorded against disbursed loans.
          </p>
        </div>
        {typeof data?.length === 'number' && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            {data.length} {data.length === 1 ? 'payment' : 'payments'}
          </span>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState
          title="No payments yet"
          description="Repayments recorded by the Collection team will appear here."
        />
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>UTR</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Loan status</TableHead>
                <TableHead>Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => {
                const loan = refOf<Pick<Loan, 'id' | 'applicationNo' | 'status'>>(p.loan);
                const borrower = refOf<Pick<User, 'name' | 'fullName' | 'email'>>(p.borrower);
                const recorder = refOf<Pick<User, 'name'>>(p.recordedBy);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(p.date)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {loan?.applicationNo ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {borrower?.fullName ?? borrower?.name ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">{borrower?.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.utrNumber}</TableCell>
                    <TableCell className="text-right font-medium">{formatINR(p.amount)}</TableCell>
                    <TableCell>{loan ? <StatusBadge status={loan.status} /> : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{recorder?.name ?? '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
