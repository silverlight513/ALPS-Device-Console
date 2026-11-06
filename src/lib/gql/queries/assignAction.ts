export const ASSIGN_ACTION_MUTATION = /* GraphQL */ `
  mutation AssignAction($tenantId: String!, $deviceId: String!, $actionId: String!) {
    assignAction(tenantId: $tenantId, deviceId: $deviceId, actionId: $actionId)
  }
`;

export type AssignActionVars = {
  deviceId: string;
  actionId: string;
};

export type AssignActionData = {
  assignAction: boolean | null;
};
