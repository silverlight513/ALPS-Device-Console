import { useId, type KeyboardEvent, type Ref } from 'react'

import { DevicePolicy, DeviceState } from '@/components/DeviceStatus'
import {
  DEVICE_DETAIL_QUERY,
  deviceDetailKey,
  type DeviceDetail,
  type DeviceDetailData,
  type DeviceDetailVars,
} from '@/lib/gql/queries/deviceDetail'
import { useTenantQuery } from '@/lib/tenant'
import DeviceHistory from './DeviceHistory'
import * as S from './styles'

const UNAVAILABLE = 'Unavailable'

const formatDate = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleString() : UNAVAILABLE

type DevicePulloutProps = {
  deviceId: string
  onClose: () => void
  ref?: Ref<HTMLElement>
}

function DeviceFields({ device }: { device: DeviceDetail }) {
  const model = [device.deviceBrandName, device.deviceModelMarketingName].filter(Boolean).join(' ')
  const imeis = device.IMEIs?.filter((imei) => imei !== null) ?? []

  return (
    <S.Fields>
      <S.Label>Serial number</S.Label>
      <S.Value>{device.serialNumber ?? UNAVAILABLE}</S.Value>

      <S.Label>Model</S.Label>
      <S.Value>{model || UNAVAILABLE}</S.Value>

      <S.Label>IMEIs</S.Label>
      <S.Value>
        {imeis.length === 0 && UNAVAILABLE}
        {imeis.map((imei) => (
          <div key={imei.imei}>
            {imei.imei ?? UNAVAILABLE}
            {imei.isPrimary && ' (primary)'}
          </div>
        ))}
      </S.Value>

      <S.Label>IMSI</S.Label>
      <S.Value>{device.imsi ?? UNAVAILABLE}</S.Value>

      <S.Label>Locale</S.Label>
      <S.Value>{device.locale ?? UNAVAILABLE}</S.Value>

      <S.Label>State</S.Label>
      <S.Value>{device.state ? <DeviceState state={device.state} /> : UNAVAILABLE}</S.Value>

      <S.Label>Policy</S.Label>
      <S.Value>{device.policy ? <DevicePolicy policy={device.policy} /> : UNAVAILABLE}</S.Value>

      <S.Label>{device.lastCheckin?.label ?? 'Last check-in'}</S.Label>
      <S.Value>{formatDate(device.lastCheckin?.date)}</S.Value>

      <S.Label>First enrolled</S.Label>
      <S.Value>{formatDate(device.firstEnrollAt)}</S.Value>
    </S.Fields>
  )
}

function DevicePullout({ deviceId, onClose, ref }: DevicePulloutProps) {
  const titleId = useId()

  const { data, loading, errors } = useTenantQuery<DeviceDetailData, DeviceDetailVars>(
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
        <S.Title id={titleId}>{device?.serialNumber ?? deviceId}</S.Title>
        <S.CloseButton type="button" onClick={onClose}>
          Close
        </S.CloseButton>
      </S.Header>
      <S.Section>
        {/* A partial response still has a usable device, so the errors sit beside it rather than replacing it. */}
        {device && errorText && (
          <S.Warning role="alert">Some details may be missing or out of date: {errorText}</S.Warning>
        )}
        {!device && errorText && <S.ErrorMessage role="alert">{errorText}</S.ErrorMessage>}
        {!device && !errorText && loading && <S.Message>Loading device…</S.Message>}
        {!device && !errorText && !loading && <S.Message>Device not found.</S.Message>}
        {device && <DeviceFields device={device} />}
      </S.Section>
      <DeviceHistory deviceId={deviceId} />
    </S.Panel>
  )
}

export default DevicePullout
