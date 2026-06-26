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

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  fullName?: string;
  pan?: string;
  dob?: string;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  profileComplete: boolean;
  createdAt: string;
}

export interface SalarySlip {
  key: string;
  bucket: string;
  mimeType: string;
  originalName: string;
}

export interface Loan {
  id: string;
  applicationNo: string;
  borrower: string | User;
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  salarySlip: SalarySlip;
  rejectionReason?: string;
  appliedAt: string;
  sanctionedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  loan: string;
  utrNumber: string;
  amount: number;
  date: string;
  createdAt: string;
}

/** A payment row from the global ledger, with loan/borrower/recorder populated. */
export interface PaymentListItem {
  id: string;
  utrNumber: string;
  amount: number;
  date: string;
  createdAt: string;
  loan: Pick<Loan, 'id' | 'applicationNo' | 'status'> | string | null;
  borrower: Pick<User, 'id' | 'name' | 'fullName' | 'email'> | string | null;
  recordedBy: Pick<User, 'id' | 'name'> | string | null;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  profileComplete: boolean;
  employmentMode: EmploymentMode | null;
  monthlySalary: number | null;
  createdAt: string;
}

export interface BreFailure {
  rule: 'AGE' | 'SALARY' | 'PAN' | 'EMPLOYMENT';
  message: string;
}

export const LOAN_RULES = {
  INTEREST_RATE: 12,
  MIN_AMOUNT: 50_000,
  MAX_AMOUNT: 500_000,
  MIN_TENURE_DAYS: 30,
  MAX_TENURE_DAYS: 365,
} as const;
