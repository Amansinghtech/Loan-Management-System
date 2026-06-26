import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { Role } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { upsertProfile } from './borrower.controller';
import { profileSchema } from './borrower.schemas';

const router = Router();

router.put(
  '/profile',
  authenticate,
  requireRole(Role.BORROWER),
  validate(profileSchema),
  asyncHandler(upsertProfile),
);

export default router;
