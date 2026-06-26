import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { Loan, LoanDocument } from '../models/Loan';
import { Payment } from '../models/Payment';
import { User, UserDocument, hashPassword } from '../models/User';
import { EmploymentMode, LoanStatus, Role } from '../types';
import { generateApplicationNo } from '../utils/applicationNo';
import { computeLoan, round2 } from '../utils/loanMath';

const PLACEHOLDER_SLIP = {
  key: 'salary-slips/seed-placeholder.pdf',
  bucket: env.r2.bucket || 'lms-salary-slips',
  mimeType: 'application/pdf',
  originalName: 'salary-slip.pdf',
};

const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number): Date => new Date(Date.now() - n * day);

let utrCounter = 1;
const nextUtr = (): string => `UTR${String(utrCounter++).padStart(7, '0')}`;

/** Staff/executive accounts (one per role) — stable logins for the README. */
const STAFF: { role: Role; name: string; email: string }[] = [
  { role: Role.ADMIN, name: 'Aisha Admin', email: 'admin@lms.test' },
  { role: Role.SALES, name: 'Sam Sales', email: 'sales@lms.test' },
  { role: Role.SANCTION, name: 'Sana Sanction', email: 'sanction@lms.test' },
  { role: Role.DISBURSEMENT, name: 'Dev Disbursement', email: 'disbursement@lms.test' },
  { role: Role.COLLECTION, name: 'Cole Collection', email: 'collection@lms.test' },
];

