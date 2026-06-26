import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { User, hashPassword } from '../models/User';
import { EmploymentMode, LoanStatus, Role } from '../types';
import { generateApplicationNo } from '../utils/applicationNo';
import { computeLoan, round2 } from '../utils/loanMath';

interface SeedAccount {
  role: Role;
  name: string;
  email: string;
}

const ACCOUNTS: SeedAccount[] = [
  { role: Role.ADMIN, name: 'Aisha Admin', email: 'admin@lms.test' },
  { role: Role.SALES, name: 'Sam Sales', email: 'sales@lms.test' },
  { role: Role.SANCTION, name: 'Sana Sanction', email: 'sanction@lms.test' },
  { role: Role.DISBURSEMENT, name: 'Dev Disbursement', email: 'disbursement@lms.test' },
  { role: Role.COLLECTION, name: 'Cole Collection', email: 'collection@lms.test' },
  { role: Role.BORROWER, name: 'Bela Borrower', email: 'borrower@lms.test' },
];

const PLACEHOLDER_SLIP = {
  key: 'salary-slips/seed-placeholder.pdf',
  bucket: env.r2.bucket || 'lms-salary-slips',
  mimeType: 'application/pdf',
  originalName: 'salary-slip.pdf',
};

async function run(): Promise<void> {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('[seed] Clearing existing data...');
  await Promise.all([User.deleteMany({}), Loan.deleteMany({}), Payment.deleteMany({})]);

  const passwordHash = await hashPassword(env.seedPassword);

  // One account per role
  const created = await User.insertMany(
    ACCOUNTS.map((a) => ({
      name: a.name,
      email: a.email,
      passwordHash,
      role: a.role,
      profileComplete: a.role === Role.BORROWER,
      ...(a.role === Role.BORROWER
        ? {
            fullName: a.name,
            pan: 'ABCDE1234F',
            dob: new Date('1995-05-15'),
            monthlySalary: 60000,
            employmentMode: EmploymentMode.SALARIED,
          }
        : {}),
    })),
  );

  const primaryBorrower = created.find((u) => u.role === Role.BORROWER)!;

  // Extra sample borrowers so each dashboard module has data immediately.
  const sampleBorrowers = await User.insertMany([
    {
      name: 'Rohan Lead',
      email: 'lead@lms.test',
      passwordHash,
      role: Role.BORROWER,
      profileComplete: false,
    },
    {
      name: 'Meera Applicant',
      email: 'applicant@lms.test',
      passwordHash,
      role: Role.BORROWER,
      profileComplete: true,
      fullName: 'Meera Applicant',
      pan: 'PQRSX6789K',
      dob: new Date('1992-08-20'),
      monthlySalary: 85000,
      employmentMode: EmploymentMode.SELF_EMPLOYED,
    },
  ]);
  const applicant = sampleBorrowers[1];

  const sanctioner = created.find((u) => u.role === Role.SANCTION)!;
  const disburser = created.find((u) => u.role === Role.DISBURSEMENT)!;
  const collector = created.find((u) => u.role === Role.COLLECTION)!;

  // Loan in APPLIED status (for the Sanction module)
  const appliedCalc = computeLoan(150000, 90);
  await Loan.create({
    applicationNo: generateApplicationNo(),
    borrower: applicant.id,
    amount: appliedCalc.principal,
    tenureDays: appliedCalc.tenureDays,
    interestRate: appliedCalc.interestRate,
    simpleInterest: appliedCalc.simpleInterest,
    totalRepayment: appliedCalc.totalRepayment,
    status: LoanStatus.APPLIED,
    salarySlip: PLACEHOLDER_SLIP,
  });

  // Loan in SANCTIONED status (for the Disbursement module)
  const sanctionedCalc = computeLoan(200000, 120);
  await Loan.create({
    applicationNo: generateApplicationNo(),
    borrower: primaryBorrower.id,
    amount: sanctionedCalc.principal,
    tenureDays: sanctionedCalc.tenureDays,
    interestRate: sanctionedCalc.interestRate,
    simpleInterest: sanctionedCalc.simpleInterest,
    totalRepayment: sanctionedCalc.totalRepayment,
    status: LoanStatus.SANCTIONED,
    sanctionedBy: sanctioner.id,
    sanctionedAt: new Date(),
    salarySlip: PLACEHOLDER_SLIP,
  });

  // Loan in DISBURSED status with a partial payment (for the Collection module)
  const disbursedCalc = computeLoan(100000, 60);
  const firstPayment = round2(disbursedCalc.totalRepayment / 2);
  const disbursedLoan = await Loan.create({
    applicationNo: generateApplicationNo(),
    borrower: primaryBorrower.id,
    amount: disbursedCalc.principal,
    tenureDays: disbursedCalc.tenureDays,
    interestRate: disbursedCalc.interestRate,
    simpleInterest: disbursedCalc.simpleInterest,
    totalRepayment: disbursedCalc.totalRepayment,
    amountPaid: firstPayment,
    status: LoanStatus.DISBURSED,
    sanctionedBy: sanctioner.id,
    sanctionedAt: new Date(),
    disbursedBy: disburser.id,
    disbursedAt: new Date(),
    salarySlip: PLACEHOLDER_SLIP,
  });
  await Payment.create({
    loan: disbursedLoan.id,
    borrower: primaryBorrower.id,
    utrNumber: 'SEEDUTR0001',
    amount: firstPayment,
    date: new Date(),
    recordedBy: collector.id,
  });

  // eslint-disable-next-line no-console
  console.log('\n[seed] Done. Login credentials (password for all): %s\n', env.seedPassword);
  // eslint-disable-next-line no-console
  console.table(ACCOUNTS.map((a) => ({ role: a.role, email: a.email })));

  await disconnectDB();
}

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  await disconnectDB();
  process.exit(1);
});
