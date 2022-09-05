import { observer } from 'mobx-react';
import { FC, useEffect } from 'react';
import { useTrayApps } from 'renderer/logic/apps/store';
import { WalletSettings } from './views/common/Settings';
import { EthDetail } from './views/ethereum/Detail';
import { EthList } from './views/ethereum/List';
import { EthTransaction } from './views/ethereum/Transaction';

import { WalletHeader } from './views/common/Header';
import { useServices } from 'renderer/logic/store';
import { constructSampleWallet, wallet } from './store';
import { Flex } from 'renderer/components';
import { WalletActions } from '../../logic/actions/wallet';

export const WalletViews: { [key: string]: any } = {
  'bitcoin:list': (props: any) => <div />,
  'bitcoin:detail': (props: any) => <div />,
  'bitcoin:transaction': (props: any) => <div />,
  'ethereum:list': (props: any) => <EthList {...props} />,
  'ethereum:detail': (props: any) => <EthDetail {...props} />,
  'ethereum:transaction': (props: any) => <EthTransaction {...props} />,
  settings: (props: any) => <WalletSettings {...props} />,
};

export const WalletApp: FC<any> = observer((props: any) => {
  const { desktop } = useServices();
  const { walletApp } = useTrayApps();
  const onAddWallet = () => {
    WalletActions.createWallet('~zod', walletApp.network);
  };

  const View = WalletViews[walletApp.currentView];
  return (
    <Flex flexDirection="column">
      <WalletHeader
        theme={desktop.theme}
        network={walletApp.network}
        onAddWallet={onAddWallet}
        onSetNetwork={(network: any) => {
          walletApp.setNetwork(network);
        }}
      />
      <View {...props} />
    </Flex>
  );
});
