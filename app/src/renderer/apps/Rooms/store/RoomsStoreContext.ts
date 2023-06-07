import React, { useContext } from 'react';

import { RoomsStore } from './RoomsStore';

export const RoomsStoreContext = React.createContext<RoomsStore | null>(null);

export function useRoomsStore(): RoomsStore {
  const store = useContext(RoomsStoreContext);
  if (!store) {
    // this is especially useful in TypeScript so you don't need to check for null all the time
    throw new Error('useRoomsStore must be used within a RoomsStoreProvider.');
  }
  return store;
}
