import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { Role } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  applyForLoan,
  disburseLoan,
  getLoan,
  listPayments,
  myLoans,
  recordPayment,
  sanctionLoan,
} from './loan.controller';
import { applyLoanSchema, paymentSchema, sanctionSchema } from './loan.schemas';

const router = Router();

router.use(authenticate);

// Borrower
router.post('/', requireRole(Role.BORROWER), validate(applyLoanSchema), asyncHandler(applyForLoan));
router.get('/mine', requireRole(Role.BORROWER), asyncHandler(myLoans));

// Shared (borrower owner or executive/admin) — ownership enforced in controller
router.get('/:id', asyncHandler(getLoan));
router.get('/:id/payments', asyncHandler(listPayments));

// Executive transitions
router.patch(
  '/:id/sanction',
  requireRole(Role.SANCTION),
  validate(sanctionSchema),
  asyncHandler(sanctionLoan),
);
router.patch('/:id/disburse', requireRole(Role.DISBURSEMENT), asyncHandler(disburseLoan));
router.post(
  '/:id/payments',
  requireRole(Role.COLLECTION),
  validate(paymentSchema),
  asyncHandler(recordPayment),
);

export default router;
