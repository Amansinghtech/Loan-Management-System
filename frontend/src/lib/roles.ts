import { Role } from './types';

export interface ModuleDef {
  key: string;
  label: string;
  href: string;
  role: Role;
  description: string;
}

export const DASHBOARD_MODULES: ModuleDef[] = [
  {
    key: 'sales',
    label: 'Sales',
    href: '/dashboard/sales',
    role: Role.SALES,
    description: 'Pre-application leads',
  },
  {
    key: 'sanction',
    label: 'Sanction',
    href: '/dashboard/sanction',
    role: Role.SANCTION,
    description: 'Review applied loans',
  },
  {
    key: 'disbursement',
    label: 'Disbursement',
    href: '/dashboard/disbursement',
    role: Role.DISBURSEMENT,
    description: 'Release sanctioned funds',
  },
  {
    key: 'collection',
    label: 'Collection',
    href: '/dashboard/collection',
    role: Role.COLLECTION,
    description: 'Record repayments',
  },
  {
    key: 'payments',
    label: 'Payments',
    href: '/dashboard/payments',
    role: Role.ADMIN,
    description: 'Repayment ledger',
  },
];

/** Modules a given role may access. Admin sees all. */
export function modulesForRole(role: Role): ModuleDef[] {
  if (role === Role.ADMIN) return DASHBOARD_MODULES;
  return DASHBOARD_MODULES.filter((m) => m.role === role);
}

export function canAccessModule(role: Role, moduleRole: Role): boolean {
  return role === Role.ADMIN || role === moduleRole;
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.SALES]: 'Sales',
  [Role.SANCTION]: 'Sanction',
  [Role.DISBURSEMENT]: 'Disbursement',
  [Role.COLLECTION]: 'Collection',
  [Role.BORROWER]: 'Borrower',
};
