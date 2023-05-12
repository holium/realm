import { createContext, ReactNode, useContext, useState } from 'react';

import { SpaceKeys } from '../types';

type SpaceContextType = {
  space: SpaceKeys;
  setSpace: (space: SpaceKeys) => void;
};

const SpaceContext = createContext<SpaceContextType>({} as any);

export const SpaceProvider = ({ children }: { children: ReactNode }) => {
  const [space, setSpace] = useState<SpaceKeys>('spacebros');

  return (
    <SpaceContext.Provider value={{ space, setSpace }}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => useContext(SpaceContext);
