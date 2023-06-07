import { observer } from 'mobx-react';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import { useShipStore } from 'renderer/stores/ship.store';

import { WalletHeaderView } from './WalletHeaderView';

type Props = {
  showBack: boolean;
  isOnboarding: boolean;
  network: NetworkType | string;
  onSetNetwork: (network: NetworkType) => void;
  onAddWallet: () => void;
};

const WalletHeaderPresenter = ({
  showBack,
  isOnboarding,
  onAddWallet,
}: Props) => {
  const { walletStore } = useShipStore();

  return (
    <WalletHeaderView
      showBack={showBack}
      isOnboarding={isOnboarding}
      onAddWallet={onAddWallet}
      onClickBack={walletStore.navigateBack}
    />
  );
};

export const WalletHeader = observer(WalletHeaderPresenter);
