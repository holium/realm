import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { LockedScreenBody } from './LockedScreenBody';

const LockedScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const unlock = () => {
    walletStore.navigateBack();
    walletStore.getWalletsUpdate();
    walletStore.watchUpdates();
  };

  return (
    <LockedScreenBody
      checkPasscode={walletStore.checkPasscode}
      onSuccess={unlock}
    />
  );
};

export const LockedScreen = observer(LockedScreenPresenter);
