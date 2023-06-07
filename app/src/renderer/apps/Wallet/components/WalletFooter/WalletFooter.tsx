import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../types';
import { WalletFooterView } from './WalletFooterView';

export const WalletFooterPresenter = () => {
  const { walletStore } = useShipStore();

  return (
    <WalletFooterView
      protocol={walletStore.navState.protocol}
      onClickSettings={() => walletStore.navigate(WalletScreen.SETTINGS)}
    />
  );
};

export const WalletFooter = observer(WalletFooterPresenter);
