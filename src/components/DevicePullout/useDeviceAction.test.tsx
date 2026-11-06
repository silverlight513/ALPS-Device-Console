import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { graphql } from 'msw/graphql'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { applyOverride, overrideFor, useDeviceOverrides } from '@/lib/devices/overrides'
import { GqlProvider } from '@/lib/gql'
import {
  DEVICE_DETAIL_QUERY,
  deviceDetailKey,
  type DeviceDetail,
  type DeviceDetailData,
  type DeviceDetailVars,
} from '@/lib/gql/queries/deviceDetail'
import {
  LIST_DEVICES_KEY,
  LIST_DEVICES_QUERY,
  LOCKED_STATE_ID,
  type ListDevicesData,
  type ListDevicesDevice,
  type ListDevicesVars,
} from '@/lib/gql/queries/listDevices'
import { createGqlStore, ENDPOINT } from '@/lib/gql/store'
import { TenantProvider, useTenantQuery } from '@/lib/tenant'
import { server } from '@/test/setup'
import { useDeviceAction, type RunnableAction } from './useDeviceAction'

const endpoint = graphql.link(ENDPOINT)

const DEVICE_ID = 'dev-0001'
const ACTIVE = { id: 2, name: 'ACTIVE' }
const BASELINE = { id: 'pol-1', name: 'Financing Baseline', color: 'green' }
const LOCK: RunnableAction = {
  id: 'act-lock',
  actionName: 'Lock device',
  policyName: 'Hard Lock',
  stateId: LOCKED_STATE_ID,
}
// The mock's own message for the one case where `assignAction` fails.
const REJECTED = 'Device is already locked (state transition rejected)'

const row: ListDevicesDevice = {
  id: DEVICE_ID,
  serialNumber: 'SN-0001-A',
  brandName: 'Samsung',
  modelMarketingName: 'Galaxy A15',
  lastCheckin: '2026-01-01T00:00:00.000Z',
  IMEIs: [{ imei: '350000000000001', isPrimary: true }],
  state: ACTIVE,
  policy: BASELINE,
}

const detail: DeviceDetail = {
  id: DEVICE_ID,
  serialNumber: 'SN-0001-A',
  deviceBrandName: 'Samsung',
  deviceModelMarketingName: 'Galaxy A15',
  imsi: null,
  locale: null,
  firstEnrollAt: null,
  IMEIs: [{ imei: '350000000000001', isPrimary: true }],
  state: ACTIVE,
  policy: BASELINE,
  lastCheckin: null,
}

/** A promise the test resolves by hand, so it decides exactly when a response is sent. */
function gate() {
  let open!: () => void
  const opened = new Promise<void>((resolve) => {
    open = resolve
  })
  return { open, opened }
}

/**
 * Shows the device the way `DeviceList` and the pullout do: the list and detail queries with the real
 * override holder on top, plus the action hook, so the test sees both places move and roll back together.
 */
function useDeviceRowAndDetail() {
  const { overrides, setOverride } = useDeviceOverrides()
  const list = useTenantQuery<ListDevicesData, ListDevicesVars>(LIST_DEVICES_QUERY, {
    variables: { page: 1, pageSize: 10 },
    fetchFirst: true,
    queryKey: LIST_DEVICES_KEY,
  })
  const panel = useTenantQuery<DeviceDetailData, DeviceDetailVars>(DEVICE_DETAIL_QUERY, {
    variables: { deviceId: DEVICE_ID },
    fetchFirst: true,
    queryKey: deviceDetailKey(DEVICE_ID),
  })
  const action = useDeviceAction(DEVICE_ID, setOverride)

  const confirmedRow = list.data?.listDevices?.deviceList?.find((device) => device?.id === DEVICE_ID)
  const confirmedDetail = panel.data?.deviceDetail

  return {
    row: confirmedRow && applyOverride(confirmedRow, overrides[DEVICE_ID]),
    detail: confirmedDetail && applyOverride(confirmedDetail, overrides[DEVICE_ID]),
    ...action,
  }
}

/** What the badges show: the device's state and policy. */
const shown = (device: Pick<DeviceDetail, 'state' | 'policy'> | null | undefined) =>
  device && { state: device.state, policy: device.policy }

describe('useDeviceAction', () => {
  it('rolls a failed lock back in both the row and the detail, and reports the error', async () => {
    const response = gate()
    server.use(
      endpoint.query('ListDevices', () =>
        HttpResponse.json({ data: { listDevices: { pageInfo: { total_count: 1 }, deviceList: [row] } } }),
      ),
      endpoint.query('DeviceDetail', () => HttpResponse.json({ data: { deviceDetail: detail } })),
      endpoint.mutation('AssignAction', async () => {
        await response.opened
        return HttpResponse.json({ errors: [{ message: REJECTED }] })
      }),
    )

    const store = createGqlStore()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GqlProvider store={store}>
        <TenantProvider>{children}</TenantProvider>
      </GqlProvider>
    )
    const { result } = renderHook(useDeviceRowAndDetail, { wrapper })

    const before = { state: ACTIVE, policy: BASELINE }
    await waitFor(() => {
      expect(shown(result.current.row)).toEqual(before)
      expect(shown(result.current.detail)).toEqual(before)
    })

    let running!: Promise<void>
    act(() => {
      running = result.current.run(LOCK)
    })

    // The server hasn't answered, so this can only be the optimistic update, applied in both places.
    const locked = overrideFor(LOCK)
    expect(shown(result.current.row)).toEqual(locked)
    expect(shown(result.current.detail)).toEqual(locked)
    expect(result.current.pending).toBe(LOCK)

    response.open()
    await act(() => running)

    expect(shown(result.current.row)).toEqual(before)
    expect(shown(result.current.detail)).toEqual(before)
    expect(result.current.pending).toBeNull()
    expect(result.current.error).toBe(`Couldn't complete "Lock device": ${REJECTED}`)
  })
})
