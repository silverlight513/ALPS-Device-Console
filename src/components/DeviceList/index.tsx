import { useQuery } from '@/lib/gql'
import {
  LIST_DEVICES_KEY,
  LIST_DEVICES_QUERY,
  type ListDevicesData,
  type ListDevicesVars,
} from '@/lib/gql/queries/listDevices'
import { useTenantQuery } from '@/lib/tenant'

const DEFAULT_PAGE_SIZE = 10

function DeviceList() {
  const tenant = useTenantQuery()

  const { data, loading, errors } = useQuery<ListDevicesData, ListDevicesVars>(LIST_DEVICES_QUERY, {
    variables: {
      tenantId: tenant.id,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    fetchFirst: true,
    queryKey: LIST_DEVICES_KEY,
  })

  if (errors.length > 0) return <p role="alert">{errors.join('; ')}</p>
  if (loading) return <p>Loading devices…</p>

  const devices = data?.listDevices?.deviceList?.filter((device) => device !== null) ?? []
  if (devices.length === 0) return <p>No devices found.</p>

  return (
    <ul>
      {devices.map((device) => (
        <li key={device.id}>{device.serialNumber ?? device.id}</li>
      ))}
    </ul>
  )
}

export default DeviceList
