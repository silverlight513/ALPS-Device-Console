export const LIST_DEVICES_KEY = 'list-devices';

export const LIST_DEVICES_QUERY = /* GraphQL */ `
  query ListDevices(
    $tenantId: String!
    $imei: String
    $serialNumber: String
    $stateId: Int
    $page: Int
    $pageSize: Int
  ) {
    listDevices(
      tenantId: $tenantId
      imei: $imei
      serialNumber: $serialNumber
      stateId: $stateId
      page: $page
      pageSize: $pageSize
    ) {
      pageInfo {
        total_count
      }
      deviceList {
        id
        serialNumber
        brandName
        modelMarketingName
        lastCheckin
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
      }
    }
  }
`;

export type ListDevicesVars = {
  tenantId: string;
  imei?: string;
  serialNumber?: string;
  stateId?: number;
  page?: number;
  pageSize?: number;
};

export type ListDevicesDevice = {
  id: string;
  serialNumber: string | null;
  brandName: string | null;
  modelMarketingName: string | null;
  lastCheckin: string | null;
  IMEIs: ({ imei: string | null; isPrimary: boolean | null } | null)[] | null;
  state: { id: number; name: string | null } | null;
  policy: { id: string; name: string | null; color: string | null };
};

export type ListDevicesData = {
  listDevices: {
    pageInfo: { total_count: number | null } | null;
    deviceList: (ListDevicesDevice | null)[] | null;
  } | null;
};
