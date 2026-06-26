'use client';

import { LoadingState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatINR } from '@/lib/utils';
import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  IndianRupee,
  Mail,
  PencilLine,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <LoadingState />;

  const initials = (user.fullName ?? user.name)
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My profile</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/apply">
            <PencilLine className="h-4 w-4" /> Update details
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center">
          <div className="brand-gradient flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold">{user.fullName ?? user.name}</p>
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <Mail className="h-4 w-4" /> {user.email}
            </p>
          </div>
          <div className="sm:ml-auto">
            <Badge variant={user.profileComplete ? 'success' : 'secondary'}>
              {user.profileComplete ? 'Profile complete' : 'Profile incomplete'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field icon={UserRound} label="Full name" value={user.fullName ?? '—'} />
          <Field icon={CreditCard} label="PAN" value={user.pan ?? '—'} mono />
          <Field
            icon={CalendarDays}
            label="Date of birth"
            value={user.dob ? formatDate(user.dob) : '—'}
          />
          <Field
            icon={IndianRupee}
            label="Monthly salary"
            value={user.monthlySalary != null ? formatINR(user.monthlySalary) : '—'}
          />
          <Field
            icon={BriefcaseBusiness}
            label="Employment mode"
            value={user.employmentMode ?? '—'}
          />
          <Field icon={CalendarDays} label="Member since" value={formatDate(user.createdAt)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={mono ? 'font-mono font-medium' : 'font-medium'}>{value}</p>
      </div>
    </div>
  );
}
