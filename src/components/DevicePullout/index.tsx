import { useId, useLayoutEffect, useRef, type KeyboardEvent, type Ref } from 'react'
import { createPortal } from 'react-dom'

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

  // The rest of the app can't be clicked, tabbed to or scrolled while the pullout is open, so nothing
  // behind it (tenant, paging, filters) can change under it. A layout effect, so that this is applied
  // and removed in the same commit as the pullout, before `DeviceList` moves focus in or out of it.
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    root?.setAttribute('inert', '')
    html.style.overflow = 'hidden'
    return () => {
      root?.removeAttribute('inert')
      html.style.overflow = ''
    }
  }, [])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
  }

  // Portalled to `body`, outside `#root`, so it stays usable while the rest of the app is inert.
  return createPortal(
    <>
      <S.Backdrop onClick={onClose} />
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
    </>,
    document.body,
  )
}

export default DevicePullout
