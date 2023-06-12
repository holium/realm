import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../../types';
import { WalletListScreenBody, WalletWithKey } from './WalletListScreenBody';

export const WalletListScreenPresenter = () => {
  const { walletStore } = useShipStore();
  const wallets = walletStore.currentStore.list;

  const fetchedWallets = wallets
    .map((wallet) => ({
      key: wallet.key,
      ...walletStore.currentStore.wallets.get(wallet.key),
    }))
    .filter((wallet) => wallet) as WalletWithKey[];

  return (
    <WalletListScreenBody
      wallets={fetchedWallets}
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
