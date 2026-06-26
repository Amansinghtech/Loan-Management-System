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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getApiErrorMessage } from '@/lib/api';
import { Loan } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export function PaymentDialog({
  loan,
  open,
  onOpenChange,
}: {
  loan: Loan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const outstanding = Math.max(0, Math.round((loan.totalRepayment - loan.amountPaid) * 100) / 100);

  const schema = z.object({
    utrNumber: z.string().trim().min(6, 'UTR number looks too short'),
    amount: z.coerce
      .number()
      .positive('Amount must be greater than zero')
      .max(outstanding, `Amount cannot exceed the outstanding balance of ${outstanding}`),
    date: z.string().optional(),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data } = await api.post<{ loan: Loan }>(`/loans/${loan.id}/payments`, {
        utrNumber: values.utrNumber,
        amount: values.amount,
        date: values.date || undefined,
      });
      return data.loan;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['ops-loans'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success(
        updated.status === 'CLOSED'
          ? 'Payment recorded — loan fully repaid and closed'
          : 'Payment recorded',
      );
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not record payment')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Outstanding balance: <span className="font-medium">{formatINR(outstanding)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="utrNumber">UTR number</Label>
            <Input id="utrNumber" placeholder="Unique across all payments" {...register('utrNumber')} />
            {errors.utrNumber && (
              <p className="text-xs text-destructive">{errors.utrNumber.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (Rs.)</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Recording...' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
