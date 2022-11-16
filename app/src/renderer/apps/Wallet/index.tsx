import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { WalletSettings } from './views/common/Settings';
import { Detail } from './views/common/Detail';
import { WalletList } from './views/ethereum/List';
import { TransactionDetail } from './views/common/TransactionDetail';
import { EthNew } from './views/common/New';
import { WalletFooter } from './views/common/Footer';
import { CreateWallet } from './views/common/Create';
import { NFTDetail } from './views/common/NFTDetail';
import Locked from './views/common/Locked';
import { WalletHeader } from './views/common/Header';
import { useServices } from 'renderer/logic/store';
import { Flex } from 'renderer/components';
import { WalletActions } from '../../logic/actions/wallet';
import { NetworkType, WalletView } from 'os/services/tray/wallet.model';
import { PendingTransactionDisplay } from './views/common/Transaction/Pending';
import { getTransactions } from './lib/helpers';

const WalletViews: (network: NetworkType) => { [key: string]: any } = (
  network: NetworkType
) => ({
  [WalletView.LIST]: (props: any) => <WalletList {...props} />,
  [WalletView.WALLET_DETAIL]: (props: any) => <Detail {...props} />,
  [WalletView.TRANSACTION_DETAIL]: (props: any) => (
    <TransactionDetail {...props} />
  ),
  [WalletView.NEW]: (props: any) => <EthNew {...props} />,
  [WalletView.CREATE_WALLET]: (props: any) => (
    <CreateWallet network={network} />
  ),
  [WalletView.LOCKED]: (props: any) => <Locked {...props} />,
  [WalletView.SETTINGS]: (props: any) => <WalletSettings {...props} />,
  [WalletView.NFT_DETAIL]: (props: any) => <NFTDetail {...props} />,
});

export const WalletApp: FC<any> = observer((props: any) => {
  const { theme } = useServices();
  const [hidePending, setHidePending] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  const { walletApp } = useTrayApps();
  let transactions: any = [];
  for (const key of walletApp.currentStore.wallets.keys()) {
    const walletTransactions = getTransactions(
      walletApp.currentStore.wallets
        .get(key)!
        .transactions.get(walletApp.currentStore.network!) || new Map()
    );
    transactions = [...walletTransactions, ...transactions];
  }
  useEffect(() => {
    if (transactions.length !== transactionCount) {
      setTransactionCount(transactions.length);
      setHidePending(false);
    }
  }, [transactions]);

  const hide = () => {
    setHidePending(true);
  };

  const hideHeaderFooter = [
    WalletView.NEW,
    WalletView.LOCKED,
    WalletView.SETTINGS,
  ].includes(walletApp.navState.view);
  const View = WalletViews(walletApp.navState.network)[walletApp.navState.view];

  return (
    <Flex
      onClick={(evt: any) => evt.stopPropagation()}
      position="relative"
      height="100%"
      width="100%"
      flexDirection="column"
    >
      <WalletHeader
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
        hide={hideHeaderFooter}
      />
      {!hidePending &&
        walletApp.navState.view !== WalletView.TRANSACTION_DETAIL && (
          <PendingTransactionDisplay transactions={transactions} hide={hide} />
        )}
      <View {...props} hidePending={hidePending} />
      <WalletFooter hidden={hideHeaderFooter} />
    </Flex>
  );
});
