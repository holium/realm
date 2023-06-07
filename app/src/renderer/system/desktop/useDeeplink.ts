import { useEffect } from 'react';

import { useShipStore } from 'renderer/stores/ship.store';

export const useDeeplink = () => {
  const { spacesStore } = useShipStore();

  useEffect(() => {
    window.electron.app.onJoinSpace((spacePath: string) => {
      spacesStore
        .joinSpace(spacePath)
        .then(() => spacesStore.selectSpace(spacePath))
        .catch((err) => console.error(err));
    });

    return () => {
      window.electron.app.removeOnJoinSpace();
    };
  });
};
