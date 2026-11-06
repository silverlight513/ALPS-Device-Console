import { useId, useLayoutEffect, useRef, type KeyboardEvent, type Ref } from 'react'
import { createPortal } from 'react-dom'

import RetryButton from '@/components/RetryButton'
import { applyOverride, type DeviceOverride, type SetDeviceOverride } from '@/lib/devices/overrides'
import {
  DEVICE_DETAIL_QUERY,
  deviceDetailKey,
  type DeviceDetailData,
  type DeviceDetailVars,
} from '@/lib/gql/queries/deviceDetail'
import { useTenantQuery } from '@/lib/tenant'
import DeviceActions from './DeviceActions'
import DeviceDetailsList from './DeviceDetailsList'
import DeviceHistory from './DeviceHistory'
import * as S from './styles'
import { useDeviceAction } from './useDeviceAction'

type DevicePulloutProps = {
  deviceId: string
  onClose: () => void
  /** Set while an action on this device is waiting for the server. */
  override: DeviceOverride | undefined
  setOverride: SetDeviceOverride
  ref?: Ref<HTMLElement>
}

function DevicePullout({ deviceId, onClose, override, setOverride, ref }: DevicePulloutProps) {
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

  const confirmedDevice = data?.deviceDetail ?? null
  const device = confirmedDevice && applyOverride(confirmedDevice, override)

  const { run, pending, error: actionError } = useDeviceAction(deviceId, setOverride)

  // A running action can't be left, so its result, and especially a failure, is always seen.
  const close = () => {
    if (!pending) onClose()
  }
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
    if (event.key === 'Escape') close()
  }

  // Portalled to `body`, outside `#root`, so it stays usable while the rest of the app is inert.
  return createPortal(
    <>
      <S.Backdrop onClick={close} />
      <S.Panel ref={ref} tabIndex={-1} aria-labelledby={titleId} onKeyDown={handleKeyDown}>
        <S.Header>
          <S.Title ref={titleRef} id={titleId} tabIndex={-1}>{device?.serialNumber ?? deviceId}</S.Title>
          <S.CloseButton type="button" aria-disabled={pending !== null} onClick={close}>
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
        <DeviceActions
          state={confirmedDevice?.state}
          stateLoading={loading}
          pending={pending}
          error={actionError}
          onRun={(action) => void run(action)}
        />
        <DeviceHistory deviceId={deviceId} />
      </S.Panel>
    </>,
    document.body,
  )
}

export default DevicePullout
