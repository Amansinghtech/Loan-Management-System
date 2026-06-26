'use client';

import { ModuleHeader } from '@/components/dashboard/module-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalesLeads } from '@/hooks/useOpsLoans';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/utils';

export default function SalesPage() {
  const { data, isLoading, isError, error } = useSalesLeads();

  return (
    <div>
      <ModuleHeader
        title="Sales"
        description="Registered users who haven't applied yet — your leads."
        count={data?.length}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} />}
      {data && data.length === 0 && (
        <EmptyState title="No leads right now" description="New sign-ups without a loan appear here." />
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Monthly salary</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant={lead.profileComplete ? 'success' : 'secondary'}>
                      {lead.profileComplete ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.employmentMode ?? '—'}</TableCell>
                  <TableCell>
                    {lead.monthlySalary != null ? formatINR(lead.monthlySalary) : '—'}
                  </TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
