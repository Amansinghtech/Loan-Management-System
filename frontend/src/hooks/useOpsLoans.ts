'use client';

import { api } from '@/lib/api';
import { Lead, Loan, PaymentListItem, Stats, User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export function useOpsLoans(status: string) {
  return useQuery({
    queryKey: ['ops-loans', status],
    queryFn: async () => {
      const { data } = await api.get<{ loans: Loan[] }>('/ops/loans', { params: { status } });
      return data.loans;
    },
  });
}

export function useSalesLeads() {
  return useQuery({
    queryKey: ['sales-leads'],
    queryFn: async () => {
      const { data } = await api.get<{ leads: Lead[] }>('/ops/sales/leads');
      return data.leads;
    },
  });
}

/** Loans are populated with the borrower document in ops endpoints. */
export function borrowerOf(loan: Loan): User | null {
  if (typeof loan.borrower === 'object' && loan.borrower !== null) {
    return loan.borrower as User;
  }
  return null;
}

/** Full repayment ledger across all loans (Collection + Admin). */
export function useAllPayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.get<{ payments: PaymentListItem[] }>('/ops/payments');
      return data.payments;
    },
  });
}

/** A populated ref on a payment row resolves to its object, or null when unpopulated. */
export function refOf<T>(value: T | string | null): T | null {
  return typeof value === 'object' && value !== null ? (value as T) : null;
}

/** Admin-only portfolio KPI summary. */
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get<{ stats: Stats }>('/ops/stats');
      return data.stats;
    },
  });
}
