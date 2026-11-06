export const LIST_DEVICES_KEY = 'list-devices';

// The API has no query that lists states, so these mirror the backend's IDs.
export const DEVICE_STATES = [
  { id: 1, name: 'ENROLLED' },
  { id: 2, name: 'ACTIVE' },
  { id: 3, name: 'LOCKED' },
  { id: 4, name: 'RELEASED' },
] as const;

// Actions are matched by the state they move a device into, not by ID, which the spec says not to hardcode.
export const ACTIVE_STATE_ID = 2;
export const LOCKED_STATE_ID = 3;
export const RELEASED_STATE_ID = 4;

export const stateName = (stateId: number) => DEVICE_STATES.find((state) => state.id === stateId)?.name ?? null;

// `listDevices` ANDs `imei` and `serialNumber`, so sending the term as both would match almost
// nothing. Running one query per field can't work either, as the pages and totals can't be merged.
// All digits is treated as an IMEI. A serial fragment still works if it has a non-digit, e.g. `-0012`.
export function deviceSearchVariables(term: string): Pick<ListDevicesVars, 'imei' | 'serialNumber'> {
  if (!term) return {};
  return /^\d+$/.test(term) ? { imei: term } : { serialNumber: term };
}

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
