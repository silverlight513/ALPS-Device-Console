import { DevicePolicy, DeviceState } from '@/components/DeviceStatus'
import { UNAVAILABLE, formatDate } from '@/lib/format'
import type { DeviceDetail } from '@/lib/gql/queries/deviceDetail'
import * as S from './styles'

function DeviceDetailsList({ device }: { device: DeviceDetail }) {
  const model = [device.deviceBrandName, device.deviceModelMarketingName].filter(Boolean).join(' ')
  const imeis = device.IMEIs?.filter((imei) => imei !== null) ?? []

  return (
    <S.List>
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
    </S.List>
  )
}

export default DeviceDetailsList
