import { BRE_RULES, EmploymentMode } from '../types';

export interface BreInput {
  pan: string;
  dob: string | Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface BreFailure {
  rule: 'AGE' | 'SALARY' | 'PAN' | 'EMPLOYMENT';
  message: string;
}

export interface BreResult {
  passed: boolean;
  failures: BreFailure[];
}

/** Whole-year age as of `asOf`, accounting for month/day. */
export function calculateAge(dob: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - dob.getFullYear();
  const monthDiff = asOf.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Authoritative Business Rule Engine. Runs on the server so the decision cannot
 * be bypassed by a tampered client. Returns every failing rule so the borrower
 * sees all problems at once rather than fixing them one at a time.
 */
export function evaluateBre(input: BreInput): BreResult {
  const failures: BreFailure[] = [];

  const dob = input.dob instanceof Date ? input.dob : new Date(input.dob);
  if (Number.isNaN(dob.getTime())) {
    failures.push({ rule: 'AGE', message: 'Date of birth is invalid.' });
  } else {
    const age = calculateAge(dob);
    if (age < BRE_RULES.MIN_AGE || age > BRE_RULES.MAX_AGE) {
      failures.push({
        rule: 'AGE',
        message: `Age must be between ${BRE_RULES.MIN_AGE} and ${BRE_RULES.MAX_AGE}. Current age: ${age}.`,
      });
    }
  }

  if (!Number.isFinite(input.monthlySalary) || input.monthlySalary < BRE_RULES.MIN_SALARY) {
    failures.push({
      rule: 'SALARY',
      message: `Monthly salary must be at least Rs. ${BRE_RULES.MIN_SALARY.toLocaleString('en-IN')}.`,
    });
  }

  if (!BRE_RULES.PAN_REGEX.test(input.pan)) {
    failures.push({
      rule: 'PAN',
      message: 'PAN must match the format ABCDE1234F (5 letters, 4 digits, 1 letter).',
    });
  }

  if (input.employmentMode === EmploymentMode.UNEMPLOYED) {
    failures.push({
      rule: 'EMPLOYMENT',
      message: 'Unemployed applicants are not eligible for a loan.',
    });
  }

  return { passed: failures.length === 0, failures };
}
