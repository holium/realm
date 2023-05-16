import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../types';
import { WalletListScreenBody } from './WalletListScreenBody';

export const WalletListScreenPresenter = () => {
  const { walletStore } = useShipStore();

  return (
    <WalletListScreenBody
      wallets={walletStore.currentStore.list as any}
      network={walletStore.navState.network}
      protocol={walletStore.navState.protocol}
      btcNetwork={walletStore.navState.btcNetwork}
      onSelectAddress={(walletIndex) =>
        walletStore.navigate(WalletScreen.WALLET_DETAIL, { walletIndex })
      }
      onClickCreateAddress={() =>
        walletStore.navigate(WalletScreen.CREATE_WALLET)
      }
    />
  );
};

export const WalletListScreen = observer(WalletListScreenPresenter);
