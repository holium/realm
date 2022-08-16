import { observer } from 'mobx-react';
import { FC } from 'react';
import { useTrayApps } from 'renderer/logic/apps/store';
import { WalletSettings } from './views/common/Settings';
import { EthDetail } from './views/ethereum/Detail';
import { EthList } from './views/ethereum/List';
import { EthTransaction } from './views/ethereum/Transaction';

export const WalletViews: { [key: string]: any } = {
  'ethereum:list': (props: any) => <EthList {...props} />,
  'ethereum:detail': (props: any) => <EthDetail {...props} />,
  'ethereum:transaction': (props: any) => <EthTransaction {...props} />,
  settings: (props: any) => <WalletSettings {...props} />,
};

export const WalletApp: FC<any> = observer((props: any) => {
  const { walletApp } = useTrayApps();
  const View = WalletViews[walletApp.currentView];
  return <View {...props} />;
});
