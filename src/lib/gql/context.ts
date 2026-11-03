import { createContext, useContext } from 'react';
import type { GqlStore } from './store';

export const GqlStoreContext = createContext<GqlStore | null>(null);

export function useGqlStore(): GqlStore {
  const store = useContext(GqlStoreContext);
  if (!store) throw new Error('useQuery must be used inside a GqlProvider');
  return store;
}
