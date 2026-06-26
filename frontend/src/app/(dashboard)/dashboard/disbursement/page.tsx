'use client';

import { ModuleHeader } from '@/components/dashboard/module-header';
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
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan } from '@/lib/types';
import { formatDate, formatINR } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DisbursementPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useOpsLoans('SANCTIONED');

  const mutation = useMutation({
    mutationFn: async (loanId: string) => {
      const { data } = await api.patch<{ loan: Loan }>(`/loans/${loanId}/disburse`);
      return data.loan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ops-loans'] });
      toast.success('Funds disbursed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not disburse loan')),
  });

  return (
    <div>
      <ModuleHeader
        title="Disbursement"
        description="Release funds for sanctioned loans."
        count={data?.length}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState title="No sanctioned loans" description="Sanctioned loans appear here for disbursement." />
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App No</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Total repayment</TableHead>
                <TableHead>Sanctioned</TableHead>
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
                    <TableCell>{formatINR(loan.amount)}</TableCell>
                    <TableCell>{loan.tenureDays}d</TableCell>
                    <TableCell>{formatINR(loan.totalRepayment)}</TableCell>
                    <TableCell>{loan.sanctionedAt ? formatDate(loan.sanctionedAt) : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ViewSlipButton slipKey={loan.salarySlip.key} />
                        <Button
                          size="sm"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate(loan.id)}
                        >
                          Mark disbursed
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
    </div>
  );
}
