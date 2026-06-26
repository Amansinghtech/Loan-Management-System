export enum Role {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  BORROWER = 'BORROWER',
}

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
}

export enum LoanStatus {
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export const ALL_ROLES = Object.values(Role);
export const EXECUTIVE_ROLES = [
  Role.SALES,
  Role.SANCTION,
  Role.DISBURSEMENT,
  Role.COLLECTION,
] as const;

export interface JwtPayload {
  sub: string;
  role: Role;
}

export const LOAN_RULES = {
  INTEREST_RATE: 12,
  MIN_AMOUNT: 50_000,
  MAX_AMOUNT: 500_000,
  MIN_TENURE_DAYS: 30,
  MAX_TENURE_DAYS: 365,
} as const;

export const BRE_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_SALARY: 25_000,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
} as const;
