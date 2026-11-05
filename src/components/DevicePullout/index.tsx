import { useId, useRef, type KeyboardEvent, type Ref } from 'react'

import RetryButton from '@/components/RetryButton'
import {
  DEVICE_DETAIL_QUERY,
  deviceDetailKey,
  type DeviceDetailData,
  type DeviceDetailVars,
} from '@/lib/gql/queries/deviceDetail'
import { useTenantQuery } from '@/lib/tenant'
import DeviceDetailsList from './DeviceDetailsList'
import DeviceHistory from './DeviceHistory'
import * as S from './styles'

type DevicePulloutProps = {
  deviceId: string
  onClose: () => void
  ref?: Ref<HTMLElement>
}

function DevicePullout({ deviceId, onClose, ref }: DevicePulloutProps) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)

  const { data, loading, errors, refetch } = useTenantQuery<DeviceDetailData, DeviceDetailVars>(
    DEVICE_DETAIL_QUERY,
    {
      variables: { deviceId },
      fetchFirst: true,
      queryKey: deviceDetailKey(deviceId),
    },
  )

  const device = data?.deviceDetail ?? null
  const errorText = errors.join('; ')

  // Handled here rather than on the document, so Esc in the tenant dropdown can't also close the panel.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
  }

  return (
    <S.Panel ref={ref} tabIndex={-1} aria-labelledby={titleId} onKeyDown={handleKeyDown}>
      <S.Header>
        <S.Title ref={titleRef} id={titleId} tabIndex={-1}>{device?.serialNumber ?? deviceId}</S.Title>
        <S.CloseButton type="button" onClick={onClose}>
          Close
        </S.CloseButton>
      </S.Header>
      <S.Section>
        {device && errorText && (
          <S.Warning role="alert">Some details may be missing or out of date: {errorText}</S.Warning>
        )}
        {!device && errorText && <S.ErrorMessage role="alert">{errorText}</S.ErrorMessage>}
        {errorText && <RetryButton retrying={loading} onRetry={() => void refetch()} focusAfterRef={titleRef} />}
        {!device && !errorText && loading && <S.Message>Loading device…</S.Message>}
        {!device && !errorText && !loading && <S.Message>Device not found.</S.Message>}
        {device && <DeviceDetailsList device={device} />}
      </S.Section>
      <DeviceHistory deviceId={deviceId} />
    </S.Panel>
  )
}

export default DevicePullout
