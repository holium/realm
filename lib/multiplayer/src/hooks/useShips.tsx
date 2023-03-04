import { useEffect, useState } from 'react';

export const useShips = () => {
  const ships = useState<string[]>(['~zod', '~nus']);

  useEffect(() => {
    // window.electron.multiplayer.onMouseMove((patp, elementId) => {
    //   if (elementId === id) onOtherClick(patp);
    // });
  }, []);

  return ships[0];
};
