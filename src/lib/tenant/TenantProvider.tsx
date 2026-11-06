import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useGqlStore } from '@/lib/gql';
import { TenantContext, type TenantId } from './context';

export function TenantProvider({ children }: { children: ReactNode }) {
  const store = useGqlStore();
  const [tenantId, setTenantIdState] = useState<TenantId>('tenant-alpha');

  // Clears here rather than in an effect on `tenantId`. Child effects run first, so an effect
  // would abort the new tenant's first requests, and the old data would outlive the commit.
  const setTenantId = useCallback(
    (nextTenantId: TenantId) => {
      if (nextTenantId === tenantId) return;
      store.clear();
      setTenantIdState(nextTenantId);
    },
    [store, tenantId],
  );

  const value = useMemo(() => ({ tenantId, setTenantId }), [tenantId, setTenantId]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
