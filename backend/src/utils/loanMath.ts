import { LOAN_RULES } from '../types';

export interface LoanComputation {
  principal: number;
  interestRate: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
}

/** Rounds to 2 decimal places, avoiding binary floating point drift. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Simple Interest loan computation.
 *   SI    = (P * R * T) / (365 * 100)
 *   Total = P + SI
 * where R is the annual rate (%) and T is the tenure in days.
 */
export function computeLoan(
  principal: number,
  tenureDays: number,
  interestRate: number = LOAN_RULES.INTEREST_RATE,
): LoanComputation {
  const simpleInterest = round2((principal * interestRate * tenureDays) / (365 * 100));
  const totalRepayment = round2(principal + simpleInterest);
  return { principal, interestRate, tenureDays, simpleInterest, totalRepayment };
}
