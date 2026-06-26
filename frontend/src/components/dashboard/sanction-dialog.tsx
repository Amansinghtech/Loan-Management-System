'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function SanctionDialog({
  loan,
  open,
  onOpenChange,
}: {
  loan: Loan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: async (decision: 'APPROVE' | 'REJECT') => {
      const { data } = await api.patch<{ loan: Loan }>(`/loans/${loan.id}/sanction`, {
        decision,
        reason: decision === 'REJECT' ? reason : undefined,
      });
      return data.loan;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['ops-loans'] });
      toast.success(`Loan ${updated.status.toLowerCase()}`);
      onOpenChange(false);
      setReason('');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Action failed')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review application</DialogTitle>
          <DialogDescription>
            {formatINR(loan.amount)} over {loan.tenureDays} days. Approve to sanction, or reject
            with a reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reason">Rejection reason (required to reject)</Label>
          <Textarea
            id="reason"
            placeholder="e.g. Insufficient supporting documents"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={mutation.isPending || reason.trim().length === 0}
            onClick={() => mutation.mutate('REJECT')}
          >
            Reject
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate('APPROVE')}>
            Approve & sanction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
