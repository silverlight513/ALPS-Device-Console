import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import DevicePullout from '@/components/DevicePullout'
import Pagination from '@/components/Pagination'
import {
  LIST_DEVICES_KEY,
  LIST_DEVICES_QUERY,
  type ListDevicesData,
  type ListDevicesVars,
} from '@/lib/gql/queries/listDevices'
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
  const [page, setPage] = useState(1)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const selectedRowButtonRef = useRef<HTMLButtonElement>(null)
  const pulloutRef = useRef<HTMLElement>(null)

  // flushSync renders the change first, because the element to focus may not exist until then.
  const selectDevice = (deviceId: string) => {
    if (deviceId === selectedDeviceId) return
    flushSync(() => setSelectedDeviceId(deviceId))
    pulloutRef.current?.focus()
  }

  const closePullout = () => {
    const rowButton = selectedRowButtonRef.current
    flushSync(() => setSelectedDeviceId(null))
    ;(rowButton ?? headingRef.current)?.focus()
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    setSelectedDeviceId(null)
  }

  const { data, loading, errors } = useTenantQuery<ListDevicesData, ListDevicesVars>(LIST_DEVICES_QUERY, {
    variables: {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    fetchFirst: true,
    queryKey: LIST_DEVICES_KEY,
  })

  const responseTotal = data ? (data.listDevices?.pageInfo?.total_count ?? 0) : undefined

  // Each page has its own cache entry, so the total is missing while a new page loads.
  // Remembering it keeps the pagination on screen. This component remounts per tenant, so it's never another tenant's count.
  const [lastTotal, setLastTotal] = useState(0)

  if (responseTotal !== undefined && lastTotal !== responseTotal) {
    setLastTotal(responseTotal)
  }

  const totalCount = responseTotal ?? lastTotal

  const devices = data?.listDevices?.deviceList?.filter((device) => device !== null) ?? []

  return (
    <S.Container>
      <S.Content>
        <S.Heading ref={headingRef} tabIndex={-1}>
          Devices
        </S.Heading>
        <S.List>
          {/* NOTE: Could have abstracted this section outside the return with a let but I find doing it this way helps enforce seperation of concerns, especially considering the talk about handling errors and data together. */}
          {!loading && errors.length > 0 && <S.ErrorMessage role="alert">{errors.join('; ')}</S.ErrorMessage>}
          {loading && <S.Message>Loading devices…</S.Message>}
          {!loading && devices.length === 0 && (
            <S.Message>No devices found.</S.Message>
          )}
          {devices.map((device) => {
            const isSelected = device.id === selectedDeviceId

            return (
              <S.Row key={device.id} $selected={isSelected}>
                <S.SerialButton
                  ref={isSelected ? selectedRowButtonRef : undefined}
                  type="button"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => selectDevice(device.id)}
                >
                  {device.serialNumber ?? device.id}
                </S.SerialButton>
                <S.State>
                  <S.StateDot $state={device.state?.name ?? null} />
                  {device.state?.name ?? 'UNKNOWN'}
                </S.State>
                <S.Policy $tone={POLICY_TONES[device.policy.id] ?? 'neutral'}>
                  {device.policy.name ?? 'Unknown policy'}
                </S.Policy>
              </S.Row>
            )
          })}
        </S.List>
      </S.Content>
      {totalCount > 0 && (
        <Pagination
          page={page}
          totalCount={totalCount}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={changePage}
        />
      )}
      {selectedDeviceId && (
        <DevicePullout ref={pulloutRef} deviceId={selectedDeviceId} onClose={closePullout} />
      )}
    </S.Container>
  )
}

export default DeviceList
