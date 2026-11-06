// Keyed by state, not device: the actions on offer depend only on the tenant and the device's current state.
export const availableActionsKey = (stateId: string) => `available-actions:${stateId}`;

export const LIST_AVAILABLE_ACTIONS_QUERY = /* GraphQL */ `
  query ListAvailableActions($tenantId: String, $stateId: String) {
    listAvailableActions(tenantId: $tenantId, stateId: $stateId) {
      id
      actionName
      policyName
      stateId
    }
  }
`;

export type ListAvailableActionsVars = {
  // The schema types this as a String, although `State.id` is an Int.
  stateId: string;
};

export type AvailableAction = {
  id: string;
  actionName: string | null;
  policyName: string | null;
  /** The state the device moves into when this action is assigned. */
  stateId: number | null;
};

export type ListAvailableActionsData = {
  listAvailableActions: (AvailableAction | null)[] | null;
};
