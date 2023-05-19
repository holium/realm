import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../types';
import { LockedScreenBody } from './LockedScreenBody';

const LockedScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const unlock = () => {
    walletStore.navigate(WalletScreen.LIST);
    walletStore.getWalletsUpdate();
    walletStore.watchUpdates();
  };

  return (
    <LockedScreenBody
      onClickForgotPasscode={() =>
        walletStore.navigate(WalletScreen.FORGOT_PASSCODE)
      }
      checkPasscode={walletStore.checkPasscode}
      onSuccess={unlock}
    />
  );
};

export const LockedScreen = observer(LockedScreenPresenter);
