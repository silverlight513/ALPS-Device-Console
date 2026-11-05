import { useCallback, useContext } from 'react';
import { useMutation, useQuery } from '@/lib/gql';
import type { UseMutationResult, UseQueryResult } from '@/lib/gql';
import { TenantContext } from './context';
import type { TenantContextValue, TenantId } from './context';

export { TenantProvider } from './TenantProvider';
export { TENANTS } from './context';
export type { Tenant, TenantId } from './context';

type TenantScoped<TVars> = TVars & { tenantId: TenantId };

// `tenantId` is spread last so that variables can never override it.
function withTenant<TVars>(variables: TVars | undefined, tenantId: TenantId) {
  return { ...variables, tenantId } as TenantScoped<TVars>;
}

export function useTenant(): TenantContextValue {
  const tenant = useContext(TenantContext);
  if (!tenant) throw new Error('Tenant hooks must be used inside a TenantProvider');
  return tenant;
}

export function useTenantQuery<TData, TVars = object>(
  query: string,
  options: { variables?: TVars; fetchFirst?: boolean; queryKey?: string },
): UseQueryResult<TData, TVars> {
  const { tenantId } = useTenant();
  const result = useQuery<TData, TenantScoped<TVars>>(query, {
    ...options,
    variables: withTenant(options.variables, tenantId),
  });
  const { refetch: baseRefetch } = result;

  // `replace: true` uses the passed variables as-is, so they need the tenant added here too.
  const refetch = useCallback(
    (variables?: TVars, replace?: boolean) => baseRefetch(withTenant(variables, tenantId), replace),
    [baseRefetch, tenantId],
  );

  return { ...result, refetch };
}

export function useTenantMutation<TData, TVars = object>(
  query: string,
  options: { variables?: TVars; throwError?: boolean },
): UseMutationResult<TData, TVars> {
  const { tenantId } = useTenant();
  const result = useMutation<TData, TenantScoped<TVars>>(query, {
    ...options,
    variables: withTenant(options.variables, tenantId),
  });
  const { mutateData: baseMutateData } = result;

  // `replace: true` uses the passed variables as-is, so they need the tenant added here too.
  const mutateData = useCallback(
    (variables?: TVars, replace?: boolean) =>
      baseMutateData(withTenant(variables, tenantId), replace),
    [baseMutateData, tenantId],
  );

  return { ...result, mutateData };
}
