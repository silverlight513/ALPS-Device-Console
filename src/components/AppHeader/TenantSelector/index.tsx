import type { ChangeEvent } from 'react'

import { setPageParam } from '@/lib/pagination'
import { TENANTS, useTenantMutation, useTenantQuery } from '@/lib/tenant'
import type { TenantId } from '@/lib/tenant'
import * as S from './styles';

function TenantSelector() {
  const tenant = useTenantQuery()
  const selectTenant = useTenantMutation()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // The options below are built from TENANTS, so the value is always a TenantId.
    selectTenant(event.target.value as TenantId)
    // Done here rather than in an effect, so no request is sent for the new tenant at the old page.
    setPageParam(1, { replace: true })
  }

  return (
    <S.Label>
      Tenant
      <S.Select value={tenant.id} onChange={handleChange}>
        {Object.values(TENANTS).map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </S.Select>
    </S.Label>
  )
}

export default TenantSelector
