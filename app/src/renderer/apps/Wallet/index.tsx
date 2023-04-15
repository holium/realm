import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import {
  BitcoinWalletType,
  EthWalletType,
  NetworkType,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

import { WalletActions } from '../../logic/actions/wallet';

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
  const { theme } = useServices();
  const [hidePending, setHidePending] = useState(true);

  const { walletApp, dimensions } = useTrayApps();
  let transactions: any = [];
  for (const key of walletApp.currentStore.wallets.keys()) {
    const wallet = walletApp.currentStore.wallets.get(key);
    if (!wallet) continue;
    const walletTransactions = getTransactions(
      (walletApp.navState.network === NetworkType.ETHEREUM
        ? (wallet as EthWalletType).data.get(walletApp.navState.protocol)
            ?.transactionList.transactions
        : (wallet as BitcoinWalletType).transactionList.transactions) ||
        new Map()
    );
    if (walletApp.navState.network === NetworkType.ETHEREUM) {
      for (const key of walletApp.currentStore.wallets.keys()) {
        const coinKeys = (
          walletApp.currentStore.wallets.get(key) as EthWalletType
        ).data
          .get(walletApp.navState.protocol)
          ?.coins.keys();
        if (!coinKeys) continue;

        for (const coin of coinKeys) {
          const coinTransactions = (
            walletApp.currentStore.wallets.get(key) as EthWalletType
          ).data
            .get(walletApp.navState.protocol)
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
  ].includes(walletApp.navState.view);

  const hideHeader = [WalletView.LOCKED, WalletView.SETTINGS].includes(
    walletApp.navState.view
  );

  const pendingIsVisible = [
    WalletView.LIST,
    WalletView.WALLET_DETAIL,
    WalletView.TRANSACTION_DETAIL,
    WalletView.NFT_DETAIL,
  ].includes(walletApp.navState.view);

  const viewComponent: WalletView =
    walletApp.navState.view === WalletView.TRANSACTION_CONFIRM
      ? WalletView.TRANSACTION_SEND
      : walletApp.navState.view;
  const View = useMemo(() => {
    return WalletViews(walletApp.navState.network)[viewComponent];
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
        isOnboarding={WalletView.NEW === walletApp.navState.view}
        showBack={walletApp.navState.view !== WalletView.LIST}
        theme={theme.currentTheme}
        network={
          walletApp.navState.network === 'ethereum' ? 'ethereum' : 'bitcoin'
        }
        onAddWallet={async () =>
          await WalletActions.navigate(WalletView.CREATE_WALLET)
        }
        onSetNetwork={async (network: any) =>
          await WalletActions.setNetwork(network)
        }
        hide={hideHeader}
      />
      {pendingIsVisible &&
        !hidePending &&
        walletApp.navState.view !== WalletView.TRANSACTION_DETAIL && (
          <PendingTransactionDisplay transactions={transactions} hide={hide} />
        )}
      <View {...props} hidePending={hidePending} />
      <WalletFooter hidden={hideFooter} />
    </Flex>
  );
};

export const WalletApp = observer(WalletAppPresenter);
