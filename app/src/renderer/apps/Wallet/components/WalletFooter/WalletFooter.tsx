import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../types';
import { WalletFooterView } from './WalletFooterView';

type Props = {
  hidden?: boolean;
};

export const WalletFooterPresenter = ({ hidden = false }: Props) => {
  const { walletStore } = useShipStore();

  return (
    <WalletFooterView
      hidden={hidden}
      protocol={walletStore.navState.protocol}
      onClickSettings={() => walletStore.navigate(WalletScreen.SETTINGS)}
    />
  );
};

export const WalletFooter = observer(WalletFooterPresenter);
