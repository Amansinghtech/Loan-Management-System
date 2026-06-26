import { Request } from 'express';
import multer from 'multer';
import { ApiError } from '../../utils/ApiError';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png']);

export const uploadSalarySlip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req: Request, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(ApiError.badRequest('Only PDF, JPG, or PNG files are allowed.'));
      return;
    }
    cb(null, true);
  },
}).single('file');
