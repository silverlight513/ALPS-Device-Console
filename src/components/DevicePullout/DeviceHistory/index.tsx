import { useId, useRef, useState } from 'react'

import Pagination from '@/components/Pagination'
import RetryButton from '@/components/RetryButton'
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
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [page, setPage] = useState(1)

  const { data, loading, errors, refetch } = useTenantQuery<ListDeviceHistoryData, ListDeviceHistoryVars>(
    LIST_DEVICE_HISTORY_QUERY,
    {
      variables: { deviceId, page, pageSize: PAGE_SIZE },
      fetchFirst: true,
      queryKey: deviceHistoryKey(deviceId),
    },
  )

  // Each page has its own cache entry, so nothing is returned while a new page loads. Keeping the
  // last result stops the panel collapsing, which would move Next out from under the cursor.
  // The pullout remounts per device, so it's never another device's history.
  const [lastData, setLastData] = useState<ListDeviceHistoryData | undefined>(undefined)

  if (data && lastData !== data) {
    setLastData(data)
  }

  const latestData = data ?? lastData
  const totalCount = latestData ? (latestData.listDeviceHistory?.pageInfo?.total_count ?? 0) : undefined
  const shownData = data ?? (loading && errors.length === 0 ? lastData : undefined)
  const histories = shownData?.listDeviceHistory?.histories?.filter((entry) => entry !== null) ?? []

  return (
    <Section aria-labelledby={headingId}>
      <S.Heading ref={headingRef} id={headingId} tabIndex={-1}>
        History
      </S.Heading>
      {errors.length > 0 && (
        <>
          <ErrorMessage role="alert">{errors.join('; ')}</ErrorMessage>
          <RetryButton retrying={loading} onRetry={() => void refetch()} focusAfterRef={headingRef} />
        </>
      )}
      {loading && errors.length === 0 && !data && histories.length === 0 && <Message>Loading history…</Message>}
      {!loading && data && errors.length === 0 && histories.length === 0 && (
        <Message>No history for this device.</Message>
      )}
      {histories.length > 0 && (
        <S.List aria-busy={loading} $dimmed={!data}>
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
