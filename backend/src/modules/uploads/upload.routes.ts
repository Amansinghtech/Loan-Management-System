import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { Role } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { handleUpload, uploadSlip, viewSlip } from './upload.controller';

const router = Router();

router.post(
  '/salary-slip',
  authenticate,
  requireRole(Role.BORROWER),
  handleUpload,
  asyncHandler(uploadSlip),
);

router.get('/view', authenticate, asyncHandler(viewSlip));

export default router;
