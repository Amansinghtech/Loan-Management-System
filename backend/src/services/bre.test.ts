import { describe, expect, it } from 'vitest';
import { EmploymentMode } from '../types';
import { calculateAge, evaluateBre } from './bre';

function dobForAge(age: number): Date {
  const now = new Date();
  return new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
}

const validInput = {
  pan: 'ABCDE1234F',
  dob: dobForAge(30),
  monthlySalary: 50000,
  employmentMode: EmploymentMode.SALARIED,
};

describe('calculateAge', () => {
  it('computes whole-year age accounting for month/day', () => {
    const dob = new Date('2000-06-15');
    expect(calculateAge(dob, new Date('2026-06-15'))).toBe(26);
    expect(calculateAge(dob, new Date('2026-06-14'))).toBe(25);
  });
});

describe('evaluateBre', () => {
  it('passes a fully valid applicant', () => {
    const result = evaluateBre(validInput);
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('accepts boundary ages 23 and 50', () => {
    expect(evaluateBre({ ...validInput, dob: dobForAge(23) }).passed).toBe(true);
    expect(evaluateBre({ ...validInput, dob: dobForAge(50) }).passed).toBe(true);
  });

  it('rejects ages just outside the 23–50 range', () => {
    expect(evaluateBre({ ...validInput, dob: dobForAge(22) }).passed).toBe(false);
    expect(evaluateBre({ ...validInput, dob: dobForAge(51) }).passed).toBe(false);
  });

  it('rejects salary below 25,000 but accepts exactly 25,000', () => {
    expect(evaluateBre({ ...validInput, monthlySalary: 24999 }).passed).toBe(false);
    expect(evaluateBre({ ...validInput, monthlySalary: 25000 }).passed).toBe(true);
  });

  it('rejects invalid PAN formats', () => {
    expect(evaluateBre({ ...validInput, pan: 'ABCDE1234' }).passed).toBe(false); // too short
    expect(evaluateBre({ ...validInput, pan: 'abcde1234f' }).passed).toBe(false); // lowercase
    expect(evaluateBre({ ...validInput, pan: '12345ABCDF' }).passed).toBe(false); // wrong shape
    expect(evaluateBre({ ...validInput, pan: 'ABCDE12345' }).passed).toBe(false); // ends with digit
  });

  it('rejects unemployed applicants', () => {
    const result = evaluateBre({ ...validInput, employmentMode: EmploymentMode.UNEMPLOYED });
    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.rule === 'EMPLOYMENT')).toBe(true);
  });

  it('reports every failing rule at once', () => {
    const result = evaluateBre({
      pan: 'invalid',
      dob: dobForAge(18),
      monthlySalary: 1000,
      employmentMode: EmploymentMode.UNEMPLOYED,
    });
    expect(result.passed).toBe(false);
    const rules = result.failures.map((f) => f.rule).sort();
    expect(rules).toEqual(['AGE', 'EMPLOYMENT', 'PAN', 'SALARY']);
  });
});
