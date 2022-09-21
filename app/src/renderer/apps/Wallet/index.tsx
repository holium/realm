import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { WalletSettings } from './views/common/Settings';
import { Detail } from './views/common/Detail';
import { WalletList } from './views/ethereum/List';
import { TransactionDetail } from './views/common/TransactionDetail';
import { EthNew } from './views/common/New';
import { WalletNetwork } from './views/common/Network';
import { CreateWallet } from './views/common/Create';
import { ListPlaceholder } from './views/bitcoin/ListPlaceholder';
import { WalletHeader } from './views/common/Header';
import { useServices } from 'renderer/logic/store';
import { Flex } from 'renderer/components';
import { WalletActions } from '../../logic/actions/wallet';
import { NetworkType, WalletView } from 'os/services/tray/wallet.model';
import {
  PendingTransactionDisplay
} from './views/common/Detail/PendingTransaction';
import { getTransactions } from './lib/helpers';

const WalletViews: { [key: string]: any } = {
  'bitcoin:list': (props: any) => <ListPlaceholder {...props} />,
  'bitcoin:detail': (props: any) => <div />,
  'bitcoin:transaction': (props: any) => <div />,
  'ethereum:list': (props: any) => (
    <WalletList network={NetworkType.ethereum} {...props} />
  ),
  'ethereum:detail': (props: any) => <Detail {...props} />,
  [WalletView.TRANSACTION_DETAIL]: (props: any) => <TransactionDetail {...props} />,
  'ethereum:new': (props: any) => <EthNew {...props} />,
  [WalletView.CREATE_WALLET]: (props: any) => (
    <CreateWallet network={NetworkType.ethereum} />
  ),
  settings: (props: any) => <WalletSettings {...props} />,
};

export const WalletApp: FC<any> = observer((props: any) => {
  const { theme } = useServices();
  let [hidePending, setHidePending] = useState(false);
  let [transactionCount, setTransactionCount] = useState(0);

  const { walletApp } = useTrayApps();
  let transactions = getTransactions(walletApp.ethereum.transactions);
  useEffect(() => {
    if (transactions.length !== transactionCount) {
      setTransactionCount(transactions.length);
      setHidePending(false);
    }
  }, [transactions]);
  let hide = () => {
    console.log('clickey')
    setHidePending(true)
  };

  let View = WalletViews[walletApp.currentView];

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
        network={walletApp.network}
        onAddWallet={() => WalletActions.setView(WalletView.CREATE_WALLET)}
        onSetNetwork={(network: any) => WalletActions.setNetwork(network)}
        hide={walletApp.currentView === 'ethereum:new'}
      />
      {(!hidePending && walletApp.currentView !== WalletView.TRANSACTION_DETAIL) && <PendingTransactionDisplay transactions={transactions} hide={hide} />}
      <View {...props } hidePending={hidePending} />
      <WalletNetwork hidden={walletApp.currentView === 'ethereum:new'} />
    </Flex>
  );
});
