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
import { ACTIVE_STATE_ID, LOCKED_STATE_ID, RELEASED_STATE_ID } from '@/lib/gql/queries/listDevices'
import { useTenantQuery } from '@/lib/tenant'
import { actionVerb, type RunnableAction } from '../useDeviceAction'
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

const PENDING_LABELS: Record<string, string> = {
  lock: 'Locking…',
  unlock: 'Unlocking…',
  release: 'Releasing…',
}

function findAction(actions: (AvailableAction | null)[] | undefined, stateId: number): RunnableAction | null {
  const action = actions?.find((candidate) => candidate?.stateId === stateId)
  return action ? { ...action, stateId } : null
}

function DeviceActions({ state, stateLoading, pending, error, onRun }: DeviceActionsProps) {
  const headingId = useId()
  const commonReasonId = useId()
  const toggleReasonId = useId()
  const releaseReasonId = useId()
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

  // `listAvailableActions` is the only thing that decides what can be done, including Lock or Unlock.
  const actions = data?.listAvailableActions ?? undefined
  const lockAction = findAction(actions, LOCKED_STATE_ID)
  const unlockAction = findAction(actions, ACTIVE_STATE_ID)
  const releaseAction = findAction(actions, RELEASED_STATE_ID)
  const toggleAction = lockAction ?? unlockAction

  const isLocked = state?.id === LOCKED_STATE_ID
  // With nothing to name it, the label follows the device's state, so a LOCKED device never reads "Lock".
  const toggleIsUnlock = toggleAction ? toggleAction === unlockAction : isLocked
  const errorText = errors.join('; ')

  let commonReason: string | null = null
  if (stateId === null) {
    commonReason = stateLoading ? 'Checking available actions…' : 'Device state unavailable'
  } else if (!data) {
    commonReason = errorText ? "Couldn't load available actions" : 'Checking available actions…'
  }

  const unavailable = (verb: string, alreadyIn: boolean) =>
    alreadyIn ? `Can't ${verb}: device is already ${state?.name}` : `Can't ${verb}: not available for a ${state?.name ?? 'device in this'} state`

  const toggleReason =
    !commonReason && !toggleAction ? unavailable(toggleIsUnlock ? 'unlock' : 'lock', isLocked && !toggleIsUnlock) : null
  const releaseReason =
    !commonReason && !releaseAction ? unavailable('release', state?.id === RELEASED_STATE_ID) : null

  const renderButton = (
    action: RunnableAction | null,
    fallbackLabel: string,
    reasonId: string,
    reason: string | null,
    tone: S.ActionTone,
  ) => {
    const enabled = action !== null && pending === null
    const isPending = pending !== null && pending.id === action?.id
    const describedBy = [commonReason && commonReasonId, reason && reasonId].filter(Boolean).join(' ')
    return (
      // `aria-disabled` rather than `disabled`, so keyboard and screen reader users can still reach it and hear why.
      <S.ActionButton
        type="button"
        $tone={tone}
        aria-disabled={!enabled}
        aria-describedby={describedBy || undefined}
        onClick={() => {
          if (enabled) onRun(action)
        }}
      >
        {isPending ? PENDING_LABELS[actionVerb(action)] : (action?.actionName ?? fallbackLabel)}
      </S.ActionButton>
    )
  }

  return (
    <Section aria-labelledby={headingId}>
      <S.Heading ref={headingRef} id={headingId} tabIndex={-1}>
        Actions
      </S.Heading>
      <S.ButtonRow>
        {renderButton(
          toggleAction,
          toggleIsUnlock ? 'Unlock device' : 'Lock device',
          toggleReasonId,
          toggleReason,
          toggleIsUnlock ? 'unlock' : 'lock',
        )}
        {renderButton(releaseAction, 'Release device', releaseReasonId, releaseReason, 'release')}
      </S.ButtonRow>
      {commonReason && <S.Reason id={commonReasonId}>{commonReason}</S.Reason>}
      {toggleReason && <S.Reason id={toggleReasonId}>{toggleReason}</S.Reason>}
      {releaseReason && <S.Reason id={releaseReasonId}>{releaseReason}</S.Reason>}
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
