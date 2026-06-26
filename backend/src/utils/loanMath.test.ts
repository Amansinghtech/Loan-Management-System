import { describe, expect, it } from 'vitest';
import { computeLoan, round2 } from './loanMath';

describe('round2', () => {
  it('rounds to two decimal places without floating point drift', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(100.456)).toBe(100.46);
  });
});

describe('computeLoan', () => {
  it('computes simple interest with SI = (P*R*T)/(365*100)', () => {
    // 100000 @ 12% for 365 days -> SI = 12000, total = 112000
    const calc = computeLoan(100000, 365);
    expect(calc.simpleInterest).toBe(12000);
    expect(calc.totalRepayment).toBe(112000);
  });

  it('handles partial-year tenures', () => {
    // 100000 @ 12% for 90 days -> SI = (100000*12*90)/(36500) = 2958.90
    const calc = computeLoan(100000, 90);
    expect(calc.simpleInterest).toBeCloseTo(2958.9, 1);
    expect(calc.totalRepayment).toBeCloseTo(102958.9, 1);
  });

  it('uses the fixed 12% rate by default', () => {
    expect(computeLoan(50000, 30).interestRate).toBe(12);
  });

  it('scales linearly with principal', () => {
    const a = computeLoan(50000, 180);
    const b = computeLoan(100000, 180);
    expect(b.simpleInterest).toBeCloseTo(a.simpleInterest * 2, 1);
  });
});
