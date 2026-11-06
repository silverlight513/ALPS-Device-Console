import { useId, useRef } from 'react'

import RetryButton from '@/components/RetryButton'
import type { DeviceDetail } from '@/lib/gql/queries/deviceDetail'
import {
  LIST_AVAILABLE_ACTIONS_QUERY,
  availableActionsKey,
  type AvailableAction,
  type ListAvailableActionsData,
  type ListAvailableActionsVars,
} from '@/lib/gql/queries/listAvailableActions'
import { ACTIVE_STATE_ID, LOCKED_STATE_ID } from '@/lib/gql/queries/listDevices'
import { useTenantQuery } from '@/lib/tenant'
import { actionLabel, type RunnableAction } from '../useDeviceAction'
import { ErrorMessage, Section } from '../styles'
import * as S from './styles'

type DeviceActionsProps = {
  /** The confirmed state from the detail data, never the override, so a rollback doesn't refetch the actions. */
  state: DeviceDetail['state'] | undefined
  /** True while the device detail, which supplies the state, is loading. */
  stateLoading: boolean
  pending: RunnableAction | null
  error: string | null
  onRun: (action: RunnableAction) => void
}

// Colour follows where an action takes the device, so a new action from the server still gets a sensible tone.
const TONES: Record<number, S.ActionTone> = {
  [LOCKED_STATE_ID]: 'danger',
  [ACTIVE_STATE_ID]: 'accent',
}

// An action without a target state can't be shown optimistically, so it isn't offered.
function runnable(actions: (AvailableAction | null)[] | null | undefined): RunnableAction[] {
  return (actions ?? []).flatMap((action) => (action?.stateId != null ? [{ ...action, stateId: action.stateId }] : []))
}

function DeviceActions({ state, stateLoading, pending, error, onRun }: DeviceActionsProps) {
  const headingId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The actions depend on the device's current state, so this can only run once the detail has one.
  const stateId = state ? String(state.id) : null

  const { data, loading, errors, refetch } = useTenantQuery<ListAvailableActionsData, ListAvailableActionsVars>(
    LIST_AVAILABLE_ACTIONS_QUERY,
    {
      variables: { stateId: stateId ?? '' },
      fetchFirst: stateId !== null,
      queryKey: stateId !== null ? availableActionsKey(stateId) : undefined,
    },
  )

  // `listAvailableActions` alone decides what can be done: one button per action it returns, none hardcoded.
  const actions = runnable(data?.listAvailableActions)
  const errorText = errors.join('; ')
  // Only one action runs at a time, so every button waits while one is pending.
  const enabled = pending === null

  let reason: string | null = null
  if (stateId === null) {
    reason = stateLoading ? 'Checking available actions…' : 'Device state unavailable'
  } else if (!data) {
    reason = errorText ? "Couldn't load available actions" : 'Checking available actions…'
  } else if (actions.length === 0) {
    reason = `No actions available for a ${state?.name} device`
  }

  return (
    <Section aria-labelledby={headingId}>
      <S.Heading ref={headingRef} id={headingId} tabIndex={-1}>
        Actions
      </S.Heading>
      {actions.length > 0 && (
        <S.ButtonRow>
          {actions.map((action) => {
            const label = actionLabel(action)
            return (
              // `aria-disabled` rather than `disabled`, so keyboard users can still reach it while another action runs.
              <S.ActionButton
                key={action.id}
                type="button"
                $tone={TONES[action.stateId] ?? 'neutral'}
                aria-disabled={!enabled}
                onClick={() => {
                  if (enabled) onRun(action)
                }}
              >
                {pending?.id === action.id ? `${label}…` : label}
              </S.ActionButton>
            )
          })}
        </S.ButtonRow>
      )}
      {reason && <S.Reason>{reason}</S.Reason>}
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {errorText && (
        <>
          <ErrorMessage role="alert">{errorText}</ErrorMessage>
          <RetryButton retrying={loading} onRetry={() => void refetch()} focusAfterRef={headingRef} />
        </>
      )}
    </Section>
  )
}

export default DeviceActions