interface BorrowerSeed {
  name: string;
  email: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

/** Borrowers with completed profiles (eligible to hold loans). */
const BORROWERS: BorrowerSeed[] = [
  { name: 'Bela Borrower', email: 'borrower@lms.test', pan: 'ABCDE1234F', dob: '1995-05-15', monthlySalary: 60000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Meera Nair', email: 'meera.nair@example.com', pan: 'AKNPN2345L', dob: '1990-02-11', monthlySalary: 95000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Arjun Reddy', email: 'arjun.reddy@example.com', pan: 'BRJPR3456M', dob: '1988-09-03', monthlySalary: 120000, employmentMode: EmploymentMode.SELF_EMPLOYED },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', pan: 'CSHPP4567N', dob: '1996-12-22', monthlySalary: 48000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com', pan: 'DVKPS5678Q', dob: '1985-06-30', monthlySalary: 150000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', pan: 'ESNPI6789R', dob: '1993-03-18', monthlySalary: 72000, employmentMode: EmploymentMode.SELF_EMPLOYED },
  { name: 'Rahul Verma', email: 'rahul.verma@example.com', pan: 'FRLPV7890S', dob: '1991-11-09', monthlySalary: 54000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Ananya Gupta', email: 'ananya.gupta@example.com', pan: 'GANPG8901T', dob: '1994-07-25', monthlySalary: 88000, employmentMode: EmploymentMode.SALARIED },
  { name: 'Karan Mehta', email: 'karan.mehta@example.com', pan: 'HKMPM9012U', dob: '1987-01-14', monthlySalary: 110000, employmentMode: EmploymentMode.SELF_EMPLOYED },
  { name: 'Divya Patel', email: 'divya.patel@example.com', pan: 'IDVPP0123V', dob: '1998-04-05', monthlySalary: 40000, employmentMode: EmploymentMode.SALARIED },
];

/** Registered borrowers who have NOT completed their profile — Sales leads. */
const LEADS: { name: string; email: string }[] = [
  { name: 'Rohan Joshi', email: 'rohan.joshi@example.com' },
  { name: 'Neha Kulkarni', email: 'neha.kulkarni@example.com' },
];

type Staff = { sanctioner: UserDocument; disburser: UserDocument; collector: UserDocument };

interface LoanSeed {
  borrowerEmail: string;
  amount: number;
  tenureDays: number;
  status: LoanStatus;
  appliedDaysAgo: number;
  rejectionReason?: string;
  /** Builds the repayment schedule from the computed total repayment. */
  paymentPlan?: (total: number) => { amount: number; daysAgo: number }[];
}

const LOANS: LoanSeed[] = [
  // APPLIED — waiting for the Sanction desk
  { borrowerEmail: 'meera.nair@example.com', amount: 150000, tenureDays: 90, status: LoanStatus.APPLIED, appliedDaysAgo: 2 },
  { borrowerEmail: 'arjun.reddy@example.com', amount: 250000, tenureDays: 120, status: LoanStatus.APPLIED, appliedDaysAgo: 5 },
  { borrowerEmail: 'priya.sharma@example.com', amount: 80000, tenureDays: 60, status: LoanStatus.APPLIED, appliedDaysAgo: 1 },
  // SANCTIONED — waiting for Disbursement
  { borrowerEmail: 'vikram.singh@example.com', amount: 300000, tenureDays: 180, status: LoanStatus.SANCTIONED, appliedDaysAgo: 12 },
  { borrowerEmail: 'sneha.iyer@example.com', amount: 120000, tenureDays: 90, status: LoanStatus.SANCTIONED, appliedDaysAgo: 8 },
  // REJECTED
  {
    borrowerEmail: 'rahul.verma@example.com',
    amount: 500000,
    tenureDays: 365,
    status: LoanStatus.REJECTED,
    appliedDaysAgo: 16,
    rejectionReason: 'Requested amount exceeds eligibility for the declared monthly income.',
  },
  // DISBURSED — live loans with partial repayment (Collection desk)
  {
    borrowerEmail: 'borrower@lms.test',
    amount: 100000,
    tenureDays: 60,
    status: LoanStatus.DISBURSED,
    appliedDaysAgo: 45,
    paymentPlan: (t) => [{ amount: round2(t / 2), daysAgo: 18 }],
  },
  {
    borrowerEmail: 'ananya.gupta@example.com',
    amount: 200000,
    tenureDays: 120,
    status: LoanStatus.DISBURSED,
    appliedDaysAgo: 62,
    paymentPlan: (t) => [
      { amount: round2(t * 0.25), daysAgo: 30 },
      { amount: round2(t * 0.2), daysAgo: 8 },
    ],
  },
  {
    borrowerEmail: 'karan.mehta@example.com',
    amount: 350000,
    tenureDays: 180,
    status: LoanStatus.DISBURSED,
    appliedDaysAgo: 50,
    paymentPlan: (t) => [{ amount: round2(t * 0.3), daysAgo: 14 }],
  },
  {
    borrowerEmail: 'divya.patel@example.com',
    amount: 90000,
    tenureDays: 90,
    status: LoanStatus.DISBURSED,
    appliedDaysAgo: 33,
    paymentPlan: (t) => [{ amount: round2(t * 0.6), daysAgo: 9 }],
  },
  // CLOSED — fully repaid
  {
    borrowerEmail: 'borrower@lms.test',
    amount: 75000,
    tenureDays: 60,
    status: LoanStatus.CLOSED,
    appliedDaysAgo: 210,
    paymentPlan: (t) => {
      const first = round2(t * 0.6);
      return [
        { amount: first, daysAgo: 160 },
        { amount: round2(t - first), daysAgo: 140 },
      ];
    },
  },
  {
    borrowerEmail: 'meera.nair@example.com',
    amount: 180000,
    tenureDays: 120,
    status: LoanStatus.CLOSED,
    appliedDaysAgo: 190,
    paymentPlan: (t) => {
      const a = round2(t * 0.4);
      const b = round2(t * 0.4);
      return [
        { amount: a, daysAgo: 150 },
        { amount: b, daysAgo: 120 },
        { amount: round2(t - a - b), daysAgo: 95 },
      ];
    },
  },
  {
    borrowerEmail: 'priya.sharma@example.com',
    amount: 60000,
    tenureDays: 30,
    status: LoanStatus.CLOSED,
    appliedDaysAgo: 150,
    paymentPlan: (t) => [{ amount: t, daysAgo: 128 }],
  },
];

async function createLoan(seed: LoanSeed, borrower: UserDocument, staff: Staff): Promise<void> {
  const calc = computeLoan(seed.amount, seed.tenureDays);
  const isDecided = seed.status !== LoanStatus.APPLIED;
  const isFunded = seed.status === LoanStatus.DISBURSED || seed.status === LoanStatus.CLOSED;

  const payments = seed.paymentPlan ? seed.paymentPlan(calc.totalRepayment) : [];
  const amountPaid = round2(payments.reduce((sum, p) => sum + p.amount, 0));
  const lastPaymentDaysAgo = payments.length
    ? Math.min(...payments.map((p) => p.daysAgo))
    : undefined;

  const loan: LoanDocument = await Loan.create({
    applicationNo: generateApplicationNo(),
    borrower: borrower.id,
    amount: calc.principal,
    tenureDays: calc.tenureDays,
    interestRate: calc.interestRate,
    simpleInterest: calc.simpleInterest,
    totalRepayment: calc.totalRepayment,
    amountPaid,
    status: seed.status,
    salarySlip: PLACEHOLDER_SLIP,
    appliedAt: daysAgo(seed.appliedDaysAgo),
    ...(isDecided && seed.status !== LoanStatus.REJECTED
      ? { sanctionedBy: staff.sanctioner.id, sanctionedAt: daysAgo(seed.appliedDaysAgo - 2) }
      : {}),
    ...(seed.status === LoanStatus.REJECTED
      ? { rejectedAt: daysAgo(seed.appliedDaysAgo - 2), rejectionReason: seed.rejectionReason }
      : {}),
    ...(isFunded
      ? { disbursedBy: staff.disburser.id, disbursedAt: daysAgo(seed.appliedDaysAgo - 4) }
      : {}),
    ...(seed.status === LoanStatus.CLOSED && lastPaymentDaysAgo !== undefined
      ? { closedAt: daysAgo(lastPaymentDaysAgo) }
      : {}),
  });

  for (const p of payments) {
    await Payment.create({
      loan: loan.id,
      borrower: borrower.id,
      utrNumber: nextUtr(),
      amount: p.amount,
      date: daysAgo(p.daysAgo),
      recordedBy: staff.collector.id,
    });
  }
}

async function run(): Promise<void> {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('[seed] Clearing existing data...');
  await Promise.all([User.deleteMany({}), Loan.deleteMany({}), Payment.deleteMany({})]);

  const passwordHash = await hashPassword(env.seedPassword);

  await User.insertMany(
    STAFF.map((s) => ({ name: s.name, email: s.email, passwordHash, role: s.role, profileComplete: false })),
  );

  await User.insertMany(
    BORROWERS.map((b) => ({
      name: b.name,
      email: b.email,
      passwordHash,
      role: Role.BORROWER,
      profileComplete: true,
      fullName: b.name,
      pan: b.pan,
      dob: new Date(b.dob),
      monthlySalary: b.monthlySalary,
      employmentMode: b.employmentMode,
    })),
  );

  await User.insertMany(
    LEADS.map((l) => ({
      name: l.name,
      email: l.email,
      passwordHash,
      role: Role.BORROWER,
      profileComplete: false,
    })),
  );

  const staff: Staff = {
    sanctioner: (await User.findOne({ role: Role.SANCTION }))!,
    disburser: (await User.findOne({ role: Role.DISBURSEMENT }))!,
    collector: (await User.findOne({ role: Role.COLLECTION }))!,
  };

  const borrowerByEmail = new Map<string, UserDocument>();
  for (const b of BORROWERS) {
    borrowerByEmail.set(b.email, (await User.findOne({ email: b.email }))!);
  }

  for (const seed of LOANS) {
    const borrower = borrowerByEmail.get(seed.borrowerEmail);
    if (!borrower) throw new Error(`Seed loan references unknown borrower: ${seed.borrowerEmail}`);
    await createLoan(seed, borrower, staff);
  }

  const [loanCount, paymentCount] = await Promise.all([
    Loan.countDocuments(),
    Payment.countDocuments(),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    '\n[seed] Done. Created %d staff, %d borrowers (+%d leads), %d loans, %d payments.',
    STAFF.length,
    BORROWERS.length,
    LEADS.length,
    loanCount,
    paymentCount,
  );
  // eslint-disable-next-line no-console
  console.log('[seed] Password for all accounts: %s\n', env.seedPassword);
  // eslint-disable-next-line no-console
  console.table(STAFF.map((s) => ({ role: s.role, email: s.email })));

  await disconnectDB();
}

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  await disconnectDB();
  process.exit(1);
});
