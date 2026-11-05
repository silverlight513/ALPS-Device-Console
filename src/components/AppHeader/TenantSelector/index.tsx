import type { ChangeEvent } from 'react'

import { TENANTS, useTenant } from '@/lib/tenant'
import type { TenantId } from '@/lib/tenant'
import * as S from './styles';

function TenantSelector() {
  const { tenantId, setTenantId } = useTenant()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // The options below are built from TENANTS, so the value is always a TenantId.
    setTenantId(event.target.value as TenantId)
  }

  return (
    <S.Label>
      Tenant
      <S.Select value={tenantId} onChange={handleChange}>
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
