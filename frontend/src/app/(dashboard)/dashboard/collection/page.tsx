'use client';

import { ModuleHeader } from '@/components/dashboard/module-header';
import { PaymentDialog } from '@/components/dashboard/payment-dialog';
import { PaymentsHistory } from '@/components/dashboard/payments-history';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { borrowerOf, useOpsLoans } from '@/hooks/useOpsLoans';
import { getApiErrorMessage } from '@/lib/api';
import { Loan, LoanStatus } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useState } from 'react';

export default function CollectionPage() {
  const { data, isLoading, isError, error } = useOpsLoans('DISBURSED,CLOSED');
  const [selected, setSelected] = useState<Loan | null>(null);

  return (
    <div>
      <ModuleHeader
        title="Collection"
        description="Record repayments on active loans. Loans auto-close when fully repaid."
        count={data?.length}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState title="No active loans" description="Disbursed loans appear here for collection." />
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead className="w-40">Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((loan) => {
                const b = borrowerOf(loan);
                const outstanding = Math.max(
                  0,
                  Math.round((loan.totalRepayment - loan.amountPaid) * 100) / 100,
                );
                const progress =
                  loan.totalRepayment > 0 ? (loan.amountPaid / loan.totalRepayment) * 100 : 0;
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="font-medium">{b?.fullName ?? b?.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{b?.email}</div>
                    </TableCell>
                    <TableCell>{formatINR(loan.totalRepayment)}</TableCell>
                    <TableCell>{formatINR(loan.amountPaid)}</TableCell>
                    <TableCell className="font-medium">{formatINR(outstanding)}</TableCell>
                    <TableCell>
                      <Progress value={Math.min(100, progress)} />
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={loan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={loan.status !== LoanStatus.DISBURSED}
                        onClick={() => setSelected(loan)}
                      >
                        Record payment
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-10">
        <PaymentsHistory heading="Recent payments" />
      </div>

      {selected && (
        <PaymentDialog
          loan={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </div>
  );
}
