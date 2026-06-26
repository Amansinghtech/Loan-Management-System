import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { Loan } from '../../models/Loan';
import { getSignedViewUrl, putObject } from '../../services/storage';
import { Role } from '../../types';
import { ApiError } from '../../utils/ApiError';
import { uploadSalarySlip } from './upload.middleware';

/** Runs multer and converts its errors (e.g. file too large) into ApiErrors. */
export function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadSalarySlip(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(ApiError.badRequest('File exceeds the 5 MB limit.'));
        return;
      }
      next(ApiError.badRequest(err.message));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

export async function uploadSlip(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded. Use the "file" field.');
  }
  const stored = await putObject(req.file.buffer, req.file.mimetype, req.file.originalname);
  res.status(201).json({ salarySlip: stored });
}

/**
 * Returns a short-lived presigned URL for a stored salary slip.
 * Borrowers may only view slips attached to their own loans; executives/admin
 * may view any. The object key is passed as a query param (keys contain slashes).
 */
export async function viewSlip(req: Request, res: Response): Promise<void> {
  const key = req.query.key as string | undefined;
  if (!key) {
    throw ApiError.badRequest('Missing "key" query parameter.');
  }

  if (req.user!.role === Role.BORROWER) {
    const owns = await Loan.exists({ 'salarySlip.key': key, borrower: req.user!.id });
    if (!owns) {
      throw ApiError.forbidden();
    }
  }

  const url = await getSignedViewUrl(key);
  res.json({ url });
}
