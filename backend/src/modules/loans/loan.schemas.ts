import { z } from 'zod';
import { LOAN_RULES } from '../../types';

export const applyLoanSchema = z.object({
  amount: z.coerce
    .number()
    .min(LOAN_RULES.MIN_AMOUNT, `Minimum amount is ${LOAN_RULES.MIN_AMOUNT}`)
    .max(LOAN_RULES.MAX_AMOUNT, `Maximum amount is ${LOAN_RULES.MAX_AMOUNT}`),
  tenureDays: z.coerce
    .number()
    .int('Tenure must be a whole number of days')
    .min(LOAN_RULES.MIN_TENURE_DAYS, `Minimum tenure is ${LOAN_RULES.MIN_TENURE_DAYS} days`)
    .max(LOAN_RULES.MAX_TENURE_DAYS, `Maximum tenure is ${LOAN_RULES.MAX_TENURE_DAYS} days`),
  salarySlip: z.object({
    key: z.string().min(1),
    bucket: z.string().min(1),
    mimeType: z.string().min(1),
    originalName: z.string().min(1),
  }),
});

export const sanctionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.decision === 'APPROVE' || (data.reason && data.reason.length > 0), {
    message: 'A reason is required when rejecting a loan',
    path: ['reason'],
  });

export const paymentSchema = z.object({
  utrNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, 'UTR number looks too short')
    .max(40, 'UTR number looks too long'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  date: z.coerce.date().optional(),
});

export const loanListQuerySchema = z.object({
  status: z.string().optional(),
});

export type ApplyLoanInput = z.infer<typeof applyLoanSchema>;
export type SanctionInput = z.infer<typeof sanctionSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
