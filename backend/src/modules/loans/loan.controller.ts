import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Loan } from '../../models/Loan';
import { Payment } from '../../models/Payment';
import { User } from '../../models/User';
import { LoanStatus, Role } from '../../types';
import { ApiError } from '../../utils/ApiError';
import { generateApplicationNo } from '../../utils/applicationNo';
import { computeLoan, round2 } from '../../utils/loanMath';
import { ApplyLoanInput, PaymentInput, SanctionInput } from './loan.schemas';

/** Borrower applies for a loan. Interest math is computed on the server, never trusted from the client. */
export async function applyForLoan(req: Request, res: Response): Promise<void> {
  const input = req.body as ApplyLoanInput;

  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (!user.profileComplete) {
    throw ApiError.badRequest('Complete your personal details and eligibility check first.');
  }

  const calc = computeLoan(input.amount, input.tenureDays);
  const loan = await Loan.create({
    applicationNo: generateApplicationNo(),
    borrower: user.id,
    amount: calc.principal,
    tenureDays: calc.tenureDays,
    interestRate: calc.interestRate,
    simpleInterest: calc.simpleInterest,
    totalRepayment: calc.totalRepayment,
    status: LoanStatus.APPLIED,
    salarySlip: input.salarySlip,
  });

  res.status(201).json({ loan });
}

export async function myLoans(req: Request, res: Response): Promise<void> {
  const loans = await Loan.find({ borrower: req.user!.id }).sort({ createdAt: -1 });
  res.json({ loans });
}

export async function getLoan(req: Request, res: Response): Promise<void> {
  const loan = await Loan.findById(req.params.id).populate('borrower', 'name email fullName pan');
  if (!loan) {
    throw ApiError.notFound('Loan not found');
  }
  const borrowerId =
    typeof loan.borrower === 'object' && loan.borrower !== null && '_id' in loan.borrower
      ? String((loan.borrower as { _id: unknown })._id)
      : String(loan.borrower);
  if (req.user!.role === Role.BORROWER && borrowerId !== req.user!.id) {
    throw ApiError.forbidden();
  }
  res.json({ loan });
}

/** Sanction executive approves -> SANCTIONED, or rejects (with reason) -> REJECTED. Only from APPLIED. */
export async function sanctionLoan(req: Request, res: Response): Promise<void> {
  const { decision, reason } = req.body as SanctionInput;
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    throw ApiError.notFound('Loan not found');
  }
  if (loan.status !== LoanStatus.APPLIED) {
    throw ApiError.conflict(`Only APPLIED loans can be sanctioned (current: ${loan.status}).`);
  }

  if (decision === 'APPROVE') {
    loan.status = LoanStatus.SANCTIONED;
    loan.sanctionedBy = req.user!.id as never;
    loan.sanctionedAt = new Date();
  } else {
    loan.status = LoanStatus.REJECTED;
    loan.rejectionReason = reason;
    loan.rejectedAt = new Date();
  }
  await loan.save();
  res.json({ loan });
}

/** Disbursement executive marks a SANCTIONED loan as DISBURSED (funds released). */
export async function disburseLoan(req: Request, res: Response): Promise<void> {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    throw ApiError.notFound('Loan not found');
  }
  if (loan.status !== LoanStatus.SANCTIONED) {
    throw ApiError.conflict(`Only SANCTIONED loans can be disbursed (current: ${loan.status}).`);
  }
  loan.status = LoanStatus.DISBURSED;
  loan.disbursedBy = req.user!.id as never;
  loan.disbursedAt = new Date();
  await loan.save();
  res.json({ loan });
}

/**
 * Collection executive records a repayment against a DISBURSED loan.
 * Validations: UTR unique across all payments, amount > 0 and <= outstanding.
 * Auto-closes the loan when total paid reaches the total repayment.
 */
export async function recordPayment(req: Request, res: Response): Promise<void> {
  const input = req.body as PaymentInput;
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    throw ApiError.notFound('Loan not found');
  }
  if (loan.status !== LoanStatus.DISBURSED) {
    throw ApiError.conflict(`Payments can only be recorded on DISBURSED loans (current: ${loan.status}).`);
  }

  const outstanding = round2(loan.totalRepayment - loan.amountPaid);
  if (input.amount > outstanding) {
    throw ApiError.badRequest(
      `Payment of ${input.amount} exceeds the outstanding balance of ${outstanding}.`,
    );
  }

  let payment;
  try {
    payment = await Payment.create({
      loan: loan.id,
      borrower: loan.borrower,
      utrNumber: input.utrNumber,
      amount: input.amount,
      date: input.date ?? new Date(),
      recordedBy: req.user!.id,
    });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      throw ApiError.conflict('A payment with this UTR number already exists.');
    }
    throw err;
  }

  loan.amountPaid = round2(loan.amountPaid + input.amount);
  if (loan.amountPaid >= loan.totalRepayment) {
    loan.status = LoanStatus.CLOSED;
    loan.closedAt = new Date();
  }
  await loan.save();

  res.status(201).json({ payment, loan });
}

export async function listPayments(req: Request, res: Response): Promise<void> {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    throw ApiError.notFound('Loan not found');
  }
  if (req.user!.role === Role.BORROWER && String(loan.borrower) !== req.user!.id) {
    throw ApiError.forbidden();
  }
  const payments = await Payment.find({ loan: loan.id }).sort({ date: 1, createdAt: 1 });
  res.json({ payments });
}
