'use client';

import { ModuleHeader } from '@/components/dashboard/module-header';
import { SanctionDialog } from '@/components/dashboard/sanction-dialog';
import { ViewSlipButton } from '@/components/dashboard/view-slip-button';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { Button } from '@/components/ui/button';
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
import { Loan } from '@/lib/types';
import { formatDate, formatINR } from '@/lib/utils';
import { useState } from 'react';

export default function SanctionPage() {
  const { data, isLoading, isError, error } = useOpsLoans('APPLIED');
  const [selected, setSelected] = useState<Loan | null>(null);

  return (
    <div>
      <ModuleHeader
        title="Sanction"
        description="Review applied loans and approve or reject them."
        count={data?.length}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState title="No applications to review" description="New applications appear here." />
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App No</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Total repayment</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((loan) => {
                const b = borrowerOf(loan);
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-xs">{loan.applicationNo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{b?.fullName ?? b?.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{b?.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{b?.pan ?? '—'}</TableCell>
                    <TableCell>{formatINR(loan.amount)}</TableCell>
                    <TableCell>{loan.tenureDays}d</TableCell>
                    <TableCell>{formatINR(loan.totalRepayment)}</TableCell>
                    <TableCell>{formatDate(loan.appliedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ViewSlipButton slipKey={loan.salarySlip.key} />
                        <Button size="sm" onClick={() => setSelected(loan)}>
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selected && (
        <SanctionDialog
          loan={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </div>
  );
}
