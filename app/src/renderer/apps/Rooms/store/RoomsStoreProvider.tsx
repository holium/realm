import { useMemo } from 'react';

import { RoomsStore } from './RoomsStore';
import { RoomsStoreContext } from './RoomsStoreContext';

type RoomsStoreProviderProps = {
  ourId: string;
  children: React.ReactNode;
};

export const RoomsStoreProvider = ({
  ourId,
  children,
}: RoomsStoreProviderProps) => {
  const roomsStore = useMemo(() => new RoomsStore(ourId), []);

  return (
    <RoomsStoreContext.Provider value={roomsStore}>
      {children}
    </RoomsStoreContext.Provider>
  );
};
