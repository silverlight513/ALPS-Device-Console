import { useEffect, useState } from 'react'

import Pagination from '@/components/Pagination'
import { useQuery } from '@/lib/gql'
import {
  LIST_DEVICES_KEY,
  LIST_DEVICES_QUERY,
  type ListDevicesData,
  type ListDevicesVars,
} from '@/lib/gql/queries/listDevices'
import { setPageParam, usePageParam } from '@/lib/pagination'
import { useTenantQuery } from '@/lib/tenant'
import * as S from './styles'

const DEFAULT_PAGE_SIZE = 10

// The API also sends `policy.color`, but those colours aren't readable as text on this theme.
const POLICY_TONES: Record<string, S.PolicyTone> = {
  'pol-1': 'success',
  'pol-2': 'warning',
  'pol-3': 'danger',
}

function DeviceList() {
  const tenant = useTenantQuery()
  const page = usePageParam()

  const { data, loading, errors } = useQuery<ListDevicesData, ListDevicesVars>(LIST_DEVICES_QUERY, {
    variables: {
      tenantId: tenant.id,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    fetchFirst: true,
    queryKey: LIST_DEVICES_KEY,
  })

  const responseTotal = data ? (data.listDevices?.pageInfo?.total_count ?? 0) : undefined

  // Each page has its own cache entry, so the total is missing while a new page loads.
  // Remembering it per tenant keeps the pagination on screen without showing another tenant's count.
  const [lastTotal, setLastTotal] = useState<{ tenantId: string; count: number } | null>(null)
  if (responseTotal !== undefined && (lastTotal?.tenantId !== tenant.id || lastTotal.count !== responseTotal)) {
    setLastTotal({ tenantId: tenant.id, count: responseTotal })
  }
  const rememberedTotal = lastTotal?.tenantId === tenant.id ? lastTotal.count : 0
  const totalCount = responseTotal ?? rememberedTotal

  const lastPage = Math.ceil(totalCount / DEFAULT_PAGE_SIZE)
  const isPastLastPage = totalCount > 0 && page > lastPage

  useEffect(() => {
    if (!loading && responseTotal !== undefined && isPastLastPage) {
      setPageParam(lastPage, { replace: true })
    }
  }, [loading, responseTotal, isPastLastPage, lastPage])

  const devices = data?.listDevices?.deviceList?.filter((device) => device !== null) ?? []

  let content
  if (errors.length > 0) content = <S.ErrorMessage role="alert">{errors.join('; ')}</S.ErrorMessage>
  else if (loading || isPastLastPage) content = <S.Message>Loading devices…</S.Message>
  else if (devices.length === 0) content = <S.Message>No devices found.</S.Message>
  else {
    content = (
      <S.List>
        {devices.map((device) => (
          <S.Row key={device.id}>
            <S.Serial>{device.serialNumber ?? device.id}</S.Serial>
            <S.State>
              <S.StateDot $state={device.state?.name ?? null} />
              {device.state?.name ?? 'UNKNOWN'}
            </S.State>
            <S.Policy $tone={POLICY_TONES[device.policy.id] ?? 'neutral'}>
              {device.policy.name ?? 'Unknown policy'}
            </S.Policy>
          </S.Row>
        ))}
      </S.List>
    )
  }

  return (
    <S.Container>
      <S.Content>
        <S.Heading>Devices</S.Heading>
        {content}
      </S.Content>
      {totalCount > 0 && !isPastLastPage && (
        <Pagination
          page={page}
          totalCount={totalCount}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPageParam}
        />
      )}
    </S.Container>
  )
}

export default DeviceList
