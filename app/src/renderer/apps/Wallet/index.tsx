import { useEffect, useMemo, useState } from 'react';
import { Flex } from '@holium/design-system';
import { observer } from 'mobx-react';
import {
  BitcoinWalletType,
  EthWalletType,
  NetworkType,
  WalletView,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../store';

import { getTransactions } from './lib/helpers';
import { CreateWallet } from './views/common/Create';
import { Detail } from './views/common/Detail/Detail';
import { WalletFooter } from './views/common/Footer';
import { WalletHeader } from './views/common/Header';
import { Locked } from './views/common/Locked';
import { EthNew } from './views/common/New';
import { NFTDetail } from './views/common/NFTDetail';
import { WalletSettings } from './views/common/Settings';
import { PendingTransactionDisplay } from './views/common/Transaction/Pending';
import { TransactionDetail } from './views/common/TransactionDetail';
import { WalletList } from './views/List';

const WalletViews: (network: NetworkType) => { [key: string]: any } = (
  network: NetworkType
) => ({
  [WalletView.LIST]: (props: any) => <WalletList {...props} />,
  [WalletView.WALLET_DETAIL]: (props: any) => <Detail {...props} />,
  [WalletView.TRANSACTION_SEND]: (props: any) => <Detail {...props} />,
  [WalletView.TRANSACTION_DETAIL]: (props: any) => (
    <TransactionDetail {...props} />
  ),
  [WalletView.NEW]: (props: any) => <EthNew {...props} />,
  [WalletView.CREATE_WALLET]: () => <CreateWallet network={network} />,
  [WalletView.LOCKED]: (props: any) => <Locked {...props} />,
  [WalletView.SETTINGS]: (props: any) => <WalletSettings {...props} />,
  [WalletView.NFT_DETAIL]: (props: any) => <NFTDetail {...props} />,
});

const WalletAppPresenter = (props: any) => {
  const [hidePending, setHidePending] = useState(true);

  const { dimensions } = useTrayApps();
  const { walletStore } = useShipStore();
  let transactions: any = [];
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
  const pending = transactions.filter(
    (tx: any) => tx.status === 'pending'
  ).length;

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
    WalletView.NEW,
    WalletView.LOCKED,
    WalletView.SETTINGS,
  ].includes(walletStore.navState.view);

  const hideHeader = [WalletView.LOCKED, WalletView.SETTINGS].includes(
    walletStore.navState.view
  );

  const pendingIsVisible = [
    WalletView.LIST,
    WalletView.WALLET_DETAIL,
    WalletView.TRANSACTION_DETAIL,
    WalletView.NFT_DETAIL,
  ].includes(walletStore.navState.view);

  const viewComponent: WalletView =
    walletStore.navState.view === WalletView.TRANSACTION_CONFIRM
      ? WalletView.TRANSACTION_SEND
      : walletStore.navState.view;
  const View = useMemo(() => {
    return WalletViews(walletStore.navState.network)[viewComponent];
  }, [viewComponent]);

  return (
    <Flex
      onClick={(evt: any) => evt.stopPropagation()}
      position="relative"
      height={dimensions.height - 24}
      width="100%"
      flexDirection="column"
    >
      <WalletHeader
        isOnboarding={WalletView.NEW === walletStore.navState.view}
        showBack={walletStore.navState.view !== WalletView.LIST}
        network={
          walletStore.navState.network === 'ethereum' ? 'ethereum' : 'bitcoin'
        }
        onAddWallet={async () =>
          await walletStore.navigate(WalletView.CREATE_WALLET)
        }
        onSetNetwork={async (network: any) =>
          await walletStore.setNetwork(network)
        }
        hide={hideHeader}
      />
      {pendingIsVisible &&
        !hidePending &&
        walletStore.navState.view !== WalletView.TRANSACTION_DETAIL && (
          <PendingTransactionDisplay transactions={transactions} hide={hide} />
        )}
      <View {...props} hidePending={hidePending} />
      <WalletFooter hidden={hideFooter} />
    </Flex>
  );
};

export const WalletApp = observer(WalletAppPresenter);
