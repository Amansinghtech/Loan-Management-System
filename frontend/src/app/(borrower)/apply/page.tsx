'use client';

import { LoanConfigStep } from '@/components/borrower/loan-config-step';
import { PersonalDetailsStep } from '@/components/borrower/personal-details-step';
import { Stepper } from '@/components/borrower/stepper';
import { UploadStep } from '@/components/borrower/upload-step';
import { LoadingState } from '@/components/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { EmploymentMode, SalarySlip } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STEPS = [
  { id: 1, label: 'Personal Details' },
  { id: 2, label: 'Salary Slip' },
  { id: 3, label: 'Configure & Apply' },
];

const TITLES: Record<number, { title: string; description: string }> = {
  1: { title: 'Personal details', description: 'We run an eligibility check before you can apply.' },
  2: { title: 'Upload salary slip', description: 'Attach a recent salary slip (PDF, JPG or PNG).' },
  3: { title: 'Configure your loan', description: 'Pick an amount and tenure, then apply.' },
};

export default function ApplyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [salarySlip, setSalarySlip] = useState<SalarySlip | null>(null);

  if (isLoading) return <LoadingState />;

  const meta = TITLES[step];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardContent className="py-5">
          <Stepper steps={STEPS} current={step} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <PersonalDetailsStep
              defaultValues={
                user
                  ? {
                      fullName: user.fullName ?? user.name,
                      pan: user.pan,
                      monthlySalary: user.monthlySalary,
                      employmentMode: user.employmentMode ?? EmploymentMode.SALARIED,
                      dob: user.dob ? user.dob.slice(0, 10) : undefined,
                    }
                  : undefined
              }
              onComplete={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <UploadStep
              uploaded={salarySlip}
              onUploaded={setSalarySlip}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && salarySlip && (
            <LoanConfigStep
              salarySlip={salarySlip}
              onBack={() => setStep(2)}
              onApplied={() => router.push('/loans')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
