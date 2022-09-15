import { observer } from 'mobx-react';
import { ThemeProvider } from 'styled-components';
import { FC, useEffect, useState } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { WalletSettings } from './views/common/Settings';
import { EthDetail } from './views/ethereum/Detail';
import { Detail } from './views/common/Detail';
import { WalletList } from './views/ethereum/List';
import { EthTransaction } from './views/ethereum/Transaction';
import { EthNew } from './views/common/New';
import { WalletNetwork } from './views/common/Network';
import { CreateWallet } from './views/common/Create';
import { WalletHeader } from './views/common/Header';
import { useServices } from 'renderer/logic/store';
import { constructSampleWallet, wallet } from './store';
import { Flex } from 'renderer/components';
import { WalletActions } from '../../logic/actions/wallet';
import { NetworkType, WalletView } from 'os/services/tray/wallet.model';
import {
  PendingTransactionDisplay
} from './views/common/Detail/PendingTransaction';
import { getTransactions } from './lib/helpers';

export const WalletViews: { [key: string]: any } = {
  'bitcoin:list': (props: any) => <div />,
  'bitcoin:detail': (props: any) => <div />,
  'bitcoin:transaction': (props: any) => <div />,
  'ethereum:list': (props: any) => (
    <WalletList network={NetworkType.ethereum} {...props} />
  ),
  'ethereum:detail': (props: any) => <Detail {...props} />,
  'ethereum:transaction': (props: any) => <EthTransaction {...props} />,
  'ethereum:new': (props: any) => <EthNew {...props} />,
  [WalletView.CREATE_WALLET]: (props: any) => (
    <CreateWallet network={NetworkType.ethereum} />
  ),
  settings: (props: any) => <WalletSettings {...props} />,
};

export const WalletApp: FC<any> = observer((props: any) => {
  const { desktop } = useServices();
  const { walletApp } = useTrayApps();

  let wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!);
  let transactions = getTransactions(walletApp.ethereum.transactions, wallet!.address);

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
        theme={desktop.theme}
        network={walletApp.network}
        onAddWallet={() => WalletActions.setView(WalletView.CREATE_WALLET)}
        onSetNetwork={(network: any) => WalletActions.setNetwork(network)}
        hide={walletApp.currentView === 'ethereum:new'}
      />
      <PendingTransactionDisplay transactions={transactions} />
      <View {...props} />
      <WalletNetwork
        hidden={walletApp.currentView === 'ethereum:new'}
        theme={desktop.theme}
      />
    </Flex>
  );
});
