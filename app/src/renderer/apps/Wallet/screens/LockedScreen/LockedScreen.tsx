import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../types';
import { LockedScreenBody } from './LockedScreenBody';

const LockedScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const unlock = async () => {
    await walletStore.getWalletsUpdate();
    await walletStore.watchUpdates();

    walletStore.navigate(WalletScreen.LIST);
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
