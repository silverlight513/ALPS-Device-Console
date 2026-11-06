import type { AvailableAction } from '@/lib/gql/queries/listAvailableActions'
import { stateName } from '@/lib/gql/queries/listDevices'

/**
 * What a device is shown as while an action on it is waiting for the server. It sits on top of the
 * query data rather than being written into the cache, so a rollback is just removing it.
 */
export type DeviceOverride = {
  state: { id: number; name: string | null }
  policy: { id: string; name: string | null; color: string | null }
}

export type SetDeviceOverride = (deviceId: string, override: DeviceOverride | null) => void

// An action names its policy but doesn't give its ID, which is what picks the badge's tone.
// This ID matches no tone, so the badge is neutral until the confirmed policy arrives.
const UNCONFIRMED_POLICY_ID = 'unconfirmed'

export function overrideFor(action: AvailableAction & { stateId: number }): DeviceOverride {
  return {
    state: { id: action.stateId, name: stateName(action.stateId) },
    policy: { id: UNCONFIRMED_POLICY_ID, name: action.policyName, color: null },
  }
}

type DeviceShape = {
  state: DeviceOverride['state'] | null
  policy: DeviceOverride['policy'] | null
}

export function applyOverride<T extends DeviceShape>(device: T, override: DeviceOverride | undefined): T {
  return override ? { ...device, state: override.state, policy: override.policy } : device
}
