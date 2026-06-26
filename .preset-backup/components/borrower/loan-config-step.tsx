'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { api, getApiErrorMessage } from '@/lib/api';
import { computeLoan } from '@/lib/loanMath';
import { Loan, LOAN_RULES, SalarySlip } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoanConfigStep({
  salarySlip,
  onBack,
  onApplied,
}: {
  salarySlip: SalarySlip;
  onBack: () => void;
  onApplied: (loan: Loan) => void;
}) {
  const [amount, setAmount] = useState(100_000);
  const [tenure, setTenure] = useState(90);
  const [submitting, setSubmitting] = useState(false);

  const calc = computeLoan(amount, tenure);

  async function apply() {
    setSubmitting(true);
    try {
      const { data } = await api.post<{ loan: Loan }>('/loans', {
        amount,
        tenureDays: tenure,
        salarySlip,
      });
      toast.success('Loan application submitted');
      onApplied(data.loan);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit application'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="space-y-8 md:col-span-3">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium">Loan amount</label>
            <span className="text-lg font-semibold">{formatINR(amount)}</span>
          </div>
          <Slider
            className="mt-3"
            min={LOAN_RULES.MIN_AMOUNT}
            max={LOAN_RULES.MAX_AMOUNT}
            step={5_000}
            value={[amount]}
            onValueChange={([v]) => setAmount(v)}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatINR(LOAN_RULES.MIN_AMOUNT)}</span>
            <span>{formatINR(LOAN_RULES.MAX_AMOUNT)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium">Tenure</label>
            <span className="text-lg font-semibold">{tenure} days</span>
          </div>
          <Slider
            className="mt-3"
            min={LOAN_RULES.MIN_TENURE_DAYS}
            max={LOAN_RULES.MAX_TENURE_DAYS}
            step={1}
            value={[tenure]}
            onValueChange={([v]) => setTenure(v)}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{LOAN_RULES.MIN_TENURE_DAYS} days</span>
            <span>{LOAN_RULES.MAX_TENURE_DAYS} days</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-secondary/40 p-5 md:col-span-2">
        <p className="text-sm font-medium text-muted-foreground">Repayment summary</p>
        <Row label="Principal" value={formatINR(calc.principal)} />
        <Row label="Interest rate" value={`${calc.interestRate}% p.a.`} />
        <Row label="Tenure" value={`${calc.tenureDays} days`} />
        <Row label="Simple interest" value={formatINR(calc.simpleInterest)} />
        <div className="border-t pt-3">
          <Row label="Total repayment" value={formatINR(calc.totalRepayment)} emphasize />
        </div>
        <p className="text-xs text-muted-foreground">
          SI = (P × R × T) / (365 × 100). Final figures are confirmed by the server.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={apply} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Apply now'}
          </Button>
          <Button variant="ghost" onClick={onBack} disabled={submitting}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={emphasize ? 'font-medium' : 'text-sm text-muted-foreground'}>{label}</span>
      <span className={emphasize ? 'text-xl font-bold text-primary' : 'text-sm font-medium'}>
        {value}
      </span>
    </div>
  );
}
