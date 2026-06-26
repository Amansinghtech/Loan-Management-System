import { LOAN_RULES } from './types';

export interface LoanComputation {
  principal: number;
  interestRate: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Client mirror of the server's Simple Interest calculation. The displayed
 * figures are recomputed authoritatively on the server when the loan is created.
 *   SI = (P * R * T) / (365 * 100), Total = P + SI
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
