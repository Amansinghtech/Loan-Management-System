'use client';

import { ModuleHeader } from '@/components/dashboard/module-header';
import { PaymentsHistory } from '@/components/dashboard/payments-history';

export default function PaymentsPage() {
  return (
    <div>
      <ModuleHeader
        title="Payments"
        description="Organization-wide repayment ledger across every loan."
      />
      <PaymentsHistory heading="All payments" />
    </div>
  );
}
