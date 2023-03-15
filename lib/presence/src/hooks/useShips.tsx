import { useEffect, useState } from 'react';

// TODO.
export const useShips = () => {
  const ships = useState<string[]>(['~zod', '~nus']);

  useEffect(() => {
    // window.electron.multiplayer.onMouseMove((patp, elementId) => {
    //   if (elementId === id) onPlayerClick(patp);
    // });
  }, []);

  return ships[0];
};
