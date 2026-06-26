'use client';

import { Slider } from '@/components/ui/slider';
import { computeLoan } from '@/lib/loanMath';
import { LOAN_RULES } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useState } from 'react';

export function LoanCalculator() {
  const [amount, setAmount] = useState(200_000);
  const [tenure, setTenure] = useState(120);
  const calc = computeLoan(amount, tenure);

  return (
    <div className="grid gap-8 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2 md:p-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted-foreground">Loan amount</span>
            <span className="text-lg font-bold">{formatINR(amount)}</span>
          </div>
          <Slider
            className="mt-3"
            min={LOAN_RULES.MIN_AMOUNT}
            max={LOAN_RULES.MAX_AMOUNT}
            step={5_000}
            value={[amount]}
            onValueChange={([v]) => setAmount(v)}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted-foreground">Tenure</span>
            <span className="text-lg font-bold">{tenure} days</span>
          </div>
          <Slider
            className="mt-3"
            min={LOAN_RULES.MIN_TENURE_DAYS}
            max={LOAN_RULES.MAX_TENURE_DAYS}
            step={1}
            value={[tenure]}
            onValueChange={([v]) => setTenure(v)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Fixed interest rate of {LOAN_RULES.INTEREST_RATE}% p.a. (simple interest).
        </p>
      </div>

      <div className="flex flex-col justify-center gap-4 rounded-xl brand-gradient p-6 text-white">
        <div>
          <p className="text-sm/relaxed opacity-80">You repay in total</p>
          <p className="text-4xl font-bold">{formatINR(calc.totalRepayment)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-sm">
          <div>
            <p className="opacity-80">Principal</p>
            <p className="font-semibold">{formatINR(calc.principal)}</p>
          </div>
          <div>
            <p className="opacity-80">Interest</p>
            <p className="font-semibold">{formatINR(calc.simpleInterest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
