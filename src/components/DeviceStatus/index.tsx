import * as S from './styles'

// The API also sends `policy.color`, but those colours aren't readable as text on this theme.
const POLICY_TONES: Record<string, S.PolicyTone> = {
  'pol-1': 'success',
  'pol-2': 'warning',
  'pol-3': 'danger',
}

export function DeviceState({ state }: { state: { name: string | null } | null }) {
  return (
    <S.State>
      <S.StateDot $state={state?.name ?? null} />
      {state?.name ?? 'UNKNOWN'}
    </S.State>
  )
}

type DevicePolicyProps = {
  policy: { id: string; name: string | null }
  className?: string
}

export function DevicePolicy({ policy, className }: DevicePolicyProps) {
  return (
    <S.Policy className={className} $tone={POLICY_TONES[policy.id] ?? 'neutral'}>
      {policy.name ?? 'Unknown policy'}
    </S.Policy>
  )
}
