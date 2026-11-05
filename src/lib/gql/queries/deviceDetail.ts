export const deviceDetailKey = (deviceId: string) => `device-detail:${deviceId}`;

export const DEVICE_DETAIL_QUERY = /* GraphQL */ `
  query DeviceDetail($tenantId: String!, $deviceId: String!) {
    deviceDetail(tenantId: $tenantId, deviceId: $deviceId) {
      id
      serialNumber
      deviceBrandName
      deviceModelMarketingName
      imsi
      locale
      firstEnrollAt
      IMEIs {
        imei
        isPrimary
      }
      state {
        id
        name
      }
      policy {
        id
        name
        color
      }
      lastCheckin {
        label
        date
        color
      }
    }
  }
`;

export type DeviceDetailVars = {
  deviceId: string;
};

export type DeviceDetail = {
  id: string;
  serialNumber: string | null;
  deviceBrandName: string | null;
  deviceModelMarketingName: string | null;
  imsi: string | null;
  locale: string | null;
  firstEnrollAt: string | null;
  IMEIs: ({ imei: string | null; isPrimary: boolean | null } | null)[] | null;
  state: { id: number; name: string | null } | null;
  policy: { id: string; name: string | null; color: string | null } | null;
  lastCheckin: { label: string | null; date: string | null; color: string | null } | null;
};

export type DeviceDetailData = {
  deviceDetail: DeviceDetail | null;
};
