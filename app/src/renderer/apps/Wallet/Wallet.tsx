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

import { useTrayApps } from '../store';
import { PendingTransactionDisplay } from './components/Transaction/Pending';
import { WalletFooter } from './components/WalletFooter/WalletFooter';
import { WalletHeader } from './components/WalletHeader/WalletHeader';
import { getTransactions } from './helpers';
import { CreateWalletScreen } from './screens/CreateWalletScreen/CreateWalletScreen';
import { DetailScreen } from './screens/DetailScreen';
import { LockedScreen } from './screens/LockedScreen';
import { NFTDetailScreen } from './screens/NFTDetailScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { WalletListScreen } from './screens/WalletListScreen';
import { WalletSettingsScreen } from './screens/WalletSettingsScreen';
import { WalletScreen } from './types';
import { WalletAppNew } from './WalletNew';

const WalletScreens: Record<
  WalletScreen,
  (props: { network: NetworkType }) => JSX.Element
> = {
  [WalletScreen.LIST]: () => <WalletListScreen />,
  [WalletScreen.WALLET_DETAIL]: () => <DetailScreen />,
  [WalletScreen.TRANSACTION_SEND]: () => <DetailScreen />,
  [WalletScreen.TRANSACTION_DETAIL]: () => <TransactionDetailScreen />,
  [WalletScreen.NEW]: () => <WalletAppNew />,
  [WalletScreen.TRANSACTION_CONFIRM]: () => <div />,
  [WalletScreen.CREATE_WALLET]: ({ network }) => (
    <CreateWalletScreen network={network} />
  ),
  [WalletScreen.LOCKED]: () => <LockedScreen />,
  [WalletScreen.SETTINGS]: () => <WalletSettingsScreen />,
  [WalletScreen.NFT_DETAIL]: () => <NFTDetailScreen />,
};

const WalletAppPresenter = () => {
  const [hidePending, setHidePending] = useState(true);

  const { dimensions } = useTrayApps();
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
    WalletScreen.NEW,
    WalletScreen.LOCKED,
    WalletScreen.SETTINGS,
  ].includes(walletStore.navState.view);

  const hideHeader = [WalletScreen.LOCKED, WalletScreen.SETTINGS].includes(
    walletStore.navState.view
  );

  const pendingIsVisible = [
    WalletScreen.LIST,
    WalletScreen.WALLET_DETAIL,
    WalletScreen.TRANSACTION_DETAIL,
    WalletScreen.NFT_DETAIL,
  ].includes(walletStore.navState.view);

  const viewComponent: WalletScreen =
    walletStore.navState.view === WalletScreen.TRANSACTION_CONFIRM
      ? WalletScreen.TRANSACTION_SEND
      : walletStore.navState.view;

  const View = WalletScreens[viewComponent];

  return (
    <Flex
      onClick={(evt) => evt.stopPropagation()}
      position="relative"
      height={dimensions.height - 24}
      width="100%"
      flexDirection="column"
      gap={10}
    >
      <WalletHeader
        isOnboarding={WalletScreen.NEW === walletStore.navState.view}
        showBack={walletStore.navState.view !== WalletScreen.LIST}
        network={
          walletStore.navState.network === 'ethereum' ? 'ethereum' : 'bitcoin'
        }
        onAddWallet={() => walletStore.navigate(WalletScreen.CREATE_WALLET)}
        onSetNetwork={(network) => walletStore.setNetwork(network)}
        hide={hideHeader}
      />
      {pendingIsVisible &&
        !hidePending &&
        walletStore.navState.view !== WalletScreen.TRANSACTION_DETAIL && (
          <PendingTransactionDisplay transactions={transactions} hide={hide} />
        )}
      <View network={walletStore.navState.network} />

      <WalletFooter hidden={hideFooter} />
    </Flex>
  );
};

export const WalletApp = observer(WalletAppPresenter);
