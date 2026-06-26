'use client';

import { ApplicationTimeline } from '@/components/borrower/application-timeline';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan, LoanStatus, Payment } from '@/lib/types';
import { formatDate, formatINR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoanCard({ loan }: { loan: Loan }) {
  const [showPayments, setShowPayments] = useState(false);
  const outstanding = Math.max(0, Math.round((loan.totalRepayment - loan.amountPaid) * 100) / 100);
  const progress = loan.totalRepayment > 0 ? (loan.amountPaid / loan.totalRepayment) * 100 : 0;

  const paymentsQuery = useQuery({
    queryKey: ['loan-payments', loan.id],
    queryFn: async () => {
      const { data } = await api.get<{ payments: Payment[] }>(`/loans/${loan.id}/payments`);
      return data.payments;
    },
    enabled: showPayments,
  });

  async function viewSlip() {
    try {
      const { data } = await api.get<{ url: string }>('/uploads/view', {
        params: { key: loan.salarySlip.key },
      });
      window.open(data.url, '_blank', 'noopener');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not open salary slip'));
    }
  }

  const showProgress = loan.status === LoanStatus.DISBURSED || loan.status === LoanStatus.CLOSED;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{loan.applicationNo}</p>
          <p className="text-2xl font-bold">{formatINR(loan.amount)}</p>
          <p className="text-sm text-muted-foreground">
            {loan.tenureDays} days @ {loan.interestRate}% p.a. • Applied {formatDate(loan.appliedAt)}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-secondary/30 p-4">
          <ApplicationTimeline status={loan.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Interest" value={formatINR(loan.simpleInterest)} />
          <Stat label="Total repayment" value={formatINR(loan.totalRepayment)} />
          <Stat label="Paid" value={formatINR(loan.amountPaid)} />
          <Stat label="Outstanding" value={formatINR(outstanding)} />
        </div>

        {showProgress && (
          <div className="space-y-1">
            <Progress value={Math.min(100, progress)} />
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% repaid
              {loan.status === LoanStatus.CLOSED ? ' • Loan closed' : ''}
            </p>
          </div>
        )}

        {loan.status === LoanStatus.REJECTED && loan.rejectionReason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <span className="font-medium">Rejected:</span> {loan.rejectionReason}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={viewSlip}>
            <FileText className="h-4 w-4" /> View salary slip <ExternalLink className="h-3 w-3" />
          </Button>
          {showProgress && (
            <Button variant="ghost" size="sm" onClick={() => setShowPayments((s) => !s)}>
              {showPayments ? 'Hide payments' : 'View payments'}
            </Button>
          )}
        </div>

        {showPayments && (
          <div className="rounded-md border">
            {paymentsQuery.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading payments...</p>
            ) : paymentsQuery.data && paymentsQuery.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UTR</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsQuery.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.utrNumber}</TableCell>
                      <TableCell>{formatINR(p.amount)}</TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
