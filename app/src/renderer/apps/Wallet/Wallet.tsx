import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  EthWalletType,
  TransactionType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { WalletFooter } from './components/WalletFooter/WalletFooter';
import { WalletHeader } from './components/WalletHeader/WalletHeader';
import { getTransactions } from './helpers';
import { walletScreens } from './screens/walletScreens';
import { WalletScreen } from './types';

const WalletPresenter = () => {
  const { walletStore } = useShipStore();

  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  useEffect(() => {
    for (const key of walletStore.currentStore.wallets.keys()) {
      const wallet = walletStore.currentStore.wallets.get(key);
      if (!wallet) continue;
      const walletTransactions = getTransactions(
        (walletStore.navState.network === NetworkType.ETHEREUM
          ? (wallet as EthWalletType).data.get(walletStore.navState.protocol)
              ?.transactionList.transactions
          : (wallet as BitcoinWalletType).transactionList.transactions) ||
          new Map()
      );
      if (walletStore.navState.network === NetworkType.ETHEREUM) {
        for (const key of walletStore.currentStore.wallets.keys()) {
          const coinKeys = (
            walletStore.currentStore.wallets.get(key) as EthWalletType
          ).data
            .get(walletStore.navState.protocol)
            ?.coins.keys();
          if (!coinKeys) continue;

          for (const coin of coinKeys) {
            const coinTransactions = (
              walletStore.currentStore.wallets.get(key) as EthWalletType
            ).data
              .get(walletStore.navState.protocol)
              ?.coins.get(coin)
              ?.transactionList.transactions.values();
            if (!coinTransactions) continue;
            setTransactions([...coinTransactions, ...transactions]);
          }
        }
      }
      setTransactions([...walletTransactions, ...transactions]);
    }
  }, [walletStore.currentStore.wallets]);

  const hideFooter = [
    WalletScreen.ONBOARDING,
    WalletScreen.LOCKED,
    WalletScreen.SETTINGS,
    WalletScreen.FORGOT_PASSCODE,
  ].includes(walletStore.navState.view);

  const hideHeader = [
    WalletScreen.LOCKED,
    WalletScreen.SETTINGS,
    WalletScreen.FORGOT_PASSCODE,
  ].includes(walletStore.navState.view);

  const walletScreenComponent =
    walletStore.navState.view === WalletScreen.TRANSACTION_CONFIRM
      ? WalletScreen.TRANSACTION_SEND
      : walletStore.navState.view;

  const CurrentWalletScreen = walletScreens[walletScreenComponent];

  return (
    <Flex
      flex={1}
      gap="inherit"
      minHeight={0}
      flexDirection="column"
      onClick={(e) => e.stopPropagation()}
    >
      {!hideHeader && (
        <WalletHeader
          isOnboarding={WalletScreen.ONBOARDING === walletStore.navState.view}
          showBack={walletStore.navState.view !== WalletScreen.LIST}
          network={
            walletStore.navState.network === 'ethereum' ? 'ethereum' : 'bitcoin'
          }
          onAddWallet={() => walletStore.navigate(WalletScreen.CREATE_WALLET)}
          onSetNetwork={(network) => walletStore.setNetwork(network)}
        />
      )}
      <CurrentWalletScreen network={walletStore.navState.network} />
      {!hideFooter && <WalletFooter />}
    </Flex>
  );
};

export const Wallet = observer(WalletPresenter);
