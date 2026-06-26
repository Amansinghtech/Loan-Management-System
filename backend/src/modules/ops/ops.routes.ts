import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { Role } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { getStats, listAllPayments, listLoans, salesLeads } from './ops.controller';

const router = Router();

router.use(authenticate);

router.get('/sales/leads', requireRole(Role.SALES), asyncHandler(salesLeads));

// Admin KPI summary (admin auto-passes requireRole; no other role is allowed).
router.get('/stats', requireRole(Role.ADMIN), asyncHandler(getStats));

// Loan lists are read by every executive module (and admin); the controller
// returns whatever status filter is requested.
router.get(
  '/loans',
  requireRole(Role.SANCTION, Role.DISBURSEMENT, Role.COLLECTION),
  asyncHandler(listLoans),
);

// Repayment ledger — Collection records payments, Admin oversees all (admin auto-passes).
router.get('/payments', requireRole(Role.COLLECTION), asyncHandler(listAllPayments));

export default router;
