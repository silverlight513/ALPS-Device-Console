import { useContext } from 'react';
import { TENANTS, TenantContext } from './context';
import type { Tenant, TenantId } from './context';

export { TenantProvider } from './TenantProvider';
export { TENANTS } from './context';
export type { Tenant, TenantId } from './context';

function useTenantContext() {
  const tenant = useContext(TenantContext);
  if (!tenant) throw new Error('Tenant hooks must be used inside a TenantProvider');
  return tenant;
}

export function useTenantQuery(): Tenant {
  const { tenantId } = useTenantContext();
  return TENANTS[tenantId];
}

export function useTenantMutation(): (tenantId: TenantId) => void {
  const { setTenantId } = useTenantContext()
  return setTenantId;
}
