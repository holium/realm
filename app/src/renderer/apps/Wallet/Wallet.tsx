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

import { PendingTransactionDisplay } from './components/Transaction/PendingTransactionDisplay';
import { WalletFooter } from './components/WalletFooter/WalletFooter';
import { WalletHeader } from './components/WalletHeader/WalletHeader';
import { getTransactions } from './helpers';
import { walletScreens } from './screens/walletScreens';
import { WalletScreen } from './types';

const WalletPresenter = () => {
  const [hidePending, setHidePending] = useState(true);

  const { walletStore } = useShipStore();

  let transactions: TransactionType[] = [];

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
          transactions = [...coinTransactions, ...transactions];
        }
      }
    }
    transactions = [...walletTransactions, ...transactions];
  }
  const pending = transactions.filter((tx) => tx.status === 'pending').length;

  useEffect(() => {
    if (pending > 0) {
      setHidePending(false);
    }
    if (pending === 0 && !hidePending) {
      setHidePending(true);
    }
  }, [pending]);

  const hide = () => {
    setHidePending(true);
  };

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

  const pendingIsVisible = [
    WalletScreen.LIST,
    WalletScreen.WALLET_DETAIL,
    WalletScreen.TRANSACTION_DETAIL,
    WalletScreen.NFT_DETAIL,
  ].includes(walletStore.navState.view);

  const walletScreenComponent =
    walletStore.navState.view === WalletScreen.TRANSACTION_CONFIRM
      ? WalletScreen.TRANSACTION_SEND
      : walletStore.navState.view;

  const WalletScreenCurrent = walletScreens[walletScreenComponent];

  return (
    <Flex
      flex={1}
      gap="inherit"
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
      {pendingIsVisible &&
        !hidePending &&
        walletStore.navState.view !== WalletScreen.TRANSACTION_DETAIL && (
          <PendingTransactionDisplay transactions={transactions} hide={hide} />
        )}
      <WalletScreenCurrent network={walletStore.navState.network} />
      {!hideFooter && <WalletFooter />}
    </Flex>
  );
};

export const Wallet = observer(WalletPresenter);
