import { useTenant } from "@/lib/tenant";
import DeviceList from "../DeviceList";

// NOTE: This component is an abstraction wrapper so that we can remount the device list based off tenant id using the key prop

function DevicesPageContent() {
  const { tenantId } = useTenant()
  return <DeviceList key={tenantId} />
}

export default DevicesPageContent;