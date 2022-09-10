import { observer } from 'mobx-react';
import { ThemeProvider } from 'styled-components';
import { FC, useEffect, useState } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { WalletSettings } from './views/common/Settings';
import { EthDetail } from './views/ethereum/Detail';
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

export const WalletViews: { [key: string]: any } = {
  'bitcoin:list': (props: any) => <div />,
  'bitcoin:detail': (props: any) => <div />,
  'bitcoin:transaction': (props: any) => <div />,
  'ethereum:list': (props: any) => <WalletList network={NetworkType.ethereum} {...props} />,
  'ethereum:detail': (props: any) => <EthDetail {...props} />,
  'ethereum:transaction': (props: any) => <EthTransaction {...props} />,
  'ethereum:new': (props: any) => <EthNew {...props} />,
  [WalletView.CREATE_WALLET]: (props: any) => <CreateWallet network={NetworkType.ethereum} />,
  settings: (props: any) => <WalletSettings {...props} />,
};

export const WalletApp: FC<any> = observer((props: any) => {
  const { desktop } = useServices();
  const { walletApp } = useTrayApps();
  const onAddWallet = () => {
    // WalletActions.createWallet('~zod', walletApp.network);
  };

  const View = WalletViews[walletApp.currentView];
  // const View = WalletViews[WalletView.CREATE_WALLET]
  return (
      <Flex position="relative" height="100%" width="100%" flexDirection="column">
        <WalletHeader
          theme={desktop.theme}
          network={walletApp.network}
          onAddWallet={() => WalletActions.setView(WalletView.CREATE_WALLET)}
          onSetNetwork={(network: any) => {
            walletApp.setNetwork(network);
          }}
          hide={walletApp.currentView === 'ethereum:new'}
        />
        <View {...props} />
        <WalletNetwork hidden={walletApp.currentView === 'ethereum:new'} theme={desktop.theme} />
      </Flex>
  );
});
