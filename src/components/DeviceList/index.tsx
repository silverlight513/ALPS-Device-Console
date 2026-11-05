import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { DevicePolicy, DeviceState } from '@/components/DeviceStatus'
import DevicePullout from '@/components/DevicePullout'
import Pagination from '@/components/Pagination'
import RetryButton from '@/components/RetryButton'
import { UNAVAILABLE, formatDate } from '@/lib/format'
import {
  DEVICE_STATES,
  LIST_DEVICES_KEY,
  LIST_DEVICES_QUERY,
  deviceSearchVariables,
  type ListDevicesData,
  type ListDevicesDevice,
  type ListDevicesVars,
} from '@/lib/gql/queries/listDevices'
import { useTenantQuery } from '@/lib/tenant'
import DeviceFilters from './DeviceFilters'
import * as S from './styles'

const DEFAULT_PAGE_SIZE = 10

// No fallback to another IMEI, because that would label the wrong identifier as the primary one.
const primaryImei = (device: ListDevicesDevice) =>
  device.IMEIs?.find((imei) => imei?.isPrimary)?.imei ?? UNAVAILABLE

function emptyMessage(search: string, stateId: number | undefined) {
  const { imei } = deviceSearchVariables(search)
  const stateName = DEVICE_STATES.find((state) => state.id === stateId)?.name
  const inState = stateName ? ` in state ${stateName}` : ''

  if (!search) return stateName ? `No devices${inState}.` : 'No devices found.'
  // Names the field that was searched, so a digits-only serial fragment is explained rather than just empty.
  const field = imei ? 'an IMEI' : 'a serial number'
  return `No devices with ${field} containing "${search}"${inState}.`
}

function DeviceList() {
  const [search, setSearch] = useState('')
  const [stateId, setStateId] = useState<number | undefined>(undefined)
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

  const resetForNewFilters = () => {
    // A row can be picked before the search debounce fires, which puts focus in the closing panel.
    if (pulloutRef.current?.contains(document.activeElement)) headingRef.current?.focus()
    setPage(1)
    setSelectedDeviceId(null)
  }

  const changeSearch = (nextSearch: string) => {
    if (nextSearch === search) return
    setSearch(nextSearch)
    resetForNewFilters()
  }

  const changeState = (nextStateId: number | undefined) => {
    setStateId(nextStateId)
    resetForNewFilters()
  }

  // TODO: a superseded search keeps running. It can't overwrite anything, as the response goes to
  // its own cache entry, but aborting it would save the request.
  const { data, loading, errors, refetch } = useTenantQuery<ListDevicesData, ListDevicesVars>(LIST_DEVICES_QUERY, {
    variables: {
      ...deviceSearchVariables(search),
      stateId,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    fetchFirst: true,
    queryKey: LIST_DEVICES_KEY,
  })

  // The hook only returns data for the current variables, so it can't leak between queries.
  // Keeping the last result here stops the table blanking on each search. This component remounts
  // per tenant, so it's never another tenant's rows.
  const filtersKey = `${stateId}:${search}`
  const [lastResult, setLastResult] = useState<{ data: ListDevicesData; filtersKey: string } | null>(null)

  if (data && lastResult?.data !== data) {
    setLastResult({ data, filtersKey })
  }

  // The total belongs to other filters. Paging on it could land past the end of the new results.
  const totalIsOutdated = !data && lastResult?.filtersKey !== filtersKey
  const responseTotal = data ? (data.listDevices?.pageInfo?.total_count ?? 0) : undefined
  const lastTotal = lastResult?.data.listDevices?.pageInfo?.total_count ?? 0
  // Kept after a failed page load, so that the user can still page away from it. A failed search
  // has no total of its own, and showing the old one would describe results that aren't on screen.
  const totalCount = responseTotal ?? (totalIsOutdated && errors.length > 0 ? 0 : lastTotal)

  // The current page can stop existing, e.g. when devices leave the results.
  const lastPage = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE))
  if (responseTotal !== undefined && page > lastPage) {
    setPage(lastPage)
  }

  // Not while an error is showing, or retrying a failed search would bring back the old rows.
  const shownData = data ?? (loading && errors.length === 0 ? lastResult?.data : undefined)
  const devices = shownData?.listDevices?.deviceList?.filter((device) => device !== null) ?? []
  const showingPreviousRows = !data && shownData !== undefined

  return (
    <S.Container>
      <S.Content>
        <S.Heading ref={headingRef} tabIndex={-1}>
          Devices
        </S.Heading>
        <DeviceFilters stateId={stateId} onSearchChange={changeSearch} onStateChange={changeState} />
        {/* NOTE: Could have abstracted this section outside the return with a let but I find doing it this way helps enforce seperation of concerns, especially considering the talk about handling errors and data together. */}
        {errors.length > 0 && (
          <>
            <S.ErrorMessage role="alert">{errors.join('; ')}</S.ErrorMessage>
            <RetryButton retrying={loading} onRetry={() => void refetch()} focusAfterRef={headingRef} />
          </>
        )}
        {loading && errors.length === 0 && !data && devices.length === 0 && (
          <S.Message>Loading devices…</S.Message>
        )}
        {data && errors.length === 0 && devices.length === 0 && (
          <S.Message>{emptyMessage(search, stateId)}</S.Message>
        )}
        {devices.length > 0 && (
          <S.TableWrapper aria-busy={loading} $dimmed={showingPreviousRows}>
            <S.Table>
              <thead>
                <tr>
                  <th scope="col">Serial number</th>
                  <th scope="col">Primary IMEI</th>
                  <th scope="col">Model</th>
                  <th scope="col">State</th>
                  <th scope="col">Last check-in</th>
                  <th scope="col">Policy</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const isSelected = device.id === selectedDeviceId

                  return (
                    <S.Row key={device.id} $selected={isSelected}>
                      <td>
                        <S.SerialButton
                          ref={isSelected ? selectedRowButtonRef : undefined}
                          type="button"
                          aria-current={isSelected ? 'true' : undefined}
                          onClick={() => selectDevice(device.id)}
                        >
                          {device.serialNumber ?? device.id}
                        </S.SerialButton>
                      </td>
                      <S.NumericCell>{primaryImei(device)}</S.NumericCell>
                      <td>{device.modelMarketingName ?? UNAVAILABLE}</td>
                      <td>
                        <DeviceState state={device.state} />
                      </td>
                      <S.NumericCell>{formatDate(device.lastCheckin)}</S.NumericCell>
                      <td>
                        <DevicePolicy policy={device.policy} />
                      </td>
                    </S.Row>
                  )
                })}
              </tbody>
            </S.Table>
          </S.TableWrapper>
        )}
      </S.Content>
      <Pagination
        page={page}
        totalCount={totalCount}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={changePage}
        disabled={totalIsOutdated}
      />
      {selectedDeviceId && (
        <DevicePullout key={selectedDeviceId} ref={pulloutRef} deviceId={selectedDeviceId} onClose={closePullout} />
      )}
    </S.Container>
  )
}

export default DeviceList
