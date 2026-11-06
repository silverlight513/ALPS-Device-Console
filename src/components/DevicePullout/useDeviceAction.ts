import { useState } from 'react'

import { overrideFor, type SetDeviceOverride } from '@/lib/devices/overrides'
import { GraphQLRequestError, useGqlStore } from '@/lib/gql'
import { ASSIGN_ACTION_MUTATION, type AssignActionData, type AssignActionVars } from '@/lib/gql/queries/assignAction'
import { deviceDetailKey, type DeviceDetailData } from '@/lib/gql/queries/deviceDetail'
import type { AvailableAction } from '@/lib/gql/queries/listAvailableActions'
import { deviceHistoryKey } from '@/lib/gql/queries/listDeviceHistory'
import {
  LIST_DEVICES_KEY,
  stateName,
  type ListDevicesData,
  type ListDevicesDevice,
} from '@/lib/gql/queries/listDevices'
import { useTenantMutation } from '@/lib/tenant'

export type RunnableAction = AvailableAction & { stateId: number }

// The server names its actions, so no action needs its own wording here. An unnamed one is described by where it goes.
export const actionLabel = (action: RunnableAction) => action.actionName ?? `Move to ${stateName(action.stateId)}`

type ConfirmedFields = Pick<ListDevicesDevice, 'state' | 'policy'> & Partial<Pick<ListDevicesDevice, 'lastCheckin'>>

/**
 * Runs an action on a device: shows the result straight away through the override, then either confirms
 * it into the cache or rolls it back. Only one action runs at a time, because the buttons are disabled
 * while one is pending.
 */
export function useDeviceAction(deviceId: string, setOverride: SetDeviceOverride) {
  const store = useGqlStore()
  const [pending, setPending] = useState<RunnableAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { mutateData } = useTenantMutation<AssignActionData, AssignActionVars>(ASSIGN_ACTION_MUTATION, {
    throwError: true,
  })

  // Targeted: only the list entries holding this device change, and none of them are refetched.
  const writeToList = (fields: ConfirmedFields) => {
    store.update(LIST_DEVICES_KEY, (data) => {
      const list = (data as ListDevicesData).listDevices
      if (!list?.deviceList) return data
      return {
        listDevices: {
          ...list,
          deviceList: list.deviceList.map((device) => (device?.id === deviceId ? { ...device, ...fields } : device)),
        },
      } satisfies ListDevicesData
    })
  }

  const run = async (action: RunnableAction) => {
    // TODO: a real console should ask for confirmation before a release or a lock, both of which affect
    // the customer's handset. The optimistic update would then start after the confirmation.
    const override = overrideFor(action)
    setPending(action)
    setError(null)
    setOverride(deviceId, override)

    try {
      const result = await mutateData({ deviceId, actionId: action.id })
      if (result?.assignAction !== true) throw new Error("the server didn't apply the change")
    } catch (caught) {
      setOverride(deviceId, null)
      setPending(null)
      const message = caught instanceof GraphQLRequestError ? caught.errors.join('; ') : String((caught as Error).message)
      setError(`Couldn't complete "${actionLabel(action)}": ${message}`)
      return
    }

    // The history only needs to reload. It isn't awaited, so a slow history doesn't hold up the panel.
    void store.refresh(deviceHistoryKey(deviceId))
    await store.refresh(deviceDetailKey(deviceId))

    const [detailEntry] = store.entriesFor(deviceDetailKey(deviceId))
    const confirmed = (detailEntry?.data as DeviceDetailData | undefined)?.deviceDetail
    if (detailEntry && detailEntry.errors.length === 0 && confirmed?.state && confirmed.policy) {
      writeToList({ state: confirmed.state, policy: confirmed.policy, lastCheckin: confirmed.lastCheckin?.date ?? null })
    } else {
      // The action did happen, so the screen shouldn't go back to the old state because the reload failed.
      // The detail keeps its error and Retry, and isn't fresh, so it reloads next time it's opened.
      writeToList(override)
      store.update(deviceDetailKey(deviceId), (data) => {
        const detail = (data as DeviceDetailData).deviceDetail
        return { deviceDetail: detail && { ...detail, ...override } } satisfies DeviceDetailData
      })
    }

    setOverride(deviceId, null)
    setPending(null)
  }

  return { run, pending, error }
}
