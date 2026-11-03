import { createContext } from 'react';

// A simple `['tenant-alpha', 'tenant-beta']` shape would be simpler but I figured the concept of a tenant would be larger in real life so I wrote an extendable version for future use.
export const TENANTS = {
  'tenant-alpha': { id: 'tenant-alpha', name: 'Alpha' },
  'tenant-beta': { id: 'tenant-beta', name: 'Beta' },
} as const;

export type TenantId = keyof typeof TENANTS;
export type Tenant = (typeof TENANTS)[TenantId];

export type TenantContextValue = {
  tenantId: TenantId;
  setTenantId: (tenantId: TenantId) => void;
};

export const TenantContext = createContext<TenantContextValue | null>(null);
