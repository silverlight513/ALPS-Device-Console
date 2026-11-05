// One label per device, covering all of its pages, so a lock can invalidate them together.
export const deviceHistoryKey = (deviceId: string) => `device-history:${deviceId}`;

export const LIST_DEVICE_HISTORY_QUERY = /* GraphQL */ `
  query ListDeviceHistory($tenantId: String!, $deviceId: String!, $page: Int, $pageSize: Int) {
    listDeviceHistory(tenantId: $tenantId, deviceId: $deviceId, page: $page, pageSize: $pageSize) {
      pageInfo {
        total_count
      }
      histories {
        type
        createdAt
        email
        policyName
        nextPolicyName
        actionName
      }
    }
  }
`;

export type ListDeviceHistoryVars = {
  deviceId: string;
  page?: number;
  pageSize?: number;
};

export type DeviceHistoryEntry = {
  type: string | null;
  createdAt: string | null;
  email: string | null;
  policyName: string | null;
  nextPolicyName: string | null;
  actionName: string | null;
};

export type ListDeviceHistoryData = {
  listDeviceHistory: {
    pageInfo: { total_count: number | null } | null;
    histories: (DeviceHistoryEntry | null)[] | null;
  } | null;
};
