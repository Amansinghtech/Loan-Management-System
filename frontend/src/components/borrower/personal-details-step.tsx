'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthActions } from '@/hooks/useAuth';
import { api, getApiErrorDetails, getApiErrorMessage } from '@/lib/api';
import { BreFailure, EmploymentMode, User } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function ageFrom(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

// Client mirror of the server BRE for instant feedback. The server remains authoritative.
const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, 'PAN must match the format ABCDE1234F'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((v) => {
      const age = ageFrom(v);
      return age >= 23 && age <= 50;
    }, 'Applicant age must be between 23 and 50'),
  monthlySalary: z.coerce.number().min(25000, 'Monthly salary must be at least Rs. 25,000'),
  employmentMode: z.nativeEnum(EmploymentMode).refine((v) => v !== EmploymentMode.UNEMPLOYED, {
    message: 'Unemployed applicants are not eligible',
  }),
});

type FormValues = z.infer<typeof schema>;

export interface PersonalDetailsDefaults {
  fullName?: string;
  pan?: string;
  dob?: string;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
}

export function PersonalDetailsStep({
  defaultValues,
  onComplete,
}: {
  defaultValues?: PersonalDetailsDefaults;
  onComplete: () => void;
}) {
  const { setUser } = useAuthActions();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employmentMode: EmploymentMode.SALARIED,
      ...defaultValues,
    } as Partial<FormValues>,
  });

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await api.put<{ user: User }>('/borrower/profile', values);
      setUser(data.user);
      toast.success('Eligibility check passed');
      onComplete();
    } catch (err) {
      const failures = getApiErrorDetails<BreFailure[]>(err);
      if (Array.isArray(failures)) {
        const fieldByRule: Record<BreFailure['rule'], keyof FormValues> = {
          AGE: 'dob',
          SALARY: 'monthlySalary',
          PAN: 'pan',
          EMPLOYMENT: 'employmentMode',
        };
        failures.forEach((f) => setError(fieldByRule[f.rule], { message: f.message }));
        toast.error('Eligibility check failed');
      } else {
        toast.error(getApiErrorMessage(err, 'Could not save details'));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <p className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" /> Eligibility rules
        </p>
        <p className="mt-1 text-blue-700">
          Age 23–50, monthly salary at least Rs. 25,000, valid PAN, and you must be employed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pan">PAN</Label>
          <Input id="pan" placeholder="ABCDE1234F" className="uppercase" {...register('pan')} />
          {errors.pan && <p className="text-xs text-destructive">{errors.pan.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dob">Date of birth</Label>
          <Input id="dob" type="date" {...register('dob')} />
          {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="monthlySalary">Monthly salary (Rs.)</Label>
          <Input id="monthlySalary" type="number" {...register('monthlySalary')} />
          {errors.monthlySalary && (
            <p className="text-xs text-destructive">{errors.monthlySalary.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Employment mode</Label>
          <Controller
            control={control}
            name="employmentMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmploymentMode.SALARIED}>Salaried</SelectItem>
                  <SelectItem value={EmploymentMode.SELF_EMPLOYED}>Self-Employed</SelectItem>
                  <SelectItem value={EmploymentMode.UNEMPLOYED}>Unemployed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.employmentMode && (
            <p className="text-xs text-destructive">{errors.employmentMode.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Checking...' : 'Run eligibility check'}
        </Button>
      </div>
    </form>
  );
}
