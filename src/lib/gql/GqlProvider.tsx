import type { ReactNode } from 'react';
import { GqlStoreContext } from './context';
import { gqlStore, type GqlStore } from './store';

export function GqlProvider({
  children,
  store = gqlStore,
}: {
  children: ReactNode;
  store?: GqlStore;
}) {
  return <GqlStoreContext.Provider value={store}>{children}</GqlStoreContext.Provider>;
}
