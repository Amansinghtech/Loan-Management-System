import { Request, Response } from 'express';
import { Loan } from '../../models/Loan';
import { Payment } from '../../models/Payment';
import { User } from '../../models/User';
import { LoanStatus, Role } from '../../types';
import { ApiError } from '../../utils/ApiError';

/**
 * Sales module: pre-application leads — borrowers who registered but have not
 * applied for any loan yet. Surfaces profile/eligibility progress.
 */
export async function salesLeads(_req: Request, res: Response): Promise<void> {
  const borrowers = await User.find({ role: Role.BORROWER }).sort({ createdAt: -1 }).lean();
  const borrowerIds = borrowers.map((b) => b._id);
  const loanCounts = await Loan.aggregate<{ _id: unknown; count: number }>([
    { $match: { borrower: { $in: borrowerIds } } },
    { $group: { _id: '$borrower', count: { $sum: 1 } } },
  ]);
  const hasLoan = new Set(loanCounts.map((l) => String(l._id)));

  const leads = borrowers
    .filter((b) => !hasLoan.has(String(b._id)))
    .map((b) => ({
      id: String(b._id),
      name: b.name,
      email: b.email,
      profileComplete: b.profileComplete,
      employmentMode: b.employmentMode ?? null,
      monthlySalary: b.monthlySalary ?? null,
      createdAt: b.createdAt,
    }));

  res.json({ leads });
}

const VALID_STATUSES = new Set(Object.values(LoanStatus));

/**
 * Returns loans filtered by status. Each executive module queries the statuses
 * relevant to its stage (Sanction -> APPLIED, Disbursement -> SANCTIONED,
 * Collection -> DISBURSED/CLOSED). Admin may query any status.
 */
export async function listLoans(req: Request, res: Response): Promise<void> {
  const statusParam = (req.query.status as string | undefined)?.toUpperCase();

  const filter: Record<string, unknown> = {};
  if (statusParam) {
    const statuses = statusParam.split(',').map((s) => s.trim());
    for (const s of statuses) {
      if (!VALID_STATUSES.has(s as LoanStatus)) {
        throw ApiError.badRequest(`Invalid status filter: ${s}`);
      }
    }
    filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  const loans = await Loan.find(filter)
    .populate('borrower', 'name email fullName pan monthlySalary employmentMode')
    .sort({ createdAt: -1 });

  res.json({ loans });
}

/**
 * Admin KPI summary for the dashboard: portfolio counts, status breakdown and
 * money movement (disbursed / collected / outstanding). Computed with a couple
 * of aggregations rather than loading every document.
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  const [statusAgg, money, borrowers] = await Promise.all([
    Loan.aggregate<{ _id: LoanStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Loan.aggregate<{
      _id: null;
      loans: number;
      collected: number;
      disbursedAmount: number;
      outstanding: number;
    }>([
      {
        $group: {
          _id: null,
          loans: { $sum: 1 },
          collected: { $sum: '$amountPaid' },
          disbursedAmount: {
            $sum: {
              $cond: [{ $in: ['$status', [LoanStatus.DISBURSED, LoanStatus.CLOSED]] }, '$amount', 0],
            },
          },
          outstanding: {
            $sum: {
              $cond: [
                { $eq: ['$status', LoanStatus.DISBURSED] },
                { $subtract: ['$totalRepayment', '$amountPaid'] },
                0,
              ],
            },
          },
        },
      },
    ]),
    User.countDocuments({ role: Role.BORROWER }),
  ]);

  const byStatus = Object.values(LoanStatus).reduce(
    (acc, status) => {
      acc[status] = statusAgg.find((s) => s._id === status)?.count ?? 0;
      return acc;
    },
    {} as Record<LoanStatus, number>,
  );

  const totals = money[0] ?? { loans: 0, collected: 0, disbursedAmount: 0, outstanding: 0 };
  const round = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

  res.json({
    stats: {
      borrowers,
      loans: totals.loans,
      byStatus,
      disbursedAmount: round(totals.disbursedAmount),
      collected: round(totals.collected),
      outstanding: round(totals.outstanding),
    },
  });
}

/**
 * Returns the full repayment ledger across all loans, each row enriched with the
 * loan's application number/status, the borrower, and who recorded it. Used by
 * the Collection and Admin dashboards. Admin passes via requireRole automatically.
 */
export async function listAllPayments(_req: Request, res: Response): Promise<void> {
  const payments = await Payment.find()
    .populate('loan', 'applicationNo status amount totalRepayment amountPaid')
    .populate('borrower', 'name email fullName')
    .populate('recordedBy', 'name')
    .sort({ date: -1, createdAt: -1 });

  res.json({ payments });
}
