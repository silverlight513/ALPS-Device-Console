import { useId, useState } from 'react'

import Pagination from '@/components/Pagination'
import {
  LIST_DEVICE_HISTORY_QUERY,
  deviceHistoryKey,
  type ListDeviceHistoryData,
  type ListDeviceHistoryVars,
} from '@/lib/gql/queries/listDeviceHistory'
import { useTenantQuery } from '@/lib/tenant'
import { ErrorMessage, Message, Section } from '../styles'
import * as S from './styles'

const PAGE_SIZE = 5

function DeviceHistory({ deviceId }: { deviceId: string }) {
  const headingId = useId()
  const [page, setPage] = useState(1)

  const { data, loading, errors } = useTenantQuery<ListDeviceHistoryData, ListDeviceHistoryVars>(
    LIST_DEVICE_HISTORY_QUERY,
    {
      variables: { deviceId, page, pageSize: PAGE_SIZE },
      fetchFirst: true,
      queryKey: deviceHistoryKey(deviceId),
    },
  )

  const responseTotal = data ? (data.listDeviceHistory?.pageInfo?.total_count ?? 0) : undefined

  // Each page has its own cache entry, so the total is missing while a new page loads.
  // Remembering it keeps the pagination on screen. The pullout remounts per device, so it's never another device's count.
  const [lastTotal, setLastTotal] = useState(0)

  if (responseTotal !== undefined && lastTotal !== responseTotal) {
    setLastTotal(responseTotal)
  }

  const totalCount = responseTotal ?? lastTotal
  const histories = data?.listDeviceHistory?.histories?.filter((entry) => entry !== null) ?? []

  // TODO: add a retry button. For now, failed entries are never fresh, so reopening the panel refetches them.
  return (
    <Section aria-labelledby={headingId}>
      <S.Heading id={headingId}>History</S.Heading>
      {errors.length > 0 && <ErrorMessage role="alert">{errors.join('; ')}</ErrorMessage>}
      {loading && !data && <Message>Loading history…</Message>}
      {!loading && data && errors.length === 0 && histories.length === 0 && (
        <Message>No history for this device.</Message>
      )}
      {histories.length > 0 && (
        <S.List>
          {histories.map((entry, index) => (
            <S.Entry key={`${entry.createdAt}-${index}`}>
              <S.EntryHeader>
                <S.EventType>{entry.type ?? 'Unknown event'}</S.EventType>
                <S.Meta>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Unknown time'}</S.Meta>
              </S.EntryHeader>
              {entry.actionName && <div>{entry.actionName}</div>}
              <div>
                {entry.policyName ?? 'Unknown policy'} → {entry.nextPolicyName ?? 'Unknown policy'}
              </div>
              <S.Meta>{entry.email ?? 'Unknown operator'}</S.Meta>
            </S.Entry>
          ))}
        </S.List>
      )}
      <Pagination
        page={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        label="History pagination"
      />
    </Section>
  )
}

export default DeviceHistory
