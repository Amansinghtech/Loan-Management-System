import { Request, Response } from 'express';
import { User } from '../../models/User';
import { evaluateBre } from '../../services/bre';
import { ApiError } from '../../utils/ApiError';
import { ProfileInput } from './borrower.schemas';

/**
 * Saves the borrower's personal details and runs the authoritative BRE.
 * If any rule fails the application is blocked (profileComplete stays false)
 * and every failure is returned so the UI can show them all at once.
 */
export async function upsertProfile(req: Request, res: Response): Promise<void> {
  const input = req.body as ProfileInput;

  const bre = evaluateBre({
    pan: input.pan,
    dob: input.dob,
    monthlySalary: input.monthlySalary,
    employmentMode: input.employmentMode,
  });

  if (!bre.passed) {
    throw ApiError.badRequest('Eligibility check failed', bre.failures);
  }

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      fullName: input.fullName,
      pan: input.pan,
      dob: input.dob,
      monthlySalary: input.monthlySalary,
      employmentMode: input.employmentMode,
      profileComplete: true,
    },
    { new: true },
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({ user, eligibility: bre });
}
