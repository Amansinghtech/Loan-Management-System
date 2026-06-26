import { z } from 'zod';
import { BRE_RULES, EmploymentMode } from '../../types';

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(120),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(BRE_RULES.PAN_REGEX, 'PAN must match the format ABCDE1234F'),
  dob: z.coerce.date({ errorMap: () => ({ message: 'A valid date of birth is required' }) }),
  monthlySalary: z.coerce.number().nonnegative('Monthly salary cannot be negative'),
  employmentMode: z.nativeEnum(EmploymentMode),
});

export type ProfileInput = z.infer<typeof profileSchema>;
